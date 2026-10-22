import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { eurostatInflationSource, eurostatUnemploymentSource } from '../services/eurostat.js';
import { allAdditionalMacroSeries } from '../services/macro.js';
import DataQualityBadge from './DataQualityBadge.jsx';

const latest = (data) => data?.series?.[0]?.at(-1) || data?.series?.FR?.at(-1);

const MacroCard = ({ title, description, frequency, unit, source, state, reload, franceAndEuroArea = false }) => {
  const france = state.data?.series?.FR?.at(-1);
  const euroArea = state.data?.series?.EA20?.at(-1) || state.data?.series?.EU27_2020?.at(-1);
  const value = latest(state.data);

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 min-h-10 text-xs text-slate-600">{description}</p>
      <div className="mt-3 text-xs text-slate-500">Fréquence : {frequency} · Unité : {unit}</div>
      <div className="mt-1 text-xs text-slate-500">Périmètre : {franceAndEuroArea ? 'France et agrégat européen' : 'zone euro'}</div>
      {state.status === 'loading' && <p className="mt-3 text-sm text-slate-500">Chargement…</p>}
      {state.status === 'error' && (
        <div className="mt-3 text-sm text-red-800">
          Indisponible : {state.error.message}
          <button type="button" onClick={reload} className="ml-2 inline-flex items-center gap-1 font-semibold underline">
            <RefreshCw className="h-3 w-3" /> Réessayer
          </button>
        </div>
      )}
      {state.status === 'ready' && (
        <div className="mt-3">
          {franceAndEuroArea ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span>France <strong>{france ? `${france.value.toFixed(1)} ${unit}` : '—'}</strong> <small>{france?.period}</small></span>
              <span>Europe <strong>{euroArea ? `${euroArea.value.toFixed(1)} ${unit}` : '—'}</strong> <small>{euroArea?.period}</small></span>
            </div>
          ) : <p className="text-lg font-bold text-slate-950">{value ? `${value.value.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ${unit}` : '—'} <span className="text-xs font-normal">{value?.period}</span></p>}
        </div>
      )}
      <DataQualityBadge state={state} updatedAt={state.data?.updatedAt} definition={description} source={source.label} />
      <a className="mt-3 block text-xs text-indigo-700 underline" href={source.url} target="_blank" rel="noreferrer">{source.label}</a>
    </article>
  );
};

const MacroContextDashboard = ({ inflation, unemployment, macroContext }) => {
  const inflationState = inflation.data ? { status: inflation.status, data: { updatedAt: inflation.data.updatedAt, series: inflation.data.inflation }, error: inflation.error } : inflation;
  const unemploymentState = unemployment.data ? { status: unemployment.status, data: { updatedAt: unemployment.data.updatedAt, series: unemployment.data.unemployment }, error: unemployment.error } : unemployment;

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex gap-3">
        <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700"><BarChart3 className="h-5 w-5" /></div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Tableau de contexte macroéconomique</h2>
          <p className="mt-1 text-sm text-slate-600">Observations publiques automatiquement consultées, distinctes du simulateur. Les fréquences, unités et périmètres ne sont pas interchangeables.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MacroCard title="Inflation IPCH globale" description="Variation annuelle, ensemble des produits" frequency="Mensuelle" unit="%" source={eurostatInflationSource} state={inflationState} reload={inflation.reload} franceAndEuroArea />
        <MacroCard title="Chômage harmonisé" description="15–74 ans, données désaisonnalisées" frequency="Mensuelle" unit="%" source={eurostatUnemploymentSource} state={unemploymentState} reload={unemployment.reload} franceAndEuroArea />
        {allAdditionalMacroSeries.map((series) => (
          <MacroCard key={series.id} {...series} state={macroContext.states[series.id]} reload={() => macroContext.reload(series.id)} franceAndEuroArea={series.id !== 'policyRate' && series.id !== 'privateCredit'} />
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500">Ces données sont affichées à titre de contexte depuis les APIs publiques des institutions indiquées ; l’application ne certifie pas institutionnellement les données.</p>
    </section>
  );
};

export default MacroContextDashboard;
