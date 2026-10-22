const API_BASE = 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/';

const createEurostatUrl = (dataset, parameters) => {
  const url = new URL(`${API_BASE}${dataset}`);
  const search = new URLSearchParams({ lang: 'EN' });
  Object.entries(parameters).forEach(([key, value]) => {
    (Array.isArray(value) ? value : [value]).forEach((item) => search.append(key, item));
  });
  url.search = search.toString();
  return url;
};

const findDimensionPosition = (dataset, dimension) => dataset.id.indexOf(dimension);

export const parseEurostatGeoTimeSeries = (dataset, requiredDimensions = []) => {
  if (
    !dataset ||
    !Array.isArray(dataset.id) ||
    !Array.isArray(dataset.size) ||
    !requiredDimensions.every((dimension) => dataset.id.includes(dimension))
  ) {
    throw new Error('Réponse Eurostat invalide : dimensions requises absentes.');
  }

  const geoPosition = findDimensionPosition(dataset, 'geo');
  const timePosition = findDimensionPosition(dataset, 'time');
  const geoIndexes = dataset.dimension?.geo?.category?.index;
  const timeIndexes = dataset.dimension?.time?.category?.index;

  if (geoPosition < 0 || timePosition < 0 || !geoIndexes || !timeIndexes) {
    throw new Error('Réponse Eurostat invalide : index géographique ou temporel absent.');
  }

  const strides = dataset.size.map((_, position) => (
    dataset.size.slice(position + 1).reduce((product, size) => product * size, 1)
  ));
  const periods = Object.entries(timeIndexes)
    .map(([period, index]) => ({ period, index }))
    .sort((left, right) => left.index - right.index);

  return Object.fromEntries(
    Object.entries(geoIndexes).map(([geo, geoIndex]) => [
      geo,
      periods.flatMap(({ period, index }) => {
        const offset = geoIndex * strides[geoPosition] + index * strides[timePosition];
        const value = dataset.value?.[offset];
        return Number.isFinite(value) ? [{ period, value }] : [];
      })
    ])
  );
};

export const parseEurostatInflation = (dataset) => ({
  updatedAt: dataset?.updated,
  inflation: parseEurostatGeoTimeSeries(dataset, ['freq', 'unit', 'coicop18', 'geo', 'time'])
});

export const parseEurostatSeries = (dataset, requiredDimensions) => ({
  updatedAt: dataset?.updated,
  series: parseEurostatGeoTimeSeries(dataset, requiredDimensions)
});

export const fetchEurostatDataset = async (url, parser, { signal } = {}) => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Eurostat a renvoyé le statut ${response.status}.`);
  }
  return parser(await response.json());
};

const HICP_URL = createEurostatUrl('prc_hicp_minr', {
  geo: ['FR', 'EA20'],
  coicop18: 'TOTAL',
  unit: 'RCH_A'
});

export const fetchEurostatInflation = (options) =>
  fetchEurostatDataset(HICP_URL, parseEurostatInflation, options);

export const eurostatInflationSource = {
  label: 'Eurostat — IPCH, ensemble des produits, variation annuelle',
  url: 'https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_minr/default/table?lang=fr'
};

const UNEMPLOYMENT_URL = createEurostatUrl('une_rt_m', {
  geo: ['FR', 'EU27_2020'],
  sex: 'T',
  age: 'TOTAL',
  unit: 'PC_ACT',
  s_adj: 'SA'
});

export const fetchEurostatUnemployment = (options) =>
  fetchEurostatDataset(
    UNEMPLOYMENT_URL,
    (dataset) => ({
      updatedAt: dataset?.updated,
      unemployment: parseEurostatGeoTimeSeries(dataset, ['freq', 'unit', 'geo', 'time'])
    }),
    options
  );

export const eurostatUnemploymentSource = {
  label: 'Eurostat — taux de chômage, 15–74 ans, données désaisonnalisées',
  url: 'https://ec.europa.eu/eurostat/databrowser/view/une_rt_m/default/table?lang=fr'
};

export { createEurostatUrl };
