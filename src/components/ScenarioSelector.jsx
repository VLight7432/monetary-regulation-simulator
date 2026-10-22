import React, { useState } from 'react';
import { scenarios } from '../data/scenarios';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';

const ScenarioSelector = ({ scenario, scenarioData, setScenario }) => {
  const [showDetails, setShowDetails] = useState(false);
  const currentScenario = scenarioData || scenarios[scenario];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-slate-700">Scénario économique:</label>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="px-4 py-2 bg-white/90 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 shadow-sm font-medium text-slate-700 min-w-[200px]"
          >
            {Object.entries(scenarios).map(([key, scenarioData]) => (
              <option key={key} value={key}>{scenarioData.name}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 hover:bg-blue-100/50 rounded-xl transition-all duration-200 font-medium border border-blue-200/50"
        >
          <Info className="w-4 h-4" />
          {showDetails ? 'Masquer' : 'Détails'}
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {showDetails && currentScenario && (
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border border-blue-200/50 rounded-2xl p-6 space-y-4 shadow-lg">
          <div>
            <h4 className="font-medium text-blue-900 mb-1">{currentScenario.name}</h4>
            <p className="text-sm text-blue-800">{currentScenario.description}</p>
          </div>
          
          {currentScenario.expectedValues && (
            <div>
              <h5 className="font-medium text-blue-900 mb-2">Repères pédagogiques :</h5>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="bg-white rounded px-2 py-1">
                  <div className="text-gray-600">Inflation</div>
                  <div className="font-medium text-blue-900">{currentScenario.expectedValues.inflation}</div>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <div className="text-gray-600">Dividende</div>
                  <div className="font-medium text-green-700">{currentScenario.expectedValues.dividend}</div>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <div className="text-gray-600">Taxe Patrimoine</div>
                  <div className="font-medium text-red-700">{currentScenario.expectedValues.taxRate}</div>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <div className="text-gray-600">Crédit Public</div>
                  <div className="font-medium text-blue-700">{currentScenario.expectedValues.creditVolume}</div>
                </div>
                <div className="bg-white rounded px-2 py-1">
                  <div className="text-gray-600">Bien-être</div>
                  <div className="font-medium text-purple-700">{currentScenario.expectedValues.wellbeing}</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tendance d'inflation mensuelle */}
            <div>
              <h5 className="font-medium text-blue-900 mb-2">Tendance d'inflation (12 mois) :</h5>
              <div className="bg-white rounded-lg p-3 border border-blue-100">
                <div className="grid grid-cols-6 gap-1 text-xs">
                  {currentScenario.inflationTrend.map((value, index) => (
                    <div key={index} className="text-center">
                      <div className="text-gray-500 text-xs mb-1">M{index + 1}</div>
                      <div className={`font-mono px-1 py-0.5 rounded text-xs ${
                        value > 0.5 ? 'bg-red-100 text-red-800' :
                        value > 0.2 ? 'bg-orange-100 text-orange-800' :
                        value > 0 ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {value > 0 ? '+' : ''}{(value * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Variation mensuelle de l'inflation (en points de pourcentage)
                </div>
                {/* Mini graphique en barres */}
                <div className="mt-2 flex items-end justify-between h-8 gap-0.5">
                  {currentScenario.inflationTrend.map((value, index) => {
                    const maxVal = Math.max(...currentScenario.inflationTrend.map(Math.abs));
                    const height = Math.max(4, (Math.abs(value) / maxVal) * 28);
                    return (
                      <div key={index} className="flex flex-col items-center flex-1">
                        <div 
                          className={`w-full rounded-t ${
                            value > 0.5 ? 'bg-red-400' :
                            value > 0.2 ? 'bg-orange-400' :
                            value > 0 ? 'bg-green-400' :
                            'bg-blue-400'
                          } ${value < 0 ? 'mt-auto' : ''}`}
                          style={{ 
                            height: `${height}px`,
                            transform: value < 0 ? 'scaleY(-1)' : 'none'
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chocs économiques */}
            {currentScenario.shocks && currentScenario.shocks.length > 0 && (
              <div>
                <h5 className="font-medium text-blue-900 mb-2">Chocs économiques :</h5>
                <div className="space-y-2">
                  {currentScenario.shocks.map((shock, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-blue-800">Mois {shock.month}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-mono ${
                          shock.intensity > 0 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {shock.intensity > 0 ? '+' : ''}{shock.intensity}
                        </span>
                      </div>
                      <div className="text-xs text-gray-700">{shock.type}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        Impact: {shock.intensity > 0 ? 'Hausse' : 'Baisse'} de {Math.abs(shock.intensity)} points
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Statistiques du scénario */}
          <div className="mt-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
            <h5 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
              📊 Statistiques du scénario
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-gray-600">Inflation Max</div>
                <div className="font-bold text-red-600">
                  +{(Math.max(...currentScenario.inflationTrend) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-gray-600">Inflation Min</div>
                <div className="font-bold text-blue-600">
                  {(Math.min(...currentScenario.inflationTrend) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-gray-600">Volatilité</div>
                <div className="font-bold text-orange-600">
                  {(() => {
                    const values = currentScenario.inflationTrend;
                    const mean = values.reduce((a, b) => a + b, 0) / values.length;
                    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
                    return Math.sqrt(variance).toFixed(3);
                  })()}
                </div>
              </div>
              <div className="bg-white rounded-lg p-2 text-center border">
                <div className="text-gray-600">Nb Chocs</div>
                <div className="font-bold text-purple-600">
                  {currentScenario.shocks ? currentScenario.shocks.length : 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;