import React from 'react';
import { AlertCircle, CheckCircle, History, TrendingUp } from 'lucide-react';

const HistoricalAnalysis = ({ data }) => {
  if (data.length < 5) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold">Analyse Historique</h3>
        </div>
        <div className="text-center text-gray-500 py-8">
          Données insuffisantes. Laissez tourner la simulation plus longtemps pour voir l'analyse historique.
        </div>
      </div>
    );
  }

  const recentData = data.slice(-6);
  const averageInflation = recentData.reduce((sum, item) => sum + item.inflation, 0) / recentData.length;
  const averageWellbeing = recentData.reduce((sum, item) => sum + item.wellbeing, 0) / recentData.length;
  const inflationChange = recentData[recentData.length - 1].inflation - recentData[0].inflation;
  const isStable = Math.abs(averageInflation - 2) < 1;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5 text-orange-600" />
        <h3 className="text-lg font-semibold">Analyse historique</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="text-blue-700">Inflation moyenne (6 derniers mois)</div>
          <div className="mt-1 text-2xl font-bold text-blue-900">{averageInflation.toFixed(1)}%</div>
        </div>
        <div className="rounded-lg bg-purple-50 p-4">
          <div className="text-purple-700">Bien-être moyen</div>
          <div className="mt-1 text-2xl font-bold text-purple-900">{averageWellbeing.toFixed(0)}/100</div>
        </div>
        <div className={`rounded-lg p-4 ${isStable ? 'bg-green-50' : 'bg-orange-50'}`}>
          <div className={isStable ? 'text-green-700' : 'text-orange-700'}>Stabilité des prix</div>
          <div className="mt-1 flex items-center gap-2 font-semibold">
            {isStable ? <CheckCircle className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-orange-600" />}
            {isStable ? 'Proche de la cible' : 'Écart à la cible'}
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
        <TrendingUp className="w-4 h-4" />
        L'inflation a {inflationChange >= 0 ? 'augmenté' : 'diminué'} de {Math.abs(inflationChange).toFixed(1)} point sur les 6 derniers mois.
      </div>
    </div>
  );
};

export default HistoricalAnalysis;