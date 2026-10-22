export const scenarios = {
  normal: { 
    name: "Situation normale",
    inflationTrend: [0.05, 0.08, 0.12, 0.15, 0.10, 0.08, 0.06, 0.04, 0.02, 0.05, 0.08, 0.10],
    shocks: [],
    description: "Croissance stable, inflation maîtrisée autour de 2%, pas de choc majeur. Le système de régulation maintient l'équilibre.",
    expectedValues: {
      inflation: "1.5-2.5%",
      dividend: "900-1200€", 
      taxRate: "3-7%",
      creditVolume: "80-120%",
      wellbeing: "70-85%"
    }
  },
  inflation: { 
    name: "Poussée inflationniste",
    inflationTrend: [0.3, 0.5, 0.8, 1.2, 1.5, 1.8, 1.3, 1.0, 0.7, 0.5, 0.3, 0.2],
    shocks: [
      { month: 3, intensity: 2.5, type: "hausse prix énergie" },
      { month: 7, intensity: 1.0, type: "tensions géopolitiques" }
    ],
    description: "Hausse rapide des prix due à l'énergie et aux matières premières. Test de la capacité du système à contenir l'inflation.",
    expectedValues: {
      inflation: "4-8%",
      dividend: "600-900€",
      taxRate: "8-15%", 
      creditVolume: "40-80%",
      wellbeing: "50-70%"
    }
  },
  crisis: { 
    name: "Crise économique",
    inflationTrend: [-0.3, -0.2, -0.1, 0.1, 0.2, 0.3, 0.2, 0.1, -0.1, -0.2, -0.3, -0.4],
    shocks: [
      { month: 1, intensity: -3, type: "choc financier" },
      { month: 6, intensity: -1.5, type: "baisse consommation" }
    ],
    description: "Récession profonde, chômage en hausse, risque de déflation. Le système doit stimuler l'économie.",
    expectedValues: {
      inflation: "-1% à +2%",
      dividend: "1200-1500€",
      taxRate: "2-5%",
      creditVolume: "120-200%", 
      wellbeing: "40-60%"
    }
  },
  recovery: {
    name: "Phase de reprise",
    inflationTrend: [-0.1, 0.1, 0.3, 0.5, 0.7, 0.8, 0.6, 0.4, 0.3, 0.2, 0.1, 0.05],
    shocks: [
      { month: 2, intensity: 1.5, type: "relance budgétaire" },
      { month: 8, intensity: 0.8, type: "reprise investissement" }
    ],
    description: "Sortie de crise avec reprise progressive. L'inflation remonte graduellement vers la cible de 2%.",
    expectedValues: {
      inflation: "0-4%",
      dividend: "800-1100€",
      taxRate: "4-9%",
      creditVolume: "90-140%",
      wellbeing: "60-80%"
    }
  },
  stagflation: {
    name: "Stagflation",
    inflationTrend: [0.8, 1.0, 1.2, 1.3, 1.1, 0.9, 0.8, 1.0, 1.2, 1.4, 1.2, 1.0],
    shocks: [
      { month: 4, intensity: 2.5, type: "hausse matières premières" },
      { month: 10, intensity: 1.8, type: "pénurie main d'œuvre" }
    ],
    description: "Situation complexe : inflation élevée persistante avec croissance faible. Dilemme pour la politique monétaire.",
    expectedValues: {
      inflation: "5-9%",
      dividend: "700-950€",
      taxRate: "10-18%",
      creditVolume: "50-90%",
      wellbeing: "45-65%"
    }
  },
  hyperinflation: {
    name: "Hyperinflation",
    inflationTrend: [2.0, 3.5, 5.0, 6.5, 8.0, 9.5, 8.0, 6.5, 5.0, 4.0, 3.0, 2.5],
    shocks: [
      { month: 2, intensity: 4.0, type: "effondrement monétaire" },
      { month: 5, intensity: 3.5, type: "panique monétaire" },
      { month: 9, intensity: -2.0, type: "mesures d'urgence" }
    ],
    description: "Scénario extrême d'hyperinflation. Test ultime du système de régulation automatique.",
    expectedValues: {
      inflation: "8-15%",
      dividend: "600-800€",
      taxRate: "15-20%",
      creditVolume: "20-60%",
      wellbeing: "25-45%"
    }
  }
};