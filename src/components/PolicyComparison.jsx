import React, { useMemo, useState } from 'react';
import { Download, Scale } from 'lucide-react';
import { saveAs } from 'file-saver';
import { policyOptions } from '../data/policyOptions.js';
import { comparePolicyScenarios } from '../utils/policySimulation.js';

const comparisonRows = [
  { key: 'inflation', label: 'Inflation', unit: '%', digits: 1, positiveIsBetter: false },
  { key: 'wellbeing', label: 'Bien-être', unit: '/100', digits: 0, positiveIsBetter: true },
  { key: 'inequality', label: 'Inégalités', unit: '/100', digits: 0, positiveIsBetter: false },
  { key: 'dividend', label: 'Dividende', unit: ' EUR', digits: 0, positiveIsBetter: true },
  { key: 'taxRate', label: 'Taxe patrimoine', unit: '%', digits: 1, positiveIsBetter: false }
];

const formatValue = (value, digits, unit) => `${value.toFixed(digits)}${unit}`;

const PolicyComparison = ({
  currentState,
  currentMonth,
  scenarioData,
  parameters,
  inflationCalibration
}) => {
  const [policyId, setPolicyId] = useState('price-stability');
  const selectedPolicy = policyOptions.find((policy) => policy.id === policyId);
  const alternativeParameters = {
    ...parameters,
    ...selectedPolicy.overrides,
    inflationCalibration
  };
  const referenceParameters = { ...parameters, inflationCalibration };
  const comparison = useMemo(() => comparePolicyScenarios(
    currentState,
    scenarioData,
    referenceParameters,
    alternativeParameters,
    currentMonth
  ), [
    alternativeParameters,
    currentMonth,
    currentState,
    referenceParameters,
    scenarioData
  ]);

  const exportBrief = () => {
    const referenceFinal = comparison.reference.at(-1);
    const alternativeFinal = comparison.alternative.at(-1);
    const report = [
      'NOTE DE COMPARAISON DE POLITIQUE - SIMULATEUR ÉDUCATIF',
      '',
      `Scénario : ${scenarioData.name}`,
      `Horizon : 12 mois à partir du mois de simulation ${currentMonth + 1}`,
      `Référence : ${policyOptions[0].name}`,
      `Alternative : ${selectedPolicy.name}`,
      `Hypothèse : ${selectedPolicy.description}`,
      '',
      'RÉSULTATS À 12 MOIS',
      ...comparisonRows.map(({ key, label, unit, digits }) => (
        `${label} — référence : ${formatValue(referenceFinal[key], digits, unit)} ; alternative : ${formatValue(alternativeFinal[key], digits, unit)} ; écart : ${formatValue(comparison.delta[key], digits, unit)}`
      )),
      '',
      'LIMITES',
      'Résultats déterministes issus d’un modèle heuristique calibré sur des données IPCH historiques.',
      'Ils ne constituent ni une prévision certifiée ni une recommandation de politique publique.'
    ].join('\n');

    saveAs(
      new Blob([report], { type: 'text/plain;charset=utf-8' }),
      `note-politique-${policyId}.txt`
    );
  };

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Comparaison de politiques</h2>
            <p className="mt-1 text-sm text-slate-600">
              Projection comparative à 12 mois : référence contre orientation alternative.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={exportBrief}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Exporter la note
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Scénario observé</div>
          <div className="mt-1 font-semibold text-slate-900">{scenarioData.name}</div>
          <p className="mt-2 text-sm text-slate-600">{scenarioData.description}</p>
        </div>
        <label className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
          <span className="text-xs font-medium uppercase tracking-wide text-indigo-700">Orientation alternative</span>
          <select
            value={policyId}
            onChange={(event) => setPolicyId(event.target.value)}
            className="mt-2 block w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-slate-800"
          >
            {policyOptions.filter((policy) => policy.id !== 'reference').map((policy) => (
              <option key={policy.id} value={policy.id}>{policy.name}</option>
            ))}
          </select>
          <span className="mt-2 block text-xs text-indigo-800">{selectedPolicy.description}</span>
        </label>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          {comparisonRows.slice(0, 3).map(({ key, label, unit, digits, positiveIsBetter }) => {
            const delta = comparison.delta[key];
            const isFavorable = positiveIsBetter ? delta > 0 : delta < 0;
            return <article key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label} à 12 mois</p>
              <p className={`mt-2 text-2xl font-bold ${delta === 0 ? 'text-slate-700' : isFavorable ? 'text-emerald-700' : 'text-orange-700'}`}>
                {delta > 0 ? '+' : ''}{formatValue(delta, digits, unit)}
              </p>
              <p className="mt-1 text-xs text-slate-600">Écart simulé de l’alternative vs référence ; pas un effet causal établi.</p>
            </article>;
          })}
        </div>
        <table className="w-full min-w-150 text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2">Indicateur à 12 mois</th>
              <th className="px-3 py-2">Référence</th>
              <th className="px-3 py-2">Alternative</th>
              <th className="px-3 py-2">Écart</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(({ key, label, unit, digits, positiveIsBetter }) => {
              const delta = comparison.delta[key];
              const isFavorable = positiveIsBetter ? delta > 0 : delta < 0;

              return (
                <tr key={key} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-3 font-medium text-slate-800">{label}</td>
                  <td className="px-3 py-3 text-slate-600">{formatValue(comparison.reference.at(-1)[key], digits, unit)}</td>
                  <td className="px-3 py-3 text-slate-600">{formatValue(comparison.alternative.at(-1)[key], digits, unit)}</td>
                  <td className={`px-3 py-3 font-semibold ${delta === 0 ? 'text-slate-600' : isFavorable ? 'text-emerald-700' : 'text-orange-700'}`}>
                    {delta > 0 ? '+' : ''}{formatValue(delta, digits, unit)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Les résultats indiquent des écarts de modèle, pas des effets causaux établis. Les hypothèses et la calibration restent consultables dans la méthodologie.
      </p>
    </section>
  );
};

export default PolicyComparison;
