import { groupementsJson } from '../../lib/groupements'

export const HOME_DEFAULTS: Record<string, string> = {
  'about.image': '/images/qui-sommes-nous-card.png?v=home2',
  // Keep the photograph clean: title, subtitle and CTAs are separate CMS blocks.
  'hero.image': '/hero.jpg',
  'hero.title': 'Le futur du tourisme tunisien se construit ici !',
  'hero.subtitle': 'Unir, innover et valoriser le tourisme tunisien',
  'hero.cta_primary': 'Découvrir la Fédération',
  'hero.cta_secondary': 'Adhérer maintenant',

  'about.title': 'Qui sommes-nous ?',
  'about.body':
    'La Fédération Interprofessionnelle du Tourisme Tunisien est un syndicat professionnel patronal indépendant fondé en mars 2016 par divers opérateurs du tourisme tunisien, venant d’activités différentes : agences de voyages, hébergements alternatifs, loisirs, animation, sports, transports…',
  'about.cta': 'Voir plus',
  'about.badge': "10+\nANNÉES D'ENGAGEMENT",
  'about.badge_pos': JSON.stringify({ left: -29, bottom: -43 }),

  'objectifs.title': 'Nos Objectifs',
  'objectifs.intro':
    "La Fi2T a pour objectif de fédérer différents opérateurs de tourisme au sein d'un même syndicat professionnel, en vue",
  'objectifs.items': JSON.stringify([
    {
      title: 'Vision stratégique',
      desc: 'Apporter sa contribution en matière de vision stratégique et pratique pour la diversification et l’innovation touristique en Tunisie',
    },
    {
      title: 'Intérêts des membres',
      desc: 'Sauvegarder les intérêts économiques et sociaux de ses membres',
    },
    {
      title: 'Synergie',
      desc: 'Créer une synergie entre les différents opérateurs du tourisme tunisien',
    },
    {
      title: 'Développement',
      desc: 'Contribuer au développement et à l’essor du tourisme tunisien',
    },
  ]),

  'groupements.title': 'Les Groupements Professionnels',
  'groupements.intro':
    'Dirigés par 3 membres élus, ils représentent et défendent les intérêts des opérateurs. Chaque groupement définit sa stratégie en toute autonomie pour une expertise métier ciblée.',
  'groupements.bg': '/images/bg 1.png',
  'groupements.items': groupementsJson(),

  'adherer.title': 'Pourquoi adhérer à la Fi2T ?',
  'adherer.image': '/images/Rectangle 27.png',
  'adherer.badge': "50+\nMEMBRES ACTIFS",
  'adherer.badge_pos': JSON.stringify({ right: -26, bottom: -49 }),
  'adherer.cta': 'Adhérer maintenant',
  'adherer.reasons': JSON.stringify([
    {
      title: 'Représentation Institutionnelle',
      desc: 'Être représenté auprès des gouvernements et institutions',
    },
    {
      title: 'Réseautage Stratégique',
      desc: 'Participer à un réseau professionnel structuré',
    },
    {
      title: 'Visibilité Accrue',
      desc: 'Améliorer sa visibilité et ses opportunités commerciales',
    },
    {
      title: 'Label de Qualité',
      desc: 'Bénéficier d’un label de qualité et de conformité',
    },
    {
      title: 'Ressources & Expertise',
      desc: 'Accéder à des ressources professionnelles et formations, renforçant ainsi sa compétitivité sur le marché tunisien et international',
    },
  ]),

  'actualites.title': 'Dernières Actualités',
  'actualites.cta': 'Voir plus',
  'actualites.items': JSON.stringify([
    {
      slug: 'walid-tritar-president-fi2t',
      title: 'Tourisme: Walid Tritar, nouveau Président de la Fi2T',
      desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
      date: '11 Mai 2026',
      img: '/images/act1.jpg?v=home2',
    },
    {
      slug: 'secteur-sous-pression',
      title: 'Secteur touristique: sous pression, mais résilient...',
      desc: 'Le secteur touristique mondial traverse une phase exigeante, avec des marchés plus prudents et des décisions de voyage de plus en plus tardives....',
      date: '22 Mai 2026',
      img: '/images/act2.jpg?v=home2',
    },
    {
      slug: 'houssem-azouz-centre-ouest',
      title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
      desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
      date: '7 Avril 2026',
      img: '/images/act3.jpg?v=home2',
    },
  ]),

  'cta.title': 'Rejoignez notre vision pour le futur',
  'cta.body':
    "Devenez membre de la Fédération et participez activement à la construction d'un tourisme tunisien d'exception.",
  'cta.bg': '/images/bg--1.png',
  'cta.primary': 'Rejoindre la fédération',
  'cta.secondary': 'Contacter le bureau',
}
