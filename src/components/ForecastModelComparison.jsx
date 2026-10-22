import React from 'react';
import { GitCompareArrows, ShieldAlert } from 'lucide-react';
import DataQualityBadge from './DataQualityBadge.jsx';

const ForecastModelComparison = ({ comparison, sourceStatus, sourceUpdatedAt }) => {
  const unavailable = sourceStatus !== 'ready' || !comparison;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex gap-3">
        <div className="rounded-xl bg-violet-100 p-2 text-violet-700"><GitCompareArrows className="h-5 w-5" /></div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Comparaison de modèles et ensemble</h2>
          <p className="mt-1 text-sm text-slate-600">Prévisions IPCH France à un mois, construites uniquement avec les séries France–EA20 communes d’Eurostat.</p>
        </div>
      </div>
      {unavailable ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Comparaison indisponible tant que les données Eurostat ne sont pas prêtes.</p> : <>
        <div className="mt-4 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-950">
          {comparison.ensemble.status === 'available' ? <>
            <strong>Ensemble (erreurs récentes) : {comparison.ensemble.point.toFixed(2)} %</strong>
            <span> · enveloppe des modèles : {comparison.ensemble.lowerBound.toFixed(2)} % à {comparison.ensemble.upperBound.toFixed(2)} %</span>
            <span> · désaccord : {comparison.ensemble.disagreement.toFixed(2)} point.</span>
          </> : <strong>Ensemble indisponible : {comparison.ensemble.reason}</strong>}
          <p className="mt-2 text-xs">Les poids sont l’inverse de l’erreur absolue moyenne des 12 dernières origines de backtest, normalisé entre les seuls modèles ayant au moins 12 prévisions rétrospectives. L’enveloppe exprime le désaccord, pas une probabilité.</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-220 text-left text-xs text-slate-700">
            <thead className="border-b text-slate-500"><tr><th className="p-2">Modèle / statut</th><th className="p-2">Prévision / enveloppe</th><th className="p-2">Backtest</th><th className="p-2">Poids</th><th className="p-2">Limite</th></tr></thead>
            <tbody>{comparison.models.map((model) => <tr key={model.id} className="border-b align-top last:border-0">
              <td className="p-2 font-medium">{model.label}<br /><span className={model.status === 'available' ? 'text-emerald-700' : 'text-amber-700'}>{model.status === 'available' ? 'Disponible' : `Indisponible — ${model.reason}`}</span></td>
              <td className="p-2">{model.forecast ? `${model.forecast.point.toFixed(2)} % (${model.forecast.lowerBound.toFixed(2)} à ${model.forecast.upperBound.toFixed(2)} %)` : '—'}</td>
              <td className="p-2">{model.backtest ? <>MAE récente {model.backtest.recentMeanAbsoluteError.toFixed(2)} ({model.backtest.recentObservationCount} origines)<br />MAE totale {model.backtest.meanAbsoluteError.toFixed(2)} · biais {model.backtest.meanBias.toFixed(2)} · couverture 80 % {model.backtest.intervalCoverage.toFixed(0)} %</> : 'Non calculable'}</td>
              <td className="p-2">{model.weight === null ? 'Non pondéré' : `${(model.weight * 100).toFixed(0)} %`}</td>
              <td className="p-2">{model.limitation}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </>}
      <DataQualityBadge state={{ status: sourceStatus }} updatedAt={sourceUpdatedAt} definition="IPCH annuel, France et EA20" source="Eurostat" />
      <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><ShieldAlert className="h-5 w-5 shrink-0" /><p><strong>Revue humaine obligatoire.</strong> Ces sorties locales sont pédagogiques, non institutionnelles et ne sont ni des prévisions officielles ni une recommandation de politique. Le prototype multivarié n’est explicitement pas un BVAR ; son contrat permet son remplacement ultérieur par un BVAR serveur correctement estimé.</p></div>
    </section>
  );
};

export default ForecastModelComparison;
