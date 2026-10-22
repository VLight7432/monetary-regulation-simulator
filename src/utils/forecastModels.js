import { calibrateInflation } from './inflationCalibration.js';

const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;
const zScore80 = 1.2816;

export const alignForecastObservations = (franceInflation, euroAreaInflation) => {
  const euroAreaByPeriod = new Map(euroAreaInflation.map(({ period, value }) => [period, value]));
  return franceInflation.flatMap(({ period, value: france }) => {
    const euroArea = euroAreaByPeriod.get(period);
    return Number.isFinite(france) && Number.isFinite(euroArea)
      ? [{ period, france, euroArea }]
      : [];
  });
};

const changeVolatility = (observations) => {
  const changes = observations.slice(1).map(({ france }, index) => france - observations[index].france);
  if (changes.length < 2) return 0.1;
  const mean = average(changes);
  return Math.max(0.1, Math.sqrt(average(changes.map((change) => (change - mean) ** 2))));
};

const interval = (point, standardError) => {
  const margin = zScore80 * Math.max(0.1, standardError);
  return { lowerBound: point - margin, upperBound: point + margin };
};

const persistenceForecast = (observations) => {
  const point = observations.at(-1).france;
  return { point, ...interval(point, changeVolatility(observations)) };
};

const calibratedHeuristicForecast = (observations) => {
  const calibration = calibrateInflation(
    observations.map(({ period, france }) => ({ period, value: france })),
    observations.map(({ period, euroArea }) => ({ period, value: euroArea }))
  );
  const point = calibration.latestFranceInflation + (
    calibration.referenceInflation - calibration.latestFranceInflation
  ) * calibration.meanReversion;
  return { point, ...interval(point, calibration.monthlyVolatility) };
};

const solveLinearSystem = (matrix, vector) => {
  const augmented = matrix.map((row, index) => [...row, vector[index]]);
  for (let pivot = 0; pivot < augmented.length; pivot += 1) {
    const pivotRow = augmented.slice(pivot)
      .reduce((best, row, index) => (
        Math.abs(row[pivot]) > Math.abs(augmented[best][pivot]) ? pivot + index : best
      ), pivot);
    [augmented[pivot], augmented[pivotRow]] = [augmented[pivotRow], augmented[pivot]];
    if (Math.abs(augmented[pivot][pivot]) < 1e-10) return null;
    const divisor = augmented[pivot][pivot];
    augmented[pivot] = augmented[pivot].map((value) => value / divisor);
    for (let row = 0; row < augmented.length; row += 1) {
      if (row === pivot) continue;
      const factor = augmented[row][pivot];
      augmented[row] = augmented[row].map((value, column) => value - factor * augmented[pivot][column]);
    }
  }
  return augmented.map((row) => row.at(-1));
};

const fitRidgeEquation = (rows, outcomes, ridge = 0.25) => {
  const size = rows[0].length;
  const gram = Array.from({ length: size }, (_, row) => Array.from(
    { length: size },
    (_, column) => rows.reduce((sum, values) => sum + values[row] * values[column], 0)
      + (row === column && row > 0 ? ridge : 0)
  ));
  const crossProduct = Array.from(
    { length: size },
    (_, column) => rows.reduce((sum, values, index) => sum + values[column] * outcomes[index], 0)
  );
  return solveLinearSystem(gram, crossProduct);
};

const regularizedMultivariateAutoregressiveForecast = (observations) => {
  if (observations.length < 24) throw new Error('24 observations communes sont requises.');
  const rows = observations.slice(0, -1).map(({ france, euroArea }) => [1, france, euroArea]);
  const franceValues = observations.slice(1).map(({ france }) => france);
  const euroAreaValues = observations.slice(1).map(({ euroArea }) => euroArea);
  const franceCoefficients = fitRidgeEquation(rows, franceValues);
  const euroAreaCoefficients = fitRidgeEquation(rows, euroAreaValues);
  if (!franceCoefficients || !euroAreaCoefficients) throw new Error('Ajustement régularisé instable.');

  const latest = observations.at(-1);
  const features = [1, latest.france, latest.euroArea];
  const point = franceCoefficients.reduce((sum, coefficient, index) => sum + coefficient * features[index], 0);
  const residuals = franceValues.map((value, index) => (
    value - franceCoefficients.reduce((sum, coefficient, column) => sum + coefficient * rows[index][column], 0)
  ));
  const standardError = Math.max(
    0.1,
    Math.sqrt(average(residuals.map((residual) => residual ** 2)))
  );
  return {
    point,
    ...interval(point, standardError),
    coefficients: { france: franceCoefficients, euroArea: euroAreaCoefficients }
  };
};

