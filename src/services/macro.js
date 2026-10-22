import { createEurostatUrl, fetchEurostatDataset, parseEurostatSeries } from './eurostat.js';

const eurostatSeries = (dataset, parameters, requiredDimensions) => {
  const url = createEurostatUrl(dataset, parameters);
  return {
    fetch: (options) => fetchEurostatDataset(
      url,
      (response) => parseEurostatSeries(response, requiredDimensions),
      options
    )
  };
};

export const macroSeries = {
  gdp: {
    id: 'gdp',
    title: 'PIB réel',
    description: 'Croissance trimestrielle annualisée',
    frequency: 'Trimestrielle',
    unit: '%',
    source: {
      label: 'Eurostat — PIB et composantes, données trimestrielles',
      url: 'https://ec.europa.eu/eurostat/databrowser/view/namq_10_gdp/default/table?lang=fr'
    },
    ...eurostatSeries('namq_10_gdp', {
      geo: ['FR', 'EA20'], na_item: 'B1GQ', unit: 'CLV_PCH_ANN', s_adj: 'SCA'
    }, ['freq', 'unit', 's_adj', 'na_item', 'geo', 'time'])
  },
  labourCosts: {
    id: 'labourCosts',
    title: 'Coûts de la main-d’œuvre',
    description: 'Indice du coût du travail, variation trimestrielle',
    frequency: 'Trimestrielle',
    unit: '%',
    source: {
      label: 'Eurostat — indice du coût du travail, valeur nominale',
      url: 'https://ec.europa.eu/eurostat/databrowser/view/lc_lci_r2_q/default/table?lang=fr'
    },
    ...eurostatSeries('lc_lci_r2_q', {
      geo: ['FR', 'EA20'], nace_r2: 'B-S', unit: 'PCH_PRE', s_adj: 'SCA', lcstruct: 'D1_D4_MD5'
    }, ['freq', 's_adj', 'unit', 'nace_r2', 'lcstruct', 'geo', 'time'])
  },
  energyInflation: {
    id: 'energyInflation',
    title: 'Inflation IPCH énergie',
    description: 'Variation annuelle de la composante énergie',
    frequency: 'Mensuelle',
    unit: '%',
    source: {
      label: 'Eurostat — IPCH énergie, variation annuelle',
      url: 'https://ec.europa.eu/eurostat/databrowser/view/prc_hicp_manr/default/table?lang=fr'
    },
    ...eurostatSeries('prc_hicp_manr', {
      geo: ['FR', 'EA20'], coicop: 'CP045', unit: 'RCH_A'
    }, ['freq', 'unit', 'coicop', 'geo', 'time'])
  },
  governmentDebt: {
    id: 'governmentDebt',
    title: 'Dette publique',
    description: 'Dette brute des administrations publiques',
    frequency: 'Trimestrielle',
    unit: '% du PIB',
    source: {
      label: 'Eurostat — dette publique trimestrielle',
      url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10q_ggdebt/default/table?lang=fr'
    },
    ...eurostatSeries('gov_10q_ggdebt', {
      geo: ['FR', 'EA20'], sector: 'S13', na_item: 'GD', unit: 'PC_GDP'
    }, ['freq', 'na_item', 'sector', 'unit', 'geo', 'time'])
  }
};

export const parseEcbSdmxSeries = (dataset) => {
  const observations = dataset?.dataSets?.[0]?.series;
  const periods = dataset?.structure?.dimensions?.observation?.[0]?.values;
  if (!observations || !Array.isArray(periods)) {
    throw new Error('Réponse ECB invalide : observations ou périodes absentes.');
  }

  return {
    updatedAt: dataset.dataSets[0].validFrom || dataset.header?.prepared,
    series: Object.values(observations).map((entry) => (
      Object.entries(entry.observations || {})
        .map(([index, values]) => ({ period: periods[Number(index)]?.id, value: values?.[0] }))
        .filter(({ period, value }) => period && Number.isFinite(value))
        .sort((left, right) => left.period.localeCompare(right.period))
    ))
  };
};

const fetchEcbDataset = async (url, { signal } = {}) => {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`La BCE a renvoyé le statut ${response.status}.`);
  }
  return parseEcbSdmxSeries(await response.json());
};

const ECB_BASE = 'https://data-api.ecb.europa.eu/service/data/';

export const ecbMacroSeries = {
  policyRate: {
    id: 'policyRate',
    title: 'Taux de dépôt BCE',
    description: 'Taux directeur de la facilité de dépôt',
    frequency: 'Quotidienne',
    unit: '%',
    source: {
      label: 'BCE — taux directeurs (facilité de dépôt)',
      url: 'https://data.ecb.europa.eu/data/datasets/FM/FM.D.U2.EUR.4F.KR.DFR.LEV'
    },
    fetch: (options) => fetchEcbDataset(
      `${ECB_BASE}FM/D.U2.EUR.4F.KR.DFR.LEV?format=jsondata&startPeriod=2020-01-01`,
      options
    )
  },
  privateCredit: {
    id: 'privateCredit',
    title: 'Crédit au secteur privé',
    description: 'Encours de prêts aux sociétés non financières et ménages, zone euro',
    frequency: 'Mensuelle',
    unit: 'M€',
    source: {
      label: 'BCE — bilan des IFM, prêts au secteur privé',
      url: 'https://data.ecb.europa.eu/data/datasets/BSI'
    },
    fetch: async (options) => {
      const data = await fetchEcbDataset(
        `${ECB_BASE}BSI/M.U2.Y.U.A20.A.1.U2.2240+2250.Z01.E?format=jsondata&startPeriod=2020-01-01`,
        options
      );
      if (data.series.length !== 2) {
        throw new Error('La BCE n’a pas fourni les deux composantes du crédit privé.');
      }
      const totals = new Map();
      data.series.forEach((series) => series.forEach(({ period, value }) => {
        const current = totals.get(period) || { value: 0, count: 0 };
        totals.set(period, { value: current.value + value, count: current.count + 1 });
      }));
      return {
        updatedAt: data.updatedAt,
        series: [[...totals.entries()]
          .filter(([, total]) => total.count === data.series.length)
          .map(([period, total]) => ({ period, value: total.value }))]
      };
    }
  }
};

export const allAdditionalMacroSeries = [...Object.values(macroSeries), ...Object.values(ecbMacroSeries)];
