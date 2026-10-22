const addMonths = (period, months) => {
  const [year, month] = period.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1 + months, 1));

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
};

export const buildInflationComparisonData = (
  franceInflation,
  euroAreaInflation,
  simulationData,
  historyLength = 36
) => {
  const history = franceInflation.slice(-historyLength);
  const euroAreaByPeriod = new Map(
    euroAreaInflation.map(({ period, value }) => [period, value])
  );

  if (history.length === 0) {
    return [];
  }

  const chartData = history.map(({ period, value }) => ({
    period,
    france: value,
    euroArea: euroAreaByPeriod.get(period)
  }));
  const latestObservation = history[history.length - 1];

  chartData[chartData.length - 1].simulation = latestObservation.value;

  simulationData.forEach(({ inflation }, index) => {
    chartData.push({
      period: addMonths(latestObservation.period, index + 1),
      simulation: inflation
    });
  });

  return chartData;
};