const modelDefinitions = [
  {
    id: 'persistence',
    label: 'Repère de persistance',
    type: 'benchmark',
    limitation: 'Reprend la dernière inflation française ; ne modélise ni chocs ni relations économiques.',
    minimumTrainingSize: 2,
    forecast: persistenceForecast
  },
  {
    id: 'calibrated-heuristic',
    label: 'Heuristique calibrée existante',
    type: 'heuristic',
    limitation: 'Règle de retour à une référence observée ; ce n’est pas un modèle structurel ni causal.',
    minimumTrainingSize: 12,
    forecast: calibratedHeuristicForecast
  },
  {
    id: 'regularized-mar-educational',
    label: 'Prototype autorégressif multivarié régularisé (éducatif/local)',
    type: 'educational-prototype',
    limitation: 'Ce n’est pas un BVAR : ni priors bayésiens, ni estimation/postérieur, ni validation institutionnelle. Une interface serveur pourra remplacer ce prototype par un BVAR réel.',
    minimumTrainingSize: 24,
    forecast: regularizedMultivariateAutoregressiveForecast
  }
];

const unavailable = (definition, reason) => ({
  id: definition.id,
  label: definition.label,
  type: definition.type,
  status: 'unavailable',
  limitation: definition.limitation,
  reason,
  forecast: null,
  backtest: null
});

const calculateBacktest = (definition, observations, minimumTrainingSize, recentWindow) => {
  const results = [];
  for (let index = minimumTrainingSize; index < observations.length; index += 1) {
    try {
      const forecast = definition.forecast(observations.slice(0, index));
      const actual = observations[index].france;
      results.push({
        period: observations[index].period,
        actual,
        prediction: forecast.point,
        error: actual - forecast.point,
        lowerBound: forecast.lowerBound,
        upperBound: forecast.upperBound
      });
    } catch {
      // A model unavailable at a historical origin is not assigned a fabricated forecast.
    }
  }
  if (!results.length) return null;
  const recentResults = results.slice(-recentWindow);
  return {
    results,
    recentObservationCount: recentResults.length,
    meanAbsoluteError: average(results.map(({ error }) => Math.abs(error))),
    recentMeanAbsoluteError: average(recentResults.map(({ error }) => Math.abs(error))),
    meanBias: average(results.map(({ error }) => error)),
    intervalCoverage: results.filter(({ actual, lowerBound, upperBound }) => (
      actual >= lowerBound && actual <= upperBound
    )).length / results.length * 100
  };
};

export const buildForecastComparison = (
  franceInflation,
  euroAreaInflation,
  { windowSize = 60, minimumBacktestObservations = 12, recentWindow = 12 } = {}
) => {
  const observations = alignForecastObservations(franceInflation, euroAreaInflation).slice(-windowSize);
  const models = modelDefinitions.map((definition) => {
    if (observations.length < definition.minimumTrainingSize) {
      return unavailable(definition, `Au moins ${definition.minimumTrainingSize} observations communes sont requises.`);
    }
    try {
      const forecast = definition.forecast(observations);
      const backtest = calculateBacktest(
        definition,
        observations,
        Math.max(definition.minimumTrainingSize, observations.length - windowSize),
        recentWindow
      );
      return {
        id: definition.id,
        label: definition.label,
        type: definition.type,
        status: 'available',
        limitation: definition.limitation,
        reason: null,
        forecast,
        backtest
      };
    } catch (error) {
      return unavailable(definition, error.message);
    }
  });
  const eligible = models.filter(({ status, backtest }) => (
    status === 'available' && backtest?.results.length >= minimumBacktestObservations
  ));
  const denominator = eligible.reduce(
    (sum, { backtest }) => sum + 1 / (backtest.recentMeanAbsoluteError + 0.05),
    0
  );
  const weightedModels = models.map((model) => ({
    ...model,
    weight: eligible.includes(model)
      ? (1 / (model.backtest.recentMeanAbsoluteError + 0.05)) / denominator
      : null
  }));
  const ensembleMembers = weightedModels.filter(({ weight }) => weight !== null);
  const ensemble = ensembleMembers.length
    ? (() => {
      const point = ensembleMembers.reduce((sum, model) => sum + model.forecast.point * model.weight, 0);
      const lowerBound = Math.min(...ensembleMembers.map(({ forecast }) => forecast.lowerBound));
      const upperBound = Math.max(...ensembleMembers.map(({ forecast }) => forecast.upperBound));
      return {
        status: 'available',
        point,
        lowerBound,
        upperBound,
        disagreement: Math.max(...ensembleMembers.map(({ forecast }) => forecast.point))
          - Math.min(...ensembleMembers.map(({ forecast }) => forecast.point)),
        memberCount: ensembleMembers.length
      };
    })()
    : { status: 'unavailable', reason: 'Aucun modèle ne possède 12 erreurs récentes validables.' };

  return { observationCount: observations.length, models: weightedModels, ensemble };
};
