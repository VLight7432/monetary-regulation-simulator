export const modelMetadata = {
  scope: 'Modèle heuristique déterministe à vocation éducative',
  assumptions: [
    'Chaque pas de simulation représente un mois.',
    'Les scénarios définissent une variation d’inflation et des chocs ponctuels.',
    'Le dividende, la taxation et le crédit public agissent sur l’inflation du mois suivant.'
  ],
  mechanisms: [
    'L’écart entre l’inflation et sa cible ajuste le dividende et le volume de crédit.',
    'Une inflation supérieure à la cible augmente la taxation du patrimoine.',
    'Le bien-être et les inégalités sont des indices synthétiques bornés, calculés à partir des politiques appliquées.'
  ],
  bounds: [
    'Inflation : de -3 % à 10 %',
    'Dividende : de 600 EUR à 1 500 EUR',
    'Taxe sur le patrimoine : de 2 % à 20 %',
    'Crédit public : de 20 % à 200 %',
    'Bien-être : de 0 à 100',
    'Inégalités : de 15 à 70'
  ],
  limitations: [
    'Les coefficients ne sont pas calibrés sur des observations économétriques.',
    'Les projections prolongent les règles du scénario sélectionné ; elles ne sont pas des prévisions.',
    'Les données historiques affichées servent uniquement de repères contextuels.'
  ]
};
