import { scenarios } from '../data/scenarios.js';
import { policyOptions } from '../data/policyOptions.js';
import { comparePolicyScenarios } from './policySimulation.js';
import { assessDataQuality } from './dataQuality.js';

export const pilotDemoPreset = {
  scenarioId: 'inflation',
  horizonMonths: 12,
  comparisonPolicyId: 'social-protection',
  question: 'Comment un choc de prix de l’énergie pourrait-il affecter l’inflation, l’emploi et les inégalités en France, en Europe et dans le monde au cours des 12 prochains mois ?',
  assumptions: [
    'Un choc de prix de l’énergie est programmé au 3e mois ; son intensité et sa transmission sont des hypothèses du modèle.',
    'La comparaison oppose les paramètres de référence à une orientation de protection sociale, sans représenter une mesure réelle.',
    'Les inégalités et le bien-être sont des indices synthétiques ; le modèle ne produit pas de prévision d’emploi.'
  ],
  limitations: 'Les résultats sont déterministes et heuristiques. Ils ne quantifient pas un effet causal, ne couvrent pas les boucles internationales et ne remplacent ni expertise économique, ni instruction juridique, ni débat démocratique.'
};

export const buildPilotDemoBriefing = ({
  initialState,
  parameters,
  inflationSource,
  unemploymentSource,
  now
}) => {
  const scenario = scenarios[pilotDemoPreset.scenarioId];
  const alternative = policyOptions.find(({ id }) => id === pilotDemoPreset.comparisonPolicyId);
  const comparison = comparePolicyScenarios(
    initialState,
    scenario,
    parameters,
    { ...parameters, ...alternative.overrides },
    0
  );
  const referenceFinal = comparison.reference.at(-1);
  const alternativeFinal = comparison.alternative.at(-1);
  const inflationQuality = assessDataQuality(inflationSource, inflationSource.data?.updatedAt, now);
  const unemploymentQuality = assessDataQuality(unemploymentSource, unemploymentSource.data?.updatedAt, now);

  return {
    scenario,
    alternative,
    comparison,
    referenceFinal,
    alternativeFinal,
    inflationQuality,
    unemploymentQuality,
    nextDecisionQuestion: 'Quels ménages, secteurs et mesures d’accompagnement faut-il examiner en priorité avant de comparer des options réelles ?'
  };
};

export const formatPilotDemoBriefing = (briefing, { inflationUpdatedAt, unemploymentUpdatedAt }) => [
  'BRIEFING — PILOT DEMO',
  'Prototype transparent d’appui éducatif — non certifié et non autoritatif',
  '',
  `Question : ${pilotDemoPreset.question}`,
  `Scénario contraint : ${briefing.scenario.name}`,
  `Horizon : ${pilotDemoPreset.horizonMonths} mois`,
  `Comparaison : Référence / ${briefing.alternative.name}`,
  '',
  'HYPOTHÈSES',
  ...pilotDemoPreset.assumptions.map((assumption) => `- ${assumption}`),
  '',
  'SORTIES CONDITIONNELLES À 12 MOIS',
  `Inflation simulée : référence ${briefing.referenceFinal.inflation.toFixed(1)} % ; alternative ${briefing.alternativeFinal.inflation.toFixed(1)} % ; écart ${briefing.comparison.delta.inflation.toFixed(1)} point.`,
  `Inégalités synthétiques : référence ${briefing.referenceFinal.inequality.toFixed(0)}/100 ; alternative ${briefing.alternativeFinal.inequality.toFixed(0)}/100 ; écart ${briefing.comparison.delta.inequality.toFixed(0)} point.`,
  'Emploi : non simulé ; à documenter avec les observations de chômage et une analyse sectorielle.',
  '',
  'ÉLÉMENTS DE PREUVE ET FRAÎCHEUR',
  `IPCH France / zone euro : ${briefing.inflationQuality.label.toLowerCase()} ; millésime source : ${inflationUpdatedAt || 'indisponible'}.`,
  `Chômage France / UE27 : ${briefing.unemploymentQuality.label.toLowerCase()} ; millésime source : ${unemploymentUpdatedAt || 'indisponible'}.`,
  'Monde : comparaisons annuelles disponibles dans « Données observées » ; elles ne sont pas injectées dans la simulation mensuelle.',
  '',
  'LECTURE CONDITIONNELLE',
  'Si les hypothèses du preset se vérifiaient, la comparaison illustre des écarts internes au modèle, et non des effets établis.',
  '',
  'INCERTITUDES ET LIMITES',
  pilotDemoPreset.limitations,
  '',
  `QUESTION POUR LA PROCHAINE DÉCISION : ${briefing.nextDecisionQuestion}`,
  '',
  'Toute utilisation requiert une revue humaine indépendante.'
].join('\n');
