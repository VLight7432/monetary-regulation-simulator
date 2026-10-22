import React, { useMemo } from 'react';
import { Download, X } from 'lucide-react';
import { saveAs } from 'file-saver';
import { buildPilotDemoBriefing, formatPilotDemoBriefing, pilotDemoPreset } from '../utils/pilotDemo.js';

const sourceLabel = (quality, updatedAt) => `${quality.label}${updatedAt ? ` · millésime : ${new Date(updatedAt).toLocaleDateString('fr-FR')}` : ' · millésime indisponible'}`;

const PilotDemo = ({ onClose, initialState, parameters, inflation, unemployment }) => {
  const briefing = useMemo(() => buildPilotDemoBriefing({
    initialState,
    parameters,
    inflationSource: inflation,
    unemploymentSource: unemployment
  }), [inflation, initialState, parameters, unemployment]);

  const exportBriefing = () => {
    const content = formatPilotDemoBriefing(briefing, {
      inflationUpdatedAt: inflation.data?.updatedAt,
      unemploymentUpdatedAt: unemployment.data?.updatedAt
    });
    saveAs(new Blob([content], { type: 'text/plain;charset=utf-8;' }), 'briefing-pilot-demo-energie-12-mois.txt');
  };

  const metrics = [
    ['Inflation', `${briefing.comparison.delta.inflation >= 0 ? '+' : ''}${briefing.comparison.delta.inflation.toFixed(1)} point`, 'Écart simulé : protection sociale vs référence'],
    ['Inégalités', `${briefing.comparison.delta.inequality >= 0 ? '+' : ''}${briefing.comparison.delta.inequality.toFixed(0)} point`, 'Indice synthétique, pas une mesure observée'],
    ['Emploi', 'Non simulé', 'À instruire avec chômage observé et analyse sectorielle']
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 p-4 text-slate-100 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="pilot-demo-title">
      <div className="mx-auto max-w-5xl pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Pilot demo · parcours contraint</p>
            <h2 id="pilot-demo-title" className="mt-2 text-3xl font-bold">Choc des prix de l’énergie — France, Europe, monde</h2>
            <p className="mt-2 max-w-3xl text-slate-300">Prototype transparent d’appui éducatif pour élus et collaborateurs parlementaires. Il ne produit ni avis certifié, ni recommandation, ni décision.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={exportBriefing} className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-sky-400"><Download className="h-4 w-4" /> Exporter le briefing</button>
            <button type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-slate-500 px-3 py-2 text-sm font-semibold hover:bg-slate-800"><X className="h-4 w-4" /> Quitter</button>
          </div>
        </div>

        <section className="mt-6 rounded-2xl bg-white p-6 text-slate-900">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Question de travail</h3>
          <p className="mt-2 text-xl font-semibold">{pilotDemoPreset.question}</p>
          <p className="mt-3 text-sm text-slate-600"><strong>Preset stable :</strong> {briefing.scenario.name} · choc énergie au mois 3 · horizon fixe de 12 mois · comparaison Référence / {briefing.alternative.name}.</p>
        </section>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <section className="rounded-2xl bg-sky-100 p-6 text-slate-950">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-800">Hypothèses explicites</h3>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">{pilotDemoPreset.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
          </section>
          <section className="rounded-2xl bg-slate-100 p-6 text-slate-950">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Éléments disponibles et fraîcheur</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><strong>Inflation France / zone euro :</strong> {sourceLabel(briefing.inflationQuality, inflation.data?.updatedAt)}.</li>
              <li><strong>Emploi France / UE27 :</strong> {sourceLabel(briefing.unemploymentQuality, unemployment.data?.updatedAt)}.</li>
              <li><strong>Monde :</strong> comparaisons annuelles accessibles dans « Données observées » ; non mélangées à la simulation mensuelle.</li>
            </ul>
          </section>
        </div>

        <section className="mt-5 rounded-2xl bg-white p-6 text-slate-900">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Lecture conditionnelle à 12 mois</h3>
          <p className="mt-2 text-sm text-slate-700">Si les hypothèses du preset se vérifiaient, les valeurs ci-dessous décriraient uniquement des écarts entre deux réglages du modèle ; elles ne démontrent pas un effet causal.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">{metrics.map(([label, value, detail]) => <article key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p><p className="mt-1 text-xs text-slate-600">{detail}</p></article>)}</div>
        </section>

        <section className="mt-5 rounded-2xl bg-amber-50 p-6 text-amber-950">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800">Incertitude et prochaine décision</h3>
          <p className="mt-2 text-sm">{pilotDemoPreset.limitations}</p>
          <p className="mt-4 rounded-lg bg-white/70 p-3 text-base font-semibold">{briefing.nextDecisionQuestion}</p>
          <p className="mt-3 text-xs">Les scénarios personnalisés, politiques, données et méthodes détaillées restent disponibles après la sortie du pilot demo.</p>
        </section>
      </div>
    </div>
  );
};

export default PilotDemo;
