export const defaultScenarioAdjustments = {
  trendAdjustment: 0,
  shockMonth: 6,
  shockIntensity: 0,
  shockType: 'choc de politique publique'
};

export const buildCustomScenario = (baseScenario, adjustments) => {
  const hasCustomShock = adjustments.shockIntensity !== 0;

  return {
    ...baseScenario,
    name: `${baseScenario.name} — variante personnalisée`,
    description: `${baseScenario.description} Variante : tendance mensuelle ${adjustments.trendAdjustment >= 0 ? '+' : ''}${adjustments.trendAdjustment.toFixed(1)} point${hasCustomShock ? `, choc de ${adjustments.shockIntensity >= 0 ? '+' : ''}${adjustments.shockIntensity.toFixed(1)} point au mois ${adjustments.shockMonth}` : ''}.`,
    inflationTrend: baseScenario.inflationTrend.map(
      (value) => value + adjustments.trendAdjustment
    ),
    shocks: [
      ...baseScenario.shocks,
      ...(hasCustomShock
        ? [{
          month: adjustments.shockMonth,
          intensity: adjustments.shockIntensity,
          type: adjustments.shockType
        }]
        : [])
    ],
    expectedValues: null
  };
};
