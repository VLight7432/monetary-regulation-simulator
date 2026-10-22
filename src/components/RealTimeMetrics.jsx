import React from 'react';
import { Activity, Gauge, TrendingUp, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const RealTimeMetrics = ({ currentState, data }) => {
  const calculateEfficiency = () => {
    if (!data || data.length < 2) return 0;
    
    const recent = data.slice(-6);
    const avgInflation = recent.reduce((acc, d) => acc + Math.abs((d.inflation || 0) - 2), 0) / recent.length;
    const avgWellbeing = recent.reduce((acc, d) => acc + (d.wellbeing || 0), 0) / recent.length;
    
    const result = 100 - avgInflation * 10 + (avgWellbeing - 50) * 0.5;
    return Math.max(0, Math.min(100, isNaN(result) ? 0 : result));
  };

  const calculateStability = () => {
    if (!data || data.length < 5) return 100;
    
    const recent = data.slice(-5);
    const inflationValues = recent.map(d => d.inflation || 0);
    const inflationVariance = calculateVariance(inflationValues);
    
    const result = 100 - inflationVariance * 20;
    return Math.max(0, Math.min(100, isNaN(result) ? 100 : result));
  };

  const calculateSocialImpact = () => {
    if (!currentState) return 0;
    
    const wellbeingScore = ((currentState.wellbeing || 0) / 100) * 40;
    const inequalityScore = ((80 - (currentState.inequality || 0)) / 80) * 35;
    const dividendScore = (((currentState.dividend || 800) - 800) / 700) * 25;
    
    const result = wellbeingScore + inequalityScore + dividendScore;
    return Math.max(0, Math.min(100, isNaN(result) ? 0 : result));
  };

  const efficiency = calculateEfficiency();
  const stability = calculateStability();
  const socialImpact = calculateSocialImpact();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold">Métriques en Temps Réel</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Efficacité du Système"
          value={efficiency}
          icon={<Gauge className="w-5 h-5" />}
          color="blue"
          description="Capacité à maintenir la stabilité"
        />
        
        <MetricCard
          title="Stabilité Monétaire"
          value={stability}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          description="Constance des indicateurs clés"
        />
        
        <MetricCard
          title="Impact Social"
          value={socialImpact}
          icon={<Users className="w-5 h-5" />}
          color="purple"
          description="Amélioration du bien-être collectif"
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Score Global du Système</h4>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(efficiency + stability + socialImpact) / 3}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
          <span className="text-xl font-bold text-gray-800">
            {Math.round((efficiency + stability + socialImpact) / 3)}/100
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {getPerformanceComment((efficiency + stability + socialImpact) / 3)}
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon, color, description }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100'
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50 p-5 text-center shadow-sm transition-shadow hover:shadow-md">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <h4 className="font-medium text-gray-800 mb-1">{title}</h4>
      <div className="text-2xl font-bold text-gray-900 mb-1">
        {Math.round(value)}%
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      
      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={`h-2 rounded-full ${color === 'blue' ? 'bg-blue-500' : color === 'green' ? 'bg-green-500' : 'bg-purple-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

const calculateVariance = (values) => {
  if (!values || values.length === 0) return 0;
  
  const validValues = values.filter(val => !isNaN(val) && isFinite(val));
  if (validValues.length === 0) return 0;
  
  const mean = validValues.reduce((acc, val) => acc + val, 0) / validValues.length;
  const squaredDiffs = validValues.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / validValues.length;
  
  return isNaN(variance) ? 0 : variance;
};

const getPerformanceComment = (score) => {
  if (score >= 85) return "Excellent! Le système fonctionne de manière optimale.";
  if (score >= 70) return "Très bon. Quelques ajustements mineurs possibles.";
  if (score >= 55) return "Satisfaisant. Des améliorations sont recommandées.";
  if (score >= 40) return "Moyen. Le système nécessite des ajustements.";
  return "Faible. Une révision complète des paramètres est nécessaire.";
};

export default RealTimeMetrics;