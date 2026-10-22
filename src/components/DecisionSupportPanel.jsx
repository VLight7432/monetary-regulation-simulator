import React, { useMemo, useState } from 'react';
import { Download, ShieldAlert, UserRoundCheck } from 'lucide-react';
import { saveAs } from 'file-saver';
import { policyOptions } from '../data/policyOptions.js';
import { appendAuditEntry, createAuditEntry, loadAuditTrail } from '../utils/auditTrail.js';
import {
  buildDecisionSupport,
  buildForecastBenchmark,
  evaluateDecisionReadiness
} from '../utils/decisionSupport.js';
import { causalAssumptionRegistry, hicpContextMetadata } from '../utils/comparisonGovernance.js';

const DecisionSupportPanel = ({
  inflation,
  calibration,
  backtest,
  currentState,
  parameters,
  scenarioData
}) => {
  const [entries, setEntries] = useState(() => loadAuditTrail());
  const readiness = useMemo(() => evaluateDecisionReadiness({
    sourceStatus: inflation.status,
    sourceUpdatedAt: inflation.data?.updatedAt,
    dataMetadata: hicpContextMetadata,
    calibration,
    backtest
  }), [backtest, calibration, inflation.data?.updatedAt, inflation.status]);
  const benchmark = useMemo(() => buildForecastBenchmark(calibration), [calibration]);
  const support = useMemo(() => buildDecisionSupport({
    readiness,
    benchmark,
    currentState,
    parameters,
    scenarioName: scenarioData.name,
    alternatives: policyOptions.filter(({ id }) => id !== 'reference').map(({ name, description }) => ({ name, description }))
  }), [benchmark, currentState, parameters, readiness, scenarioData.name]);

  const record = () => {
    const nextEntries = appendAuditEntry(createAuditEntry({
      scenario: scenarioData.name,
      parameters,
      sourceUpdatedAt: inflation.data?.updatedAt,
      recommendation: support.conditionalOutput,
      eligible: support.eligible
    }));
    if (nextEntries) setEntries(nextEntries);
  };

  const exportAudit = () => saveAs(
    new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' }),
    'journal-audit-local.json'
  );

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-xl bg-sky-100 p-2 text-sky-700"><UserRoundCheck className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Appui transparent à la décision</h2>
            <p className="mt-1 text-sm text-slate-600">Prototype éducatif, conditionnel et soumis à une revue humaine explicite.</p>
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${support.eligible ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'}`}>
          {support.eligible ? 'Sortie conditionnelle disponible' : 'Recommandation bloquée'}
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-950">
        <strong>Revue humaine obligatoire — </strong>{support.conditionalOutput} Cette interface n’a aucune autorité décisionnelle autonome et ne constitue pas une certification.
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4 text-sm">
          <h3 className="font-semibold text-slate-900">Horizon, hypothèses et alternatives</h3>
          <p className="mt-2 text-slate-700"><strong>Horizon :</strong> {support.horizon}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-600">{support.assumptions.map((assumption) => <li key={assumption}>{assumption}</li>)}</ul>
          <div className="mt-3 text-slate-700"><strong>Alternatives à examiner :</strong> {support.alternatives.map(({ name }) => name).join(' ; ')}.</div>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
          <h3 className="font-semibold">Contrôle indépendant à un mois</h3>
          {benchmark ? <>
            <p className="mt-2">Modèle calibré : <strong>{benchmark.calibrated.toFixed(2)} %</strong> · repère de persistance : <strong>{benchmark.persistence.toFixed(2)} %</strong>.</p>
            <p className="mt-2">Écart : <strong>{benchmark.disagreement.toFixed(2)} point</strong> ({benchmark.materialDisagreement ? 'matériel' : 'limité'} à partir de 0,50 point).</p>
            <p className="mt-2 text-xs">{benchmark.explanation}</p>
          </> : <p className="mt-2">Contrôle indisponible sans calibration.</p>}
          <p className="mt-3 font-medium">Risque / incertitude : {support.risk}</p>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 p-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900"><ShieldAlert className="h-4 w-4" /> Garde-fous conservateurs</h3>
        <ul className="mt-3 grid gap-2 text-xs text-slate-700 md:grid-cols-2">
          {readiness.checks.map(({ id, label, passed }) => <li key={id} className={passed ? 'text-emerald-700' : 'text-red-700'}>{passed ? '✓' : '✕'} {label}</li>)}
        </ul>
        {readiness.ageInDays !== null && <p className="mt-3 text-xs text-slate-500">Âge calculé du millésime Eurostat : {readiness.ageInDays.toFixed(1)} jours.</p>}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Registre des hypothèses causales du modèle</h3>
        <p className="mt-1 text-xs text-slate-600">Relations programmées pour l’exercice ; elles ne prouvent pas une causalité économique.</p>
        <table className="mt-3 w-full min-w-180 text-left text-xs text-slate-700">
          <thead className="border-b text-slate-500"><tr><th className="p-2">Indicateur</th><th className="p-2">Sortie</th><th className="p-2">Sens / délai</th><th className="p-2">Statut et limite</th></tr></thead>
          <tbody>{causalAssumptionRegistry.map((entry) => <tr key={entry.input} className="border-b last:border-0"><td className="p-2">{entry.input}</td><td className="p-2">{entry.output}</td><td className="p-2">{entry.direction}<br />{entry.lag}</td><td className="p-2">{entry.evidence}<br />{entry.limitation}</td></tr>)}</tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button type="button" onClick={record} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">Enregistrer dans le journal local</button>
        <button type="button" onClick={exportAudit} disabled={!entries.length} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"><Download className="h-4 w-4" /> Exporter le journal ({entries.length})</button>
        <p className="text-xs text-slate-500">Journal conservé uniquement dans le stockage local de ce navigateur (maximum 50 entrées), sans serveur, authentification ni garantie de conservation.</p>
      </div>
    </section>
  );
};

export default DecisionSupportPanel;
