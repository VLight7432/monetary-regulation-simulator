import React from 'react';
import { Sliders, Target, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AdvancedControls = ({ parameters, onUpdateParameters, alertThresholds, onUpdateThresholds }) => {
  const updateParameter = (key, value) => {
    onUpdateParameters({ ...parameters, [key]: value });
  };

  const updateThreshold = (metric, type, value) => {
    onUpdateThresholds({
      ...alertThresholds,
      [metric]: { ...alertThresholds[metric], [type]: value }
    });
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-lg p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Sliders className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">Contrôles Avancés</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Paramètres de Régulation */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Paramètres de Régulation
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Cible d'inflation (%)
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={parameters.inflationTarget}
                onChange={(e) => updateParameter('inflationTarget', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{parameters.inflationTarget}%</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Réactivité du dividende
              </label>
              <input
                type="range"
                min="0.01"
                max="0.05"
                step="0.001"
                value={parameters.dividendReactivity}
                onChange={(e) => updateParameter('dividendReactivity', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{(parameters.dividendReactivity * 100).toFixed(1)}%</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Intensité taxation
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={parameters.taxIntensity}
                onChange={(e) => updateParameter('taxIntensity', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{parameters.taxIntensity}x</span>
            </div>
          </div>
        </div>

        {/* Seuils d'Alerte */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Seuils d'Alerte
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Inflation maximale (%)
              </label>
              <input
                type="number"
                min="1"
                max="10"
                step="0.1"
                value={alertThresholds.inflation.max}
                onChange={(e) => updateThreshold('inflation', 'max', parseFloat(e.target.value))}
                className="w-full px-3 py-1 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Inégalités maximales
              </label>
              <input
                type="number"
                min="30"
                max="80"
                step="1"
                value={alertThresholds.inequality.max}
                onChange={(e) => updateThreshold('inequality', 'max', parseInt(e.target.value))}
                className="w-full px-3 py-1 border border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Objectifs Sociaux */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Objectifs Sociaux</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Priorité bien-être
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters.wellbeingWeight}
                onChange={(e) => updateParameter('wellbeingWeight', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{(parameters.wellbeingWeight * 100).toFixed(0)}%</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Priorité égalité
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={parameters.equalityWeight}
                onChange={(e) => updateParameter('equalityWeight', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm text-gray-500">{(parameters.equalityWeight * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AdvancedControls;