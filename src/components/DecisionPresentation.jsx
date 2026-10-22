import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import DataQualityBadge from './DataQualityBadge.jsx';

const DecisionPresentation = ({ onClose, inflation, scenarioData, support, readiness, benchmark }) => {
  const closeButton = useRef(null);

  useEffect(() => {
    closeButton.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        event.preventDefault();
        closeButton.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const latestFrance = inflation.data?.inflation?.FR?.at(-1);
  const latestEuroArea = inflation.data?.inflation?.EA20?.at(-1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/95 p-4 text-slate-100 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="presentation-title">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-300">Présentation — exercice éducatif</p>
            <h2 id="presentation-title" className="mt-2 text-3xl font-bold">Lecture décisionnelle conditionnelle</h2>
          </div>
          <button ref={closeButton} type="button" onClick={onClose} className="inline-flex items-center gap-2 rounded-lg border border-slate-500 px-3 py-2 text-sm font-semibold hover:bg-slate-800">
            <X className="h-4 w-4" /> Quitter
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-6 text-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Question</h3>
            <p className="mt-2 text-xl font-semibold">Que montre le scénario, sous ses hypothèses explicites, à l’horizon indiqué ?</p>
          </section>
          <section className="rounded-2xl bg-sky-100 p-6 text-slate-950">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-sky-800">Scénario</h3>
            <p className="mt-2 text-xl font-semibold">{scenarioData.name}</p>
            <p className="mt-2 text-sm">{scenarioData.description}</p>
          </section>
          <section className="rounded-2xl bg-white p-6 text-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Données</h3>
            <p className="mt-2 text-sm">Dernières observations IPCH : France <strong>{latestFrance ? `${latestFrance.value.toFixed(1)} % (${latestFrance.period})` : 'indisponible'}</strong> · EA20 <strong>{latestEuroArea ? `${latestEuroArea.value.toFixed(1)} % (${latestEuroArea.period})` : 'indisponible'}</strong>.</p>
            <DataQualityBadge state={inflation} updatedAt={inflation.data?.updatedAt} definition="IPCH annuel, France et EA20" source="Eurostat" />
          </section>
          <section className="rounded-2xl bg-white p-6 text-slate-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Conclusion conditionnelle</h3>
            <p className="mt-2 text-lg font-semibold">{support.conditionalOutput}</p>
            <p className="mt-2 text-sm text-slate-600">Revue humaine obligatoire ; aucune autorité décisionnelle n’est attribuée à cette interface.</p>
          </section>
          <section className="rounded-2xl bg-amber-50 p-6 text-amber-950 md:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-amber-800">Incertitudes et limites</h3>
            <p className="mt-2">{benchmark ? `Écart modèle/repère de persistance : ${benchmark.disagreement.toFixed(2)} point. ${benchmark.explanation}` : 'La comparaison de prévisions est indisponible sans calibration.'}</p>
            <p className="mt-2">{readiness.eligible ? 'Les garde-fous affichés sont satisfaits à cette consultation.' : 'Les garde-fous ne sont pas tous satisfaits : aucune recommandation n’est produite.'} Les résultats restent heuristiques et non certifiés.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DecisionPresentation;
