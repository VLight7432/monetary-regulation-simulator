const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const calculateAutocorrelation = (values) => {
  if (values.length < 3) {
    return 0.5;
  }

  const previous = values.slice(0, -1);
  const current = values.slice(1);
  const previousMean = average(previous);
  const currentMean = average(current);
  const covariance = previous.reduce(
    (sum, value, index) => sum + (value - previousMean) * (current[index] - currentMean),
    0
  );
  const variance = previous.reduce(
    (sum, value) => sum + (value - previousMean) ** 2,
    0
  );

  return variance === 0 ? 0.5 : covariance / variance;
};

const standardDeviation = (values) => {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  return Math.sqrt(average(values.map((value) => (value - mean) ** 2)));
};

export const calibrateInflation = (
  franceInflation,
  euroAreaInflation,
  windowSize = 60
) => {
  const euroAreaByPeriod = new Map(
    euroAreaInflation.map(({ period, value }) => [period, value])
  );
  const observations = franceInflation
    .flatMap(({ period, value }) => {
      const euroAreaValue = euroAreaByPeriod.get(period);
      return Number.isFinite(euroAreaValue)
        ? [{ period, france: value, euroArea: euroAreaValue }]
        : [];
    })
    .slice(-windowSize);

  if (observations.length < 12) {
    throw new Error('Au moins 12 observations mensuelles France/zone euro sont requises.');
  }

  const franceValues = observations.map(({ france }) => france);
  const euroAreaValues = observations.map(({ euroArea }) => euroArea);
  const monthlyChanges = franceValues
    .slice(1)
    .map((value, index) => value - franceValues[index]);
  const franceAverage = average(franceValues);
  const euroAreaAverage = average(euroAreaValues);
  const persistence = clamp(calculateAutocorrelation(franceValues), 0, 0.95);

  return {
    observationCount: observations.length,
    lastPeriod: observations[observations.length - 1].period,
    referenceInflation: franceAverage * 0.75 + euroAreaAverage * 0.25,
    meanReversion: clamp(1 - persistence, 0.05, 0.5),
    monthlyVolatility: standardDeviation(monthlyChanges),
    latestFranceInflation: franceValues[franceValues.length - 1],
    latestEuroAreaInflation: euroAreaValues[euroAreaValues.length - 1]
  };
};
