import React from 'react';
import { scenarios } from '../data/scenarios';
import { CheckCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

const ScenarioComparison = ({ scenario, scenarioData: customScenarioData, currentState }) => {
  const scenarioData = customScenarioData || scenarios[scenario];
  
  if (!scenarioData?.expectedValues) {
    return null;
  }

  const parseRange = (rangeStr) => {
    const values = rangeStr.match(/[+-]?\d+(?:[.,]\d+)?/g);
    if (values?.length === 2) {
      return {
        min: parseFloat(values[0].replace(',', '.')),
        max: parseFloat(values[1].replace(',', '.'))
      };
    }
    return null;
  };

  const isValueInRange = (value, rangeStr) => {
    const range = parseRange(rangeStr);
    if (!range) return false;
    return value >= range.min && value <= range.max;
  };

  const getStatusIcon = (inRange, value, rangeStr) => {
    if (inRange) return <CheckCircle className="w-4 h-4 text-green-600" />;
    
    const range = parseRange(rangeStr);
    if (range) {
      if (value < range.min) return <TrendingDown className="w-4 h-4 text-blue-600" />;
      if (value > range.max) return <TrendingUp className="w-4 h-4 text-red-600" />;
    }
    return <AlertTriangle className="w-4 h-4 text-orange-600" />;
  };

  const getStatusColor = (inRange, value, rangeStr) => {
    if (inRange) return 'text-green-700 bg-green-50 border-green-200';
    
    const range = parseRange(rangeStr);
    if (range) {
      if (value < range.min) return 'text-blue-700 bg-blue-50 border-blue-200';
      if (value > range.max) return 'text-red-700 bg-red-50 border-red-200';
    }
    return 'text-orange-700 bg-orange-50 border-orange-200';
  };

  const comparisons = [
    {
      label: 'Inflation',
      current: currentState.inflation,
      expected: scenarioData.expectedValues.inflation,
      format: (val) => `${val.toFixed(1)}%`
    },
    {
      label: 'Dividende',
      current: currentState.dividend,
      expected: scenarioData.expectedValues.dividend,
      format: (val) => `${Math.round(val)}€`
    },
    {
      label: 'Taxe Patrimoine',
      current: currentState.taxRate,
      expected: scenarioData.expectedValues.taxRate,
      format: (val) => `${val.toFixed(1)}%`
    },
    {
      label: 'Crédit Public',
      current: currentState.creditVolume,
      expected: scenarioData.expectedValues.creditVolume,
      format: (val) => `${Math.round(val)}%`
    },
    {
      label: 'Bien-être',
      current: currentState.wellbeing,
      expected: scenarioData.expectedValues.wellbeing,
      format: (val) => `${Math.round(val)}%`
    }
  ];

  const inRangeCount = comparisons.filter(comp => 
    isValueInRange(comp.current, comp.expected)
  ).length;

  const overallScore = (inRangeCount / comparisons.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Repères pédagogiques du scénario "{scenarioData.name}"
        </h3>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Alignement aux repères:</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            overallScore >= 80 ? 'bg-green-100 text-green-800' :
            overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {Math.round(overallScore)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {comparisons.map((comp, index) => {
          const inRange = isValueInRange(comp.current, comp.expected);
          const statusColor = getStatusColor(inRange, comp.current, comp.expected);
          
          return (
            <div key={index} className={`border rounded-lg p-3 ${statusColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-medium opacity-80">{comp.label}</div>
                {getStatusIcon(inRange, comp.current, comp.expected)}
              </div>
              
              <div className="space-y-1">
                <div className="text-lg font-bold">
                  {comp.format(comp.current)}
                </div>
                <div className="text-xs opacity-75">
                  Repère: {comp.expected}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span>Dans la fourchette de référence</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-blue-600" />
              <span>En-dessous de la fourchette</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-red-600" />
              <span>Au-dessus de la fourchette</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioComparison;