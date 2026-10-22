# Simulateur de Régulation Monétaire

**Développé par Jean-Baptiste BATOLA**

## Public visé et question centrale

Ce prototype s’adresse en priorité aux **élus français et à leurs collaborateurs
parlementaires**. Sa question centrale est : **« Comment un choc de prix de
l’énergie pourrait-il affecter l’inflation, l’emploi et les inégalités en France,
en Europe et dans le monde au cours des 12 prochains mois ? »**

Il est conçu comme un appui transparent à la compréhension et à la préparation
d’échanges, jamais comme une source certifiée, une autorité institutionnelle ou un
outil de décision autonome.

## Description

Simulateur interactif avancé du mécanisme de régulation monétaire automatique. Cet outil éducatif permet d'analyser et de tester différents scénarios économiques à travers un système de régulation monétaire publique automatisé.

## Fonctionnalités

- ✅ **Modèle de simulation éducatif** - Règles déterministes et paramètres ajustables
- ✅ **6 scénarios économiques** - De la situation normale à l'hyperinflation
- ✅ **Projections à court terme** - Projection déterministe des trois prochains mois
- ✅ **Interface moderne** - Design professionnel et élégant
- ✅ **Métriques en temps réel** - Suivi des indicateurs économiques
- ✅ **Export des données** - Fonctionnalités d'analyse et de partage

## Installation et Utilisation

```bash
# Installation des dépendances
npm install

# Lancement en mode développement
npm run dev

# Construction pour la production
npm run build

# Exécution des tests de calcul
npm test
```

## Pilot demo reproductible

Le bouton **Pilot demo**, visible dans la barre de commandes, ouvre un parcours
stable et contraint pour présenter le prototype :

1. lancez `npm run dev`, puis ouvrez l’adresse indiquée par Vite ;
2. sélectionnez **Pilot demo** ;
3. le preset sélectionne le scénario **Poussée inflationniste**, avec un choc des
   prix de l’énergie au troisième mois, un horizon fixe de douze mois et la
   comparaison « Référence / Priorité protection sociale » ;
4. lisez la question, les hypothèses, les sources et leur fraîcheur, la sortie
   conditionnelle, puis les limites et la question suivante ;
5. utilisez **Exporter le briefing** pour télécharger une note texte adaptée à une
   séance de travail. Quittez ensuite le parcours pour retrouver les fonctions
   avancées et personnalisables.

L’emploi est volontairement signalé comme **non simulé** : le parcours expose les
observations de chômage disponibles plutôt que d’inventer une prévision.

## Hors périmètre

Le projet ne fournit pas de prévision macroéconomique certifiée, d’estimation
causale, de recommandation de politique publique, de conseil financier ou juridique,
ni de simulation exhaustive des transmissions internationales et sectorielles. Les
indices sociaux sont synthétiques et les données publiques peuvent être révisées.

## Scénarios Disponibles

Les valeurs affichées dans chaque scénario sont des repères pédagogiques. Elles ne constituent pas des résultats validés ni des prévisions économiques.

1. **Situation Normale** - Croissance stable, inflation maîtrisée
2. **Poussée Inflationniste** - Test de résistance du système
3. **Crise Économique** - Récession et risque déflationniste
4. **Phase de Reprise** - Sortie de crise progressive
5. **Stagflation** - Inflation élevée et croissance faible
6. **Hyperinflation** - Scénario extrême de test

## Indicateurs Suivis

- **Inflation** - Taux d'inflation mensuel (cible 2%)
- **Dividende Universel** - Montant distribué (600-1500€)
- **Taxe sur le Patrimoine** - Taux de taxation (2-20%)
- **Crédit Public** - Volume de crédit disponible (20-200%)
- **Bien-être Social** - Indice composite (0-100%)
- **Inégalités** - Niveau d'inégalité sociale (15-70%)

## Méthodologie et limites

Le simulateur applique un modèle heuristique déterministe par pas mensuel. Les tendances
et chocs de chaque scénario modifient l'inflation, puis les règles de régulation ajustent
le dividende, la taxation et le crédit public. Les indices de bien-être et d'inégalités
sont des indicateurs synthétiques bornés.

Les coefficients ne sont pas calibrés sur des observations économétriques et les
projections ne sont pas des prévisions économiques. Les données historiques affichées
servent uniquement de repères contextuels ; elles sont déclarées comme provenant de
l'INSEE, de la Banque de France et d'Eurostat dans `src/data/officialData.js`.

### Données macroéconomiques automatiquement consultées

Le tableau de contexte interroge, directement depuis le navigateur, les APIs publiques
d'Eurostat et de la BCE. Il affiche les dernières valeurs disponibles, leur date de
mise à jour source, l'unité, la fréquence et un lien direct vers chaque jeu de données.
La couverture est la France et la zone euro (EA20) lorsqu'Eurostat fournit les deux
séries ; les taux directeurs et le crédit bancaire sont des agrégats de la zone euro.

