export const QUI_SOMMES_NOUS_DEFAULTS: Record<string, string> = {
  'hero.image': '/images/qui-sommes-nous-banner.png?v=8',
  'hero.title': 'Qui sommes-nous',

  'mission.title': 'Notre Histoire & Mission',
  // Single \n, not \n\n: the artboard runs both paragraphs at the same 29px
  // pitch with no blank line between them.
  'mission.body':
    'La Fédération Interprofessionnelle du Tourisme Tunisien est un syndicat professionnel patronal indépendant fondé en mars 2016 par divers opérateurs du tourisme tunisien, venant d’activités différentes : agences de voyages, hébergements alternatifs, loisirs, animation, sports, transports…\nLa Fi2T est ouverte à tous les acteurs du tourisme tunisien ayant un lien direct avec le secteur. Les adhérents peuvent être des personnes morales, des personnes physiques, des associations, des syndicats.',
  'mission.image': '/images/qui-sommes-nous-mission-card.png?v=1',

  'values.title': 'Nos objectifs',
  'values.items': JSON.stringify([
    {
      title: 'INTÉGRITÉ',
      desc: 'Transparence totale et éthique irréprochable au cœur de toutes nos actions institutionnelles.',
      icon: '/images/value-integrity.svg',
    },
    {
      title: 'INNOVATION',
      desc: 'Anticipation des tendances mondiales pour proposer des solutions créatives aux défis de l’industrie.',
      icon: '/images/value-innovation.svg',
    },
    {
      title: 'SYNERGIE',
      desc: 'Faire collaborer les acteurs publics et privés vers une vision de croissance partagée.',
      icon: '/images/value-synergie.svg',
    },
    {
      title: 'EXCELLENCE',
      desc: 'Promouvoir des standards élevés et une qualité de service reconnue à l’international.',
      icon: '/images/value-excellence.svg',
    },
    {
      title: 'REPRESENTATION',
      desc: 'Défendre les intérêts de l’ensemble des professionnels du tourisme tunisien.',
      icon: '/images/value-representation.svg',
    },
    {
      title: 'DURABILITÉ',
      desc: 'Encourager un tourisme responsable, inclusif et respectueux des ressources du pays.',
      icon: '/images/value-durabilite.svg',
    },
  ]),

  'diversify.title': 'Pourquoi diversifier et innover ?',
  'diversify.intro': 'La diversification des produits touristiques n’est pas un luxe, c’est plutôt :',
  'diversify.items': JSON.stringify([
    {
      title: 'Adaptation à la demande',
      desc: 'Une adaptation à la demande touristique mondiale et nationale, de plus en plus segmentée',
    },
    {
      title: 'Extension temporelle',
      desc: 'Une extension de l’activité touristique dans le temps',
    },
    {
      title: 'Extension spatiale',
      desc: 'Une extension de l’activité touristique dans l’espace',
    },
    {
      title: 'Optimisation des revenus',
      desc: 'La réalisation de meilleures recettes en devises par l’attraction de clientèles à fort pouvoir d’achat',
    },
  ]),

  'join.title': "Prêt à rejoindre l'excellence ?",
  'join.body':
    'Contribuez activement à la transformation du tourisme tunisien en devenant membre de notre fédération interprofessionnelle.',
  'join.cta': 'Devenir membre',
}
