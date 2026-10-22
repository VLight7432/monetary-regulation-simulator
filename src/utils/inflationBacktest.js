import { calibrateInflation } from './inflationCalibration.js';

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

export const evaluateInflationBacktest = (
  franceInflation,
  euroAreaInflation,
  windowSize = 60,
  minimumTrainingSize = 24
) => {
  const euroAreaByPeriod = new Map(
    euroAreaInflation.map(({ period, value }) => [period, value])
  );
  const observations = franceInflation
    .flatMap(({ period, value }) => {
      const euroArea = euroAreaByPeriod.get(period);
      return Number.isFinite(euroArea) ? [{ period, france: value, euroArea }] : [];
    });

  if (observations.length <= minimumTrainingSize) {
    throw new Error('Les données historiques sont insuffisantes pour réaliser le backtest.');
  }

  const results = [];
  for (let index = minimumTrainingSize; index < observations.length; index += 1) {
    const trainingData = observations.slice(Math.max(0, index - windowSize), index);
    const calibration = calibrateInflation(
      trainingData.map(({ period, france }) => ({ period, value: france })),
      trainingData.map(({ period, euroArea }) => ({ period, value: euroArea })),
      windowSize
    );
    const previousInflation = trainingData[trainingData.length - 1].france;
    const prediction = previousInflation + (
      calibration.referenceInflation - previousInflation
    ) * calibration.meanReversion;
    const standardError = Math.max(0.1, calibration.monthlyVolatility);
    const intervalMargin = 1.2816 * standardError;
    const actual = observations[index].france;

    results.push({
      period: observations[index].period,
      actual,
      prediction,
      lowerBound: prediction - intervalMargin,
      upperBound: prediction + intervalMargin,
      error: actual - prediction,
      probabilityAboveTarget: Math.round(
        (1 - normalCdf((2 - prediction) / standardError)) * 100
      )
    });
  }

  const meanAbsoluteError = results.reduce(
    (sum, { error }) => sum + Math.abs(error),
    0
  ) / results.length;
  const meanBias = results.reduce((sum, { error }) => sum + error, 0) / results.length;
  const intervalCoverage = results.filter(
    ({ actual, lowerBound, upperBound }) => actual >= lowerBound && actual <= upperBound
  ).length / results.length * 100;

  return {
    results,
    meanAbsoluteError,
    meanBias,
    intervalCoverage
  };
};
