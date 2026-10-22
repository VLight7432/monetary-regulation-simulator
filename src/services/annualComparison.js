import { createEurostatUrl, fetchEurostatDataset, parseEurostatSeries } from './eurostat.js';
import { validateAnnualComparison } from '../utils/comparisonGovernance.js';

const WORLD_BANK_BASE = 'https://api.worldbank.org/v2/country/';

export const annualIndicators = {
  inflation: {
    label: 'Inflation annuelle',
    unit: '%',
    eurostat: { dataset: 'prc_hicp_aind', parameters: { coicop: 'CP00', unit: 'RCH_A_AVG', freq: 'A' } },
    worldBank: 'FP.CPI.TOTL.ZG'
  },
  gdp: {
    label: 'Croissance du PIB réel annuel',
    unit: '%',
    eurostat: { dataset: 'nama_10_gdp', parameters: { na_item: 'B1GQ', unit: 'CLV_PCH_PRE', freq: 'A' } },
    worldBank: 'NY.GDP.MKTP.KD.ZG'
  },
  unemployment: {
    label: 'Taux de chômage annuel',
    unit: '% de la population active',
    eurostat: { dataset: 'une_rt_a', parameters: { sex: 'T', age: 'Y15-74', unit: 'PC_ACT', freq: 'A' } },
    worldBank: 'SL.UEM.TOTL.ZS'
  },
  debt: {
    label: 'Dette publique brute',
    unit: '% du PIB',
    eurostat: { dataset: 'gov_10dd_edpt1', parameters: { sector: 'S13', na_item: 'GD', unit: 'PC_GDP', freq: 'A' } }
  }
};

export const comparisonPairs = {
  franceEurope: { label: 'France – Europe', left: 'France', right: 'Union européenne (UE27)', geos: ['FR', 'EU27_2020'] },
  franceWorld: { label: 'France – Monde', left: 'France', right: 'Monde', geos: ['FRA', 'WLD'] },
  europeWorld: { label: 'Europe – Monde', left: 'Union européenne (UE27)', right: 'Monde', geos: ['EUU', 'WLD'] }
};

const eurostatSource = (indicator) => ({
  label: `Eurostat — ${annualIndicators[indicator].label}, données annuelles`,
  url: `https://ec.europa.eu/eurostat/databrowser/view/${annualIndicators[indicator].eurostat.dataset}/default/table?lang=fr`
});

const worldBankSource = (indicator) => ({
  label: `Banque mondiale — ${annualIndicators[indicator].label}, données annuelles`,
  url: `https://data.worldbank.org/indicator/${annualIndicators[indicator].worldBank}`
});

export const getAnnualComparisonConfig = (pairId, indicatorId) => {
  const pair = comparisonPairs[pairId];
  const indicator = annualIndicators[indicatorId];
  if (!pair || !indicator) throw new Error('Comparaison annuelle inconnue.');
  const compatibility = validateAnnualComparison(pairId, indicatorId);

  if (!compatibility.compatible) {
    return { pair, indicator, unavailable: compatibility.reason, compatibility };
  }

  if (pairId === 'franceEurope') {
    return {
      pair,
      indicator,
      source: eurostatSource(indicatorId),
      scope: 'Séries annuelles Eurostat harmonisées pour la France et l’UE27.',
      compatibility,
      fetch: (options) => {
        const { dataset, parameters } = indicator.eurostat;
        const url = createEurostatUrl(dataset, { ...parameters, geo: pair.geos });
        return fetchEurostatDataset(url, (datasetResponse) => ({
          updatedAt: datasetResponse.updated,
          series: parseEurostatSeries(datasetResponse, ['freq', 'unit', 'geo', 'time']).series
        }), options);
      }
    };
  }

  if (!indicator.worldBank) {
    return {
      pair,
      indicator,
      unavailable: 'La Banque mondiale ne publie pas une série annuelle comparable de dette pour ces agrégats. Cette comparaison est donc volontairement indisponible.'
    };
  }

  const url = new URL(`${WORLD_BANK_BASE}${pair.geos.join(';')}/indicator/${indicator.worldBank}`);
  url.search = new URLSearchParams({ format: 'json', per_page: '100', date: '1990:2025' }).toString();
  return {
    pair,
    indicator,
    source: worldBankSource(indicatorId),
    scope: 'Séries annuelles de la Banque mondiale ; inflation IPC (non IPCH), chômage modélisé OIT et agrégats nationaux/monde selon la définition de la source.',
    compatibility,
    fetch: (options) => fetchWorldBankAnnualSeries(url, pair.geos, options)
  };
};

export const parseWorldBankAnnualSeries = (payload, geos) => {
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
    throw new Error('Réponse Banque mondiale invalide : observations absentes.');
  }
  const series = Object.fromEntries(geos.map((geo) => [geo, []]));
  payload[1].forEach((observation) => {
    const geo = observation.countryiso3code;
    const year = observation.date;
    if (series[geo] && /^\d{4}$/.test(year) && Number.isFinite(observation.value)) {
      series[geo].push({ period: year, value: observation.value });
    }
  });
  Object.values(series).forEach((values) => values.sort((left, right) => left.period.localeCompare(right.period)));
  return { updatedAt: payload[0]?.lastupdated, series };
};

export const fetchWorldBankAnnualSeries = async (url, geos, { signal } = {}) => {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`La Banque mondiale a renvoyé le statut ${response.status}.`);
  return parseWorldBankAnnualSeries(await response.json(), geos);
};

export const alignAnnualSeries = (leftSeries = [], rightSeries = [], limit = 10) => {
  const rightByPeriod = new Map(rightSeries.map(({ period, value }) => [period, value]));
  return leftSeries
    .filter(({ period }) => rightByPeriod.has(period))
    .map(({ period, value }) => ({ period, left: value, right: rightByPeriod.get(period) }))
    .sort((left, right) => left.period.localeCompare(right.period))
    .slice(-limit);
};
