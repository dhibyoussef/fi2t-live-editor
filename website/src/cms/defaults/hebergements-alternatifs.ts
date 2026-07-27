import { buildGroupementDefaults } from './groupement-shared'

export const HEBERGEMENTS_ALTERNATIFS_DEFAULTS = buildGroupementDefaults({
  title: "L'hébergement alternatif touristique",
  intro:
    "L'hébergement alternatif désigne des types de logements qui offrent une expérience unique et souvent immersive, en opposition aux structures hôtelières conventionnelles. Ce type d'hébergement peut inclure : maisons d'hôtes, lodges, glamping, gîtes, et autres formules hors standards hôteliers.",
  pillars: [
    { title: 'Durabilité', icon: '/images/g-icon-structure.svg' },
    { title: 'Authenticité', icon: '/images/g-icon-interets.svg' },
    { title: 'Expérience', icon: '/images/g-icon-valeur.svg' },
    { title: 'Innovation', icon: '/images/g-icon-cadre.svg' },
  ],
  challengesTitle: 'Défis du secteur',
  challenges: [
    {
      number: '01',
      title: 'Cadre réglementaire inadapté',
      body: 'Absence de cadre clair pour reconnaître et structurer les formes d’hébergement alternatif.',
      constat: 'Constat FI2T : une réglementation adaptée est indispensable pour sortir de l’informel.',
    },
    {
      number: '02',
      title: 'Visibilité limitée',
      body: 'Faible présence dans les circuits de distribution et les stratégies nationales de promotion.',
    },
    {
      number: '03',
      title: 'Qualité et standards',
      body: 'Besoin de référentiels de qualité spécifiques aux hébergements alternatifs.',
    },
    {
      number: '04',
      title: 'Accès au financement',
      body: 'Difficultés d’accès au crédit et aux dispositifs d’accompagnement pour les petits opérateurs.',
    },
    {
      number: '05',
      title: 'Formation des acteurs',
      body: 'Manque de parcours de formation dédiés à l’accueil, la gestion et la commercialisation alternative.',
    },
  ],
  enjeuxItems: [
    'Positionner l’hébergement alternatif comme levier de diversification touristique.',
    'Valoriser l’authenticité et le tourisme d’expérience.',
    'Structurer le segment pour attirer investissement et emplois.',
    'Intégrer ces offres dans la stratégie nationale de destination.',
    'Réduire l’informel par un cadre incitatif et moderne.',
  ],
  proposals: [
    {
      title: 'Reconnaissance réglementaire du segment',
      body: 'Proposer un cadre légal clair pour les hébergements alternatifs et leurs catégories.',
    },
    {
      title: 'Label et standards de qualité',
      body: 'Créer un référentiel qualité adapté aux lodges, maisons d’hôtes et formules immersives.',
    },
    {
      title: 'Promotion et distribution',
      body: 'Intégrer l’offre alternative dans les campagnes de destination et les canaux digitaux.',
    },
    {
      title: 'Accompagnement économique',
      body: 'Faciliter l’accès au financement et aux dispositifs d’appui aux opérateurs.',
    },
    {
      title: 'Formation et professionnalisation',
      body: 'Développer des programmes de formation spécifiques à l’accueil et à la gestion alternative.',
    },
  ],
})