| Indicateur | Source | Fréquence |
| --- | --- | --- |
| IPCH global et énergie, taux de chômage | Eurostat | Mensuelle |
| PIB réel (variation trimestrielle annualisée), coût du travail, dette publique | Eurostat | Trimestrielle |
| Taux de la facilité de dépôt | BCE | Quotidienne |
| Encours de prêts aux sociétés non financières et aux ménages de la zone euro | BCE | Mensuelle |

Les données peuvent être indisponibles à cause du réseau, du navigateur ou de l'API :
l'interface l'indique alors explicitement et propose de réessayer, sans substituer de
valeur. Leur affichage depuis ces sources publiques ne vaut pas certification
institutionnelle par cette application.

### Comparaison économique annuelle

Le tableau **Comparaison économique annuelle** est un mode d'analyse séparé, avec les
couples France–Europe (UE27), France–Monde et Europe–Monde. Il permet d'afficher le
dernier millésime commun ou un historique de dix années communes pour l'inflation, la
croissance du PIB réel et le chômage ; la dette publique est disponible seulement pour
France–Europe lorsque la série Eurostat est comparable.

- France–Europe : Eurostat, séries annuelles harmonisées.
- Comparaisons incluant le monde : API publique de la Banque mondiale (CORS vérifié),
  avec séries annuelles comparables. L'inflation y est l'IPC et non l'IPCH.
- L'API DataMapper du FMI a été écartée : bien que publique, son endpoint vérifié ne
  communique pas d'en-tête CORS, donc il ne peut pas être interrogé de façon fiable par
  cette application uniquement frontend.

Chaque sélection affiche explicitement sa source, sa fréquence, son unité, le périmètre,
la date de mise à jour et une action de nouvelle tentative. Les années sans observation
dans l'une des deux séries sont exclues plutôt que complétées ou estimées.

## Comparaison de politiques

Le mode de comparaison confronte, à horizon de douze mois, les paramètres de référence
à une orientation alternative de stabilité des prix ou de protection sociale. Il génère
une note de synthèse exportable incluant les hypothèses et les écarts simulés. Ces écarts
ne sont pas des effets causaux établis et ne doivent pas guider une décision publique
sans analyse économique, juridique et démocratique indépendante.

## Appui à la décision, garde-fous et gouvernance

Le panneau **Appui transparent à la décision** est une aide pédagogique à la lecture
des scénarios, et non un moteur de décision. Il présente une sortie conditionnelle,
son horizon (un mois pour les prévisions, douze mois pour les alternatives), les
hypothèses, les orientations comparées, l'incertitude et une mention de **revue
humaine obligatoire**. Il ne possède aucune autorité autonome et ne constitue ni une
certification, ni un avis de politique publique.

La prévision du modèle calibré est confrontée à un repère indépendant de persistance :
celui-ci reprend la dernière inflation française observée sans employer les coefficients
ni la cible du modèle. L'écart est affiché et considéré comme matériel à partir de
0,50 point d'inflation. Ce n'est pas une validation croisée complète, mais un contrôle
simple et lisible contre une extrapolation naïve.

### Comparaison de prévisions et prototype multivarié

Le panneau **Comparaison de modèles et ensemble** applique un contrat commun à trois
prévisions IPCH France à un mois : un repère de persistance, l'adaptateur de
l'heuristique calibrée existante, et un **prototype autorégressif multivarié
régularisé (éducatif/local)**. Les trois n'emploient que les observations mensuelles
France–EA20 communes fournies par Eurostat. Chaque modèle déclare sa disponibilité,
son intervalle indicatif et sa limite ; l'interface ne remplace jamais une absence de
données par une valeur inventée.

L'ensemble ne pondère que les modèles ayant au moins 12 prévisions rétrospectives
valides. Ses poids sont l'inverse de leur erreur absolue moyenne sur les 12 dernières
origines du backtest, normalisé entre ces seuls modèles. L'enveloppe affichée est la
borne des intervalles des membres : elle rend visible leur désaccord et **n'est pas**
un intervalle probabiliste.

Le prototype multivarié local ajuste deux équations autorégressives à un retard avec
régularisation ridge sur l'inflation France et EA20. Il n'est **pas un BVAR** : il
n'utilise ni priors bayésiens, ni échantillonnage/estimation de postérieur, ni
validation institutionnelle. Son contrat de sortie isolé permet de le remplacer
ultérieurement par un BVAR réel exécuté et gouverné côté serveur, sans présenter ce
prototype comme tel. Toutes ces sorties sont éducatives, locales, sans revendication
institutionnelle, et soumises à une **revue humaine obligatoire**.

Par prudence, le panneau bloque toute sortie conditionnelle si l'un des garde-fous
ci-dessous échoue :

- données IPCH France et zone euro indisponibles ou millésime source âgé de plus de
  45 jours ;
- calibration indisponible ou fondée sur moins de 24 mois communs ;
- backtest à un mois sur moins de 12 mois, erreur absolue moyenne supérieure à
  1,50 point, ou couverture de l'intervalle à 80 % inférieure à 60 %.

