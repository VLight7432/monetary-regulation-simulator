import React from 'react';
import { Brain, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';

const PredictionPanel = ({ currentState, predictions }) => {
  if (!predictions || predictions.length === 0) return null;

  const nextMonthPrediction = predictions[0];
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Projections à court terme</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Prédictions 3 mois</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Inflation prévue</div>
              <div className="text-lg font-semibold text-blue-600">
                {nextMonthPrediction.inflation.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">
                {nextMonthPrediction.inflation > currentState.inflation ? '↑' : '↓'} 
                {Math.abs(nextMonthPrediction.inflation - currentState.inflation).toFixed(1)}%
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Bien-être prévu</div>
              <div className="text-lg font-semibold text-green-600">
                {nextMonthPrediction.wellbeing.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">
                {nextMonthPrediction.wellbeing > currentState.wellbeing ? '↑' : '↓'}
                {Math.abs(nextMonthPrediction.wellbeing - currentState.wellbeing).toFixed(1)}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-950">
            <div className="font-medium">Incertitude sur le prochain mois</div>
            <div className="mt-1">
              Intervalle à 80 % : {nextMonthPrediction.lowerBound.toFixed(1)} % à {nextMonthPrediction.upperBound.toFixed(1)} %
            </div>
            <div className="mt-1 text-xs text-blue-800">
              Probabilité estimée de dépasser la cible : {nextMonthPrediction.probabilityAboveTarget} %
            </div>
          </div>

          <div className="space-y-2">
            <h5 className="font-medium text-gray-700">Recommandations</h5>
            <div className="space-y-1 text-sm text-gray-600">
              {generateRecommendations(nextMonthPrediction).map((rec) => (
                <div key={rec} className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  {rec}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-800 mb-1">La trajectoire prévue reste-t-elle proche de la cible de 2 % ?</h4>
          <ResponsiveContainer width="100%" height={200} aria-label="Graphique des prévisions d’inflation et de bien-être avec bornes d’incertitude à 80 pour cent">
            <LineChart data={predictions.slice(0, 6)} accessibilityLayer>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <ReferenceLine y={2} stroke="#2563eb" strokeDasharray="4 4" label="Cible 2 %" />
              <Line type="monotone" dataKey="inflation" stroke="#ef4444" strokeDasharray="5 5" name="Inflation %" />
              <Line type="monotone" dataKey="lowerBound" stroke="#fca5a5" strokeDasharray="3 3" name="Borne basse 80 %" dot={false} />
              <Line type="monotone" dataKey="upperBound" stroke="#fca5a5" strokeDasharray="3 3" name="Borne haute 80 %" dot={false} />
              <Line type="monotone" dataKey="wellbeing" stroke="#8b5cf6" strokeDasharray="5 5" name="Bien-être" />
            </LineChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-gray-500">
            Les pointillés roses représentent l’intervalle à 80 % autour de l’inflation prévue, calculé à partir de la volatilité mensuelle observée sur la fenêtre de calibration.
          </p>
        </div>
      </div>
    </div>
  );
};

const generateRecommendations = (prediction) => {
  const recommendations = [];
  
  if (prediction.inflation > 4) {
    recommendations.push("Envisager une réduction temporaire du dividende");
  }
  
  if (prediction.wellbeing < 60) {
    recommendations.push("Augmenter le soutien social direct");
  }
  
  if (prediction.inequality > 50) {
    recommendations.push("Renforcer la taxation progressive");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("Système stable, maintenir les paramètres actuels");
  }
  
  return recommendations;
};

export default PredictionPanel;