export const calculateAdjustments = (inflation, prevState, parameters) => {
    let newState = { ...prevState, inflation };
    
    // Paramètres par défaut si non fournis
    const params = parameters || {
      inflationTarget: 2.0,
      dividendReactivity: 0.02,
      taxIntensity: 2.5,
      emergencyTaxThreshold: 5.0,
      wellbeingWeight: 0.6,
      equalityWeight: 0.4
    };
    
    // Ajustement du dividende basé sur l'écart à la cible d'inflation
    const inflationGap = inflation - params.inflationTarget;
    
    if (inflation < params.inflationTarget) {
      // Inflation faible -> augmenter le dividende pour stimuler la demande
      newState.dividend = Math.min(
        prevState.dividend * (1 + params.dividendReactivity * Math.abs(inflationGap)), 
        1500
      );
    } else if (inflation > params.emergencyTaxThreshold) {
      // Inflation très élevée -> réduire drastiquement le dividende
      newState.dividend = Math.max(
        prevState.dividend * (1 - params.dividendReactivity * 2 * inflationGap), 
        600
      );
    } else if (inflation > params.inflationTarget) {
      // Inflation modérément élevée -> réduction progressive du dividende
      newState.dividend = Math.max(
        prevState.dividend * (1 - params.dividendReactivity * inflationGap), 
        800
      );
    }
    
    // Taxation du patrimoine progressive selon l'inflation
    if (inflation > params.emergencyTaxThreshold) {
      // Taxe d'urgence en cas d'inflation très élevée
      newState.taxRate = Math.min(5 + params.taxIntensity * inflationGap * 2, 20);
    } else if (inflation > params.inflationTarget) {
      // Taxation progressive normale
      newState.taxRate = Math.min(5 + params.taxIntensity * inflationGap, 15);
    } else {
      // Réduction progressive de la taxe si inflation faible
      newState.taxRate = Math.max(2, prevState.taxRate * 0.98);
    }
    
    // Volume de crédit public inversement corrélé à l'inflation
    const creditAdjustment = (params.inflationTarget - inflation) * 10;
    newState.creditVolume = Math.max(20, Math.min(200, 
      prevState.creditVolume + creditAdjustment
    ));
    
    // Calcul du bien-être intégrant multiple facteurs
    const wellbeingWeight = params.wellbeingWeight ?? 0.6;
    const equalityWeight = params.equalityWeight ?? 0.4;
    const dividendEffect = ((newState.dividend - 1000) / 1000) * 30 * (wellbeingWeight / 0.6); // Impact du dividende
    const inflationEffect = -inflation * 8; // Impact négatif de l'inflation
    const inequalityEffect = -((newState.inequality || 40) - 30) * 0.5 * (equalityWeight / 0.4); // Impact de l'inégalité
    const baseWellbeing = 60; // Niveau de base
    
    newState.wellbeing = Math.max(0, Math.min(100, 
      baseWellbeing + dividendEffect + inflationEffect + inequalityEffect
    ));
    
    // Calcul de l'inégalité basé sur la politique monétaire
    const taxEffect = (newState.taxRate - 5) * -1.5 * (equalityWeight / 0.4); // Plus de taxes = moins d'inégalités
    const dividendEffect2 = (newState.dividend - 1000) / 1000 * -8 * (equalityWeight / 0.4); // Plus de dividende = moins d'inégalités
    const inflationEffect2 = inflation * 1.2; // L'inflation augmente les inégalités
    
    newState.inequality = Math.max(15, Math.min(70, 
      (prevState.inequality || 40) + taxEffect + dividendEffect2 + inflationEffect2
    ));
    
    return newState;
};
  
export function simulateInflation(currentInflation, scenarioData, currentMonth, currentState, parameters) {
    if (!scenarioData) {
      throw new Error('scenarioData est undefined dans simulateInflation');
    }
    
    // Récupérer la tendance du mois actuel (cyclique si > 12 mois)
    const monthIndex = currentMonth % scenarioData.inflationTrend.length;
    const trendValue = scenarioData.inflationTrend[monthIndex];
    
    // Calcul de l'inflation basé sur la tendance du scénario
    let baseInflation = currentInflation + trendValue;

    const calibration = parameters?.inflationCalibration;
    if (calibration) {
      // The historical reference prevents scenario trends from accumulating indefinitely.
      baseInflation += (calibration.referenceInflation - currentInflation) * calibration.meanReversion;
    }
    
    // Appliquer les chocs ponctuels
    const shock = scenarioData.shocks.find(s => s.month === currentMonth);
    if (shock) {
      baseInflation += shock.intensity;
    }
    
    // Effet de rétroaction des politiques monétaires
    if (parameters && currentState) {
      // L'augmentation du dividende peut stimuler l'inflation
      const dividendEffect = ((currentState.dividend - 1000) / 1000) * 0.3;
      
      // La taxation réduit l'inflation en réduisant la demande
      const taxEffect = -((currentState.taxRate - 5) / 10) * 0.2;
      
      // Le crédit public influence l'inflation
      const creditEffect = ((currentState.creditVolume - 100) / 100) * 0.1;
      
      baseInflation += dividendEffect + taxEffect + creditEffect;
    }
    
    // Limiter l'inflation dans des bornes réalistes
    return Math.max(-3, Math.min(10, baseInflation));
}
  
export function generatePredictions(data, scenarioData, parameters) {
  if (!Array.isArray(data) || data.length === 0 || !scenarioData) {
    return [];
  }

  const latestState = data[data.length - 1];
  let projectedState = {
    inflation: latestState.inflation,
    dividend: latestState.dividend,
    taxRate: latestState.taxRate,
    creditVolume: latestState.creditVolume,
    wellbeing: latestState.wellbeing,
    inequality: latestState.inequality
  };

  const targetInflation = parameters?.inflationTarget ?? 2;
  const monthlyVolatility = parameters?.inflationCalibration?.monthlyVolatility ?? 0.5;

  return Array.from({ length: 3 }, (_, offset) => {
    const month = latestState.month + offset + 1;
    const inflation = simulateInflation(
      projectedState.inflation,
      scenarioData,
      month,
      projectedState,
      parameters
    );

    projectedState = calculateAdjustments(inflation, projectedState, parameters);

    const standardError = Math.max(0.1, monthlyVolatility * Math.sqrt(offset + 1));
    const intervalMargin = 1.2816 * standardError;
    const probabilityAboveTarget = (
      1 - normalCdf((targetInflation - inflation) / standardError)
    ) * 100;

    return {
      month,
      ...projectedState,
      lowerBound: Math.max(-3, inflation - intervalMargin),
      upperBound: Math.min(10, inflation + intervalMargin),
      probabilityAboveTarget: Math.round(probabilityAboveTarget)
    };
  });
}

const normalCdf = (value) => {
  const sign = value < 0 ? -1 : 1;
  const absoluteValue = Math.abs(value) / Math.sqrt(2);
  const t = 1 / (1 + 0.3275911 * absoluteValue);
  const errorFunction = 1 - (
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t
      + 0.254829592) * t * Math.exp(-absoluteValue * absoluteValue)
  );

  return 0.5 * (1 + sign * errorFunction);
};