import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { modelMetadata } from '../data/modelMetadata';

const RegulationExplainer = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Mécanismes de Régulation</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Inflation &lt; 2% : Augmentation du dividende</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-yellow-500" />
          <span>Inflation 2-4% : Taxation progressive activée</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span>Inflation &gt; 4% : Réduction dividende + crédit</span>
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-blue-500" />
          <span>Déflation : Injection monétaire d'urgence</span>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Méthodologie du modèle</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          {modelMetadata.assumptions.map((assumption) => (
            <li key={assumption}>• {assumption}</li>
          ))}
        </ul>
      </div>

      <details className="mt-4 rounded-lg border border-slate-200 p-3 text-xs text-slate-700">
        <summary className="cursor-pointer font-medium text-slate-800">
          Hypothèses, bornes et limites
        </summary>
        <div className="mt-3 space-y-3">
          <section>
            <h4 className="font-semibold">Mécanismes</h4>
            <ul className="mt-1 space-y-1">
              {modelMetadata.mechanisms.map((mechanism) => (
                <li key={mechanism}>• {mechanism}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="font-semibold">Bornes appliquées</h4>
            <ul className="mt-1 space-y-1">
              {modelMetadata.bounds.map((bound) => (
                <li key={bound}>• {bound}</li>
              ))}
            </ul>
          </section>
          <section>
            <h4 className="font-semibold">Limites</h4>
            <ul className="mt-1 space-y-1">
              {modelMetadata.limitations.map((limitation) => (
                <li key={limitation}>• {limitation}</li>
              ))}
            </ul>
          </section>
        </div>
      </details>
    </div>
  );
};

export default RegulationExplainer;