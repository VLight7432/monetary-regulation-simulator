import React, { useMemo, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { annualIndicators, comparisonPairs, alignAnnualSeries } from '../services/annualComparison.js';
import { useAnnualComparison } from '../hooks/useAnnualComparison.js';
import { assessComparisonQuality, validateAnnualComparison } from '../utils/comparisonGovernance.js';
import DataQualityBadge from './DataQualityBadge.jsx';

const date = (value) => (value ? new Date(value).toLocaleDateString('fr-FR') : 'non communiqué');
const display = (value) => value.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

const AnnualComparisonDashboard = () => {
  const [pairId, setPairId] = useState('franceEurope');
  const [indicatorId, setIndicatorId] = useState('inflation');
  const [view, setView] = useState('latest');
  const comparison = useAnnualComparison(pairId, indicatorId);
  const points = useMemo(() => (
    alignAnnualSeries(
      comparison.data?.series?.[comparison.config.pair.geos[0]],
      comparison.data?.series?.[comparison.config.pair.geos[1]]
    )
  ), [comparison.data, comparison.config.pair.geos]);
  const latest = points.at(-1);
  const quality = useMemo(
    () => assessComparisonQuality(points, comparison.data?.updatedAt),
    [comparison.data?.updatedAt, points]
  );

  return (
    <section className="mb-6 rounded-2xl border border-sky-200 bg-white p-6 shadow-lg">
      <div className="flex gap-3">
        <div className="rounded-xl bg-sky-100 p-2 text-sky-700"><BarChart3 className="h-5 w-5" /></div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Comparaison économique annuelle</h2>
          <p className="mt-1 text-sm text-slate-600">Mode distinct du simulateur : seules les observations annuelles de même période sont comparées.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <label className="text-sm font-medium text-slate-700">Périmètre
          <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2" value={pairId} onChange={(event) => setPairId(event.target.value)}>
            {Object.entries(comparisonPairs).map(([id, pair]) => <option key={id} value={id}>{pair.label}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Indicateur
          <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2" value={indicatorId} onChange={(event) => setIndicatorId(event.target.value)}>
            {Object.entries(annualIndicators).map(([id, indicator]) => (
              <option key={id} value={id} disabled={!validateAnnualComparison(pairId, id).compatible}>
                {indicator.label}{validateAnnualComparison(pairId, id).compatible ? '' : ' — non comparable'}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Vue
          <select className="mt-1 block w-full rounded-lg border border-slate-300 bg-white p-2" value={view} onChange={(event) => setView(event.target.value)}>
            <option value="latest">Dernier contexte aligné</option>
            <option value="historical">Historique annuel (10 ans)</option>
          </select>
        </label>
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <span className="font-semibold">Définition : </span>{comparison.config.indicator.label} · <span className="font-semibold">Fréquence : </span>annuelle · <span className="font-semibold">Unité : </span>{comparison.config.indicator.unit}
        <p className="mt-1 text-xs text-slate-600"><strong>Géographies :</strong> {comparison.config.pair.left} / {comparison.config.pair.right}. {comparison.config.scope}</p>
      </div>
      {comparison.status === 'loading' && <p className="mt-4 text-sm text-slate-500">Chargement de la source sélectionnée…</p>}
      {comparison.status === 'unavailable' && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{comparison.config.unavailable}</p>}
      {comparison.status === 'error' && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Source indisponible : {comparison.error.message}
          <button type="button" onClick={comparison.reload} className="ml-3 inline-flex items-center gap-1 font-semibold underline"><RefreshCw className="h-3 w-3" />Réessayer</button>
        </div>
      )}
      {comparison.status === 'ready' && !latest && <p className="mt-4 text-sm text-amber-800">Aucune observation annuelle commune disponible pour cette sélection ; aucune valeur n’est affichée.</p>}
      {comparison.status === 'ready' && latest && view === 'latest' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-blue-50 p-4"><p className="text-xs uppercase text-blue-700">{comparison.config.pair.left} · {latest.period}</p><p className="mt-1 text-2xl font-bold">{display(latest.left)} <span className="text-sm font-normal">{comparison.config.indicator.unit}</span></p></div>
          <div className="rounded-xl bg-violet-50 p-4"><p className="text-xs uppercase text-violet-700">{comparison.config.pair.right} · {latest.period}</p><p className="mt-1 text-2xl font-bold">{display(latest.right)} <span className="text-sm font-normal">{comparison.config.indicator.unit}</span></p></div>
        </div>
      )}
      {comparison.status === 'ready' && latest && view === 'historical' && (
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="period" /><YAxis /><Tooltip /><Legend />
              <Line type="monotone" dataKey="left" stroke="#2563eb" name={comparison.config.pair.left} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="right" stroke="#7c3aed" name={comparison.config.pair.right} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {comparison.status === 'ready' && latest && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
          <strong>Qualité et incertitude de comparaison :</strong> {quality.observationCount} années communes ({quality.periodCoverage}) · {quality.quality}.
          {quality.uncertainty && <span> {quality.uncertainty.label} : {display(quality.uncertainty.lower)} à {display(quality.uncertainty.upper)} {comparison.config.indicator.unit}.</span>}
          <p className="mt-1">{quality.limitation}</p>
        </div>
      )}
      {comparison.config.source && <p className="mt-4 text-xs text-slate-500">Mise à jour source : {date(comparison.data?.updatedAt)} · <a className="text-indigo-700 underline" href={comparison.config.source.url} target="_blank" rel="noreferrer">{comparison.config.source.label}</a></p>}
      {comparison.config.source && <DataQualityBadge state={comparison} updatedAt={comparison.data?.updatedAt} definition={`${comparison.config.indicator.label}, annuel, ${comparison.config.pair.label}`} source={comparison.config.source.label} />}
      <p className="mt-2 text-xs text-slate-500">Les définitions peuvent différer entre Eurostat et la Banque mondiale : le changement de périmètre affiche donc aussi le changement de source. Ces données publiques ne sont pas certifiées par l’application.</p>
    </section>
  );
};

export default AnnualComparisonDashboard;
