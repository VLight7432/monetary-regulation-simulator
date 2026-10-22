import React from 'react';
import { BriefcaseBusiness, RefreshCw } from 'lucide-react';
import {
  eurostatUnemploymentSource
} from '../services/eurostat.js';

const EconomicContext = ({ economicContext }) => {
  const latestFrance = economicContext.data?.unemployment.FR?.at(-1);
  const latestEuropeanUnion = economicContext.data?.unemployment.EU27_2020?.at(-1);

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-xl bg-cyan-100 p-2 text-cyan-700">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Contexte macroéconomique</h2>
            <p className="mt-1 text-sm text-slate-600">
              Indicateurs observés, distincts des projections du modèle.
            </p>
          </div>
        </div>
        <a
          className="text-xs text-slate-500 underline"
          href={eurostatUnemploymentSource.url}
          target="_blank"
          rel="noreferrer"
        >
          {eurostatUnemploymentSource.label}
        </a>
      </div>
      {economicContext.status === 'loading' && (
        <div className="mt-4 text-sm text-slate-500">Chargement du taux de chômage Eurostat…</div>
      )}
      {economicContext.status === 'error' && (
        <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">
          Donnée indisponible : {economicContext.error.message}
          <button type="button" onClick={economicContext.reload} className="inline-flex items-center gap-1 font-semibold underline">
            <RefreshCw className="h-3 w-3" /> Réessayer
          </button>
        </div>
      )}
      {economicContext.status === 'ready' && (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-cyan-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-cyan-700">France — {latestFrance.period}</div>
            <div className="mt-1 text-3xl font-bold text-cyan-950">{latestFrance.value.toFixed(1)} %</div>
            <div className="mt-1 text-sm text-cyan-800">Taux de chômage harmonisé</div>
          </div>
          <div className="rounded-xl bg-blue-50 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-blue-700">Union européenne — {latestEuropeanUnion.period}</div>
            <div className="mt-1 text-3xl font-bold text-blue-950">{latestEuropeanUnion.value.toFixed(1)} %</div>
            <div className="mt-1 text-sm text-blue-800">Taux de chômage harmonisé</div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EconomicContext;
