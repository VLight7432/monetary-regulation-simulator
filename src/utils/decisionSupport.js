export const decisionSupportThresholds = {
  maxDataAgeDays: 45,
  minimumCalibrationObservations: 24,
  minimumBacktestObservations: 12,
  maximumMeanAbsoluteError: 1.5,
  minimumIntervalCoverage: 60,
  materialForecastDisagreement: 0.5
};

const validDate = (value) => Number.isFinite(new Date(value).getTime());

export const evaluateDecisionReadiness = ({
  sourceStatus,
  sourceUpdatedAt,
  seriesCompatible = true,
  calibration,
  backtest,
  now = new Date()
}) => {
  const ageInDays = validDate(sourceUpdatedAt)
    ? Math.max(0, (now.getTime() - new Date(sourceUpdatedAt).getTime()) / 86_400_000)
    : null;
  const checks = [
    {
      id: 'definition',
      label: 'Séries de même définition, unité et fréquence (IPCH annuel, FR/EA20)',
      passed: seriesCompatible
    },
    {
      id: 'data',
      label: 'Données IPCH France/zone euro disponibles',
      passed: sourceStatus === 'ready' && ageInDays !== null
    },
    {
      id: 'freshness',
      label: `Millésime source de moins de ${decisionSupportThresholds.maxDataAgeDays} jours`,
      passed: ageInDays !== null && ageInDays <= decisionSupportThresholds.maxDataAgeDays
    },
    {
      id: 'calibration',
      label: `Calibration sur au moins ${decisionSupportThresholds.minimumCalibrationObservations} observations communes`,
      passed: Boolean(calibration) && calibration.observationCount >= decisionSupportThresholds.minimumCalibrationObservations
    },
    {
      id: 'backtest-size',
      label: `Backtest sur au moins ${decisionSupportThresholds.minimumBacktestObservations} mois`,
      passed: Boolean(backtest) && backtest.results.length >= decisionSupportThresholds.minimumBacktestObservations
    },
    {
      id: 'backtest-error',
      label: `Erreur absolue moyenne du backtest ≤ ${decisionSupportThresholds.maximumMeanAbsoluteError} point`,
      passed: Boolean(backtest) && backtest.meanAbsoluteError <= decisionSupportThresholds.maximumMeanAbsoluteError
    },
    {
      id: 'backtest-coverage',
      label: `Couverture de l’intervalle 80 % ≥ ${decisionSupportThresholds.minimumIntervalCoverage} %`,
      passed: Boolean(backtest) && backtest.intervalCoverage >= decisionSupportThresholds.minimumIntervalCoverage
    }
  ];

  return {
    eligible: checks.every(({ passed }) => passed),
    checks,
    ageInDays
  };
};

export const buildForecastBenchmark = (calibration) => {
  if (!calibration) {
    return null;
  }

  const calibrated = calibration.latestFranceInflation + (
    calibration.referenceInflation - calibration.latestFranceInflation
  ) * calibration.meanReversion;
  const persistence = calibration.latestFranceInflation;
  const disagreement = Math.abs(calibrated - persistence);

  return {
    horizon: 'un mois',
    calibrated,
    persistence,
    disagreement,
    materialDisagreement: disagreement >= decisionSupportThresholds.materialForecastDisagreement,
    explanation: 'Le repère indépendant conserve simplement la dernière inflation française observée. Il ne réutilise ni les coefficients ni la cible de la calibration.'
  };
};

export const buildDecisionSupport = ({
  readiness,
  benchmark,
  currentState,
  parameters,
  scenarioName,
  alternatives
}) => {
  const target = parameters.inflationTarget;
  const modelInflation = benchmark?.calibrated ?? null;
  const risk = benchmark?.materialDisagreement
    ? 'Désaccord matériel entre le modèle calibré et le repère indépendant.'
    : 'Désaccord limité entre le modèle calibré et le repère indépendant.';
  const conditionalOutput = modelInflation === null
    ? 'Sortie conditionnelle indisponible.'
    : modelInflation > target + 0.5
      ? 'Si les hypothèses et le millésime restent valides, examiner une orientation de stabilité des prix.'
      : modelInflation < target - 0.5
        ? 'Si les hypothèses et le millésime restent valides, examiner une orientation de soutien à l’activité et au bien-être.'
        : 'Si les hypothèses et le millésime restent valides, examiner le maintien des paramètres de référence.';

  return {
    eligible: readiness.eligible,
    conditionalOutput: readiness.eligible
      ? conditionalOutput
      : 'Aucune recommandation produite : les garde-fous de données, calibration ou backtest ne sont pas satisfaits.',
    horizon: 'Un mois pour la comparaison des prévisions ; 12 mois pour les alternatives de politique simulées.',
    assumptions: [
      `Scénario sélectionné : ${scenarioName}.`,
      `Cible d’inflation du simulateur : ${target.toFixed(1)} %.`,
      'Relations heuristiques déterministes ; ni causalité démontrée ni optimisation de politique publique.',
      `État simulé courant : inflation ${currentState.inflation.toFixed(1)} %.`
    ],
    risk,
    alternatives
  };
};