Ces seuils sont des règles de sûreté du prototype, pas des critères réglementaires ou
des standards institutionnels. La page affiche le statut de chaque contrôle, le
millésime et l'âge calculé des données. Les cartes de contexte affichent aussi la date
de préparation/mise à jour communiquée par Eurostat ou la BCE, la fréquence, l'unité
et le périmètre. Les données publiques peuvent être révisées après leur consultation.

Le bouton de journalisation enregistre manuellement le scénario, la configuration,
le millésime des données et la sortie affichée dans le seul `localStorage` du navigateur
(maximum 50 entrées) ; ce journal peut être exporté en JSON. Il n'est pas synchronisé,
authentifié, infalsifiable, durable ou sécurisé par l'application. Il ne remplace donc
pas un registre institutionnel.

### Cohérence des séries et incertitude

Chaque affichage de contexte indique sa définition, son périmètre géographique, sa
fréquence, son unité, sa source et le millésime communiqué par celle-ci. La matrice de
compatibilité autorise uniquement les couples annuels explicitement définis : France–UE27
pour les quatre indicateurs, et France–Monde ou UE27–Monde pour inflation, PIB et
chômage. La dette avec le monde est bloquée plutôt que rapprochée artificiellement.
Les données mensuelles/trimestrielles de contexte ne sont jamais combinées avec ces
séries annuelles ni injectées dans l’appui à la décision, qui n’emploie que l’IPCH
France–EA20 de même définition, unité et fréquence.

Les comparaisons annuelles n’affichent que les années communes. À partir de quatre
années communes, elles affichent la fourchette interquartile des écarts observés avec
une qualification de qualité ; elle décrit une dispersion historique, et n’est ni un
intervalle de confiance, ni une prévision, ni une preuve causale. Avec moins de quatre
années, aucune fourchette n’est produite.

Le registre visible des hypothèses causales recense les liens programmés, leur sens,
leur délai et leur statut. Ils sont tous des règles heuristiques ou des indices
synthétiques : aucune relation ne constitue une preuve causale.

## Technologies Utilisées

- **React 19** - Framework frontend moderne
- **Tailwind CSS** - Styling utilitaire
- **Framer Motion** - Animations fluides
- **Recharts** - Visualisations de données
- **Lucide React** - Icônes modernes

## Architecture du Projet

```
src/
├── components/          # Composants React
├── data/               # Données et scénarios
├── hooks/              # Hooks personnalisés
├── utils/              # Fonctions utilitaires
└── main.jsx           # Point d'entrée Vite
```

## Espaces de travail

L’interface regroupe les fonctionnalités sans les retirer :

- **Vue d’ensemble** : contexte macroéconomique, statut conditionnel, qualité des données et alertes ;
- **Données observées** : comparaisons géographiques annuelles, historique, graphiques et calibration/backtest IPCH ;
- **Scénarios et politiques** : variantes de scénarios, paramètres avancés, comparaison de scénarios et de politiques ;
- **Prévisions et modèles** : projections déterministes et comparaison/ensemble de modèles ;
- **Méthodologie et audit** : garde-fous de décision, registre d’hypothèses, journal local et explication de la régulation.

Les onglets suivent le motif accessible `tablist` : utilisez **Flèche gauche/droite**, **Début** ou **Fin** lorsqu’un onglet a le focus. Les commandes globales restent visibles pour conserver le scénario et l’état de simulation lors d’un changement d’espace.

### Lecture et présentation

Les graphiques répondent chacun à une question explicite. Les graphiques d’inflation
matérialisent la cible de 2 %, les chocs du scénario sont annotés lorsqu’ils
s’appliquent, et les projections affichent leurs bornes d’incertitude disponibles.
Chaque graphique fournit aussi une description textuelle de ses séries, unités et
limites.

Le bouton **Présenter** ouvre une lecture plein écran épurée de la question, des
données IPCH disponibles, du scénario, de la sortie strictement conditionnelle et
des incertitudes. Il masque les contrôles techniques ; utilisez **Échap** ou
**Quitter** pour revenir à l’application. Cette vue reste éducative et soumise à une
revue humaine obligatoire.

Les badges de qualité indiquent si une source est **à jour** (≤ 7 jours), en
**délai acceptable** (≤ 45 jours), **ancienne** (> 45 jours) ou **incomplète**. Ils
affichent systématiquement définition, source et millésime, sans substituer de
valeur si une source est indisponible.

## Raccourcis Clavier

- **Espace** - Démarrer/Arrêter la simulation
- **R** - Réinitialiser la simulation
- **A** - Afficher/masquer les contrôles avancés

## À propos

Ce projet est un simulateur éducatif développé par Jean-Baptiste BATOLA. Il vise à explorer et comprendre les mécanismes de régulation monétaire automatique. Les projections sont déterministes et ne constituent ni des prévisions économiques réelles ni des conseils financiers.

## Support

Pour toute question ou suggestion, vous pouvez contacter Jean-Baptiste BATOLA.

## Licence

© 2024 Jean-Baptiste BATOLA. Tous droits réservés.

---

**Version**: 2.0.1
**Dernière mise à jour**: septembre 2026

**Note**: Ce projet est uniquement à des fins éducatives et de recherche.