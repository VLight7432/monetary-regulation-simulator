import React, { useState } from 'react';
import { PenLine, RotateCcw } from 'lucide-react';
import { scenarios } from '../data/scenarios.js';
import {
  buildCustomScenario,
  defaultScenarioAdjustments
} from '../utils/scenarioDesign.js';

const ScenarioDesigner = ({ scenario, onUpdateScenario, onResetScenario }) => {
  const [adjustments, setAdjustments] = useState(defaultScenarioAdjustments);

  const updateAdjustments = (key, value) => {
    const nextAdjustments = { ...adjustments, [key]: value };
    setAdjustments(nextAdjustments);
    onUpdateScenario(buildCustomScenario(scenarios[scenario], nextAdjustments));
  };

  const resetAdjustments = () => {
    setAdjustments(defaultScenarioAdjustments);
    onResetScenario(scenario);
  };
  const hasChanges = Object.values(adjustments).some((value, index) => (
    value !== Object.values(defaultScenarioAdjustments)[index]
  ));

  return (
    <section className="mb-6 rounded-2xl border border-violet-100 bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="rounded-xl bg-violet-100 p-2 text-violet-700">
            <PenLine className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Concepteur de scénario</h2>
            <p className="mt-1 text-sm text-slate-600">
              Créez une variante locale de « {scenarios[scenario].name} » pour comparer des hypothèses explicites.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetAdjustments}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser la variante
        </button>
      </div>

      <ol className="mt-5 grid gap-3 text-sm md:grid-cols-3">
        <li className="rounded-xl border border-violet-200 bg-violet-50 p-3"><strong>1. Base</strong><br />{scenarios[scenario].name}</li>
        <li className="rounded-xl border border-slate-200 bg-slate-50 p-3"><strong>2. Hypothèses</strong><br />Ajustez la tendance et le choc ci-dessous.</li>
        <li className="rounded-xl border border-slate-200 bg-slate-50 p-3"><strong>3. Vérifier et appliquer</strong><br />Chaque modification est appliquée à la variante locale.</li>
      </ol>

      <fieldset className="mt-5 grid gap-5 md:grid-cols-3">
        <legend className="sr-only">Étape 2 : hypothèses de la variante</legend>
        <label className="text-sm font-medium text-slate-700">
          Tendance mensuelle additionnelle
          <input
            type="range"
            min="-1"
            max="1"
            step="0.1"
            value={adjustments.trendAdjustment}
            onChange={(event) => updateAdjustments('trendAdjustment', Number(event.target.value))}
            className="mt-3 w-full accent-violet-600"
          />
          <span className="mt-2 block text-xs text-slate-500">
            {adjustments.trendAdjustment >= 0 ? '+' : ''}{adjustments.trendAdjustment.toFixed(1)} point d'inflation par mois
          </span>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Mois du choc
          <input
            type="number"
            min="1"
            max="24"
            value={adjustments.shockMonth}
            onChange={(event) => updateAdjustments('shockMonth', Number(event.target.value))}
            className="mt-3 block w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Intensité du choc
          <input
            type="number"
            min="-5"
            max="5"
            step="0.1"
            value={adjustments.shockIntensity}
            onChange={(event) => updateAdjustments('shockIntensity', Number(event.target.value))}
            className="mt-3 block w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <span className="mt-2 block text-xs text-slate-500">
            0 désactive le choc personnalisé.
          </span>
        </label>
      </fieldset>
      <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4 text-sm text-violet-950" aria-live="polite">
        <h3 className="font-semibold">Étape 3 — résumé de la modification</h3>
        <p className="mt-1">{hasChanges
          ? `Variante de « ${scenarios[scenario].name} » : tendance ${adjustments.trendAdjustment >= 0 ? '+' : ''}${adjustments.trendAdjustment.toFixed(1)} point/mois ; ${adjustments.shockIntensity === 0 ? 'aucun choc personnalisé' : `choc de ${adjustments.shockIntensity >= 0 ? '+' : ''}${adjustments.shockIntensity.toFixed(1)} au mois ${adjustments.shockMonth}`}.`
          : 'Aucune modification : le scénario de base est conservé.'}</p>
        <p className="mt-1 text-xs">La variante est appliquée à la simulation locale ; elle ne constitue pas une prévision ou une recommandation.</p>
      </div>
    </section>
  );
};

export default ScenarioDesigner;
