export const policyOptions = [
  {
    id: 'reference',
    name: 'Référence',
    description: 'Maintien des paramètres actuels du modèle.',
    overrides: {}
  },
  {
    id: 'price-stability',
    name: 'Priorité stabilité des prix',
    description: 'Réactivité du dividende et intensité de taxation renforcées.',
    overrides: {
      dividendReactivity: 0.04,
      taxIntensity: 4,
      wellbeingWeight: 0.4,
      equalityWeight: 0.6
    }
  },
  {
    id: 'social-protection',
    name: 'Priorité protection sociale',
    description: 'Pondération accrue des effets de bien-être et d’égalité.',
    overrides: {
      dividendReactivity: 0.015,
      taxIntensity: 3,
      wellbeingWeight: 1,
      equalityWeight: 1
    }
  }
];
