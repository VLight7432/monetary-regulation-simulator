export const hicpContextMetadata = {
  id: 'hicp-fr-ea20',
  definition: 'IPCH global, variation annuelle (RCH_A), ensemble des produits',
  geography: 'France (FR) et zone euro à 20 pays (EA20)',
  frequency: 'Mensuelle',
  unit: '%',
  source: 'Eurostat — prc_hicp_minr'
};

const annualCompatibility = {
  franceEurope: ['inflation', 'gdp', 'unemployment', 'debt'],
  franceWorld: ['inflation', 'gdp', 'unemployment'],
  europeWorld: ['inflation', 'gdp', 'unemployment']
};

export const validateAnnualComparison = (pairId, indicatorId) => {
  const allowed = annualCompatibility[pairId]?.includes(indicatorId);
  return allowed
    ? { compatible: true, reason: null }
    : {
      compatible: false,
      reason: 'Comparaison bloquée : aucune définition annuelle commune validée pour cet indicateur et ce périmètre.'
    };
};

export const validateSeriesCompatibility = (left, right) => {
  const mismatches = ['definition', 'frequency', 'unit', 'geographyFramework']
    .filter((field) => left?.[field] !== right?.[field]);
  return {
    compatible: mismatches.length === 0,
    mismatches,
    reason: mismatches.length
      ? `Comparaison bloquée : ${mismatches.join(', ')} ne correspondent pas.`
      : null
  };
};

const percentile = (values, fraction) => {
  const ordered = [...values].sort((left, right) => left - right);
  const index = (ordered.length - 1) * fraction;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return ordered[lower] + (ordered[upper] - ordered[lower]) * (index - lower);
};

export const assessComparisonQuality = (points = [], updatedAt) => {
  const differences = points.map(({ left, right }) => left - right);
  const enoughHistory = differences.length >= 4;
  return {
    observationCount: points.length,
    periodCoverage: points.length ? `${points[0].period}–${points.at(-1).period}` : 'aucune période commune',
    sourceVintage: updatedAt || null,
    quality: enoughHistory ? 'contexte indicatif' : 'contexte très limité',
    uncertainty: enoughHistory
      ? {
        lower: percentile(differences, 0.25),
        upper: percentile(differences, 0.75),
        label: 'Fourchette interquartile des écarts annuels observés'
      }
      : null,
    limitation: enoughHistory
      ? 'La fourchette décrit la dispersion historique des écarts, pas un intervalle de confiance, une prévision ou un effet causal.'
      : 'Moins de quatre années communes : aucune fourchette d’incertitude n’est calculée afin d’éviter une précision trompeuse.'
  };
};

export const causalAssumptionRegistry = [
  {
    input: 'Écart inflation–cible',
    output: 'Dividende et crédit public',
    direction: 'Écart positif : baisse ; écart négatif : hausse',
    lag: 'Pas mensuel suivant',
    evidence: 'Règle heuristique du simulateur',
    limitation: 'Aucune estimation causale ni identification empirique.'
  },
  {
    input: 'Inflation au-dessus de la cible',
    output: 'Taxe sur le patrimoine',
    direction: 'Hausse',
    lag: 'Pas mensuel suivant',
    evidence: 'Règle heuristique du simulateur',
    limitation: 'Ne démontre pas l’effet d’une taxe sur l’inflation ou la distribution.'
  },
  {
    input: 'Dividende, taxe et crédit simulés',
    output: 'Bien-être et inégalités',
    direction: 'Déterminée par les pondérations choisies',
    lag: 'Pas mensuel suivant',
    evidence: 'Indices synthétiques bornés',
    limitation: 'Indices pédagogiques, sans mesure observée ni validation causale.'
  }
];
