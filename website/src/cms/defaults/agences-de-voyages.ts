import { buildGroupementDefaults } from './groupement-shared'

export const AGENCES_DE_VOYAGES_DEFAULTS = buildGroupementDefaults({
  title: 'Agences de voyages',
  intro:
    'La Fédération Interprofessionnelle du Tourisme Tunisien (FI2T) représente un ensemble d’acteurs engagés dans la modernisation, la diversification et la professionnalisation du tourisme tunisien.\nÀ travers ses membres, notamment les agences de voyages, la Fi2T œuvre pour :',
  challenges: [
    {
      number: '01',
      title: 'Cadre réglementaire obsolète',
      body: `• Législation obsolète ne tenant pas compte de la diversification des métiers du voyage.
• Absence de reconnaissance formelle des :
  - DMC,
  - agences spécialisées,
  - opérateurs de tourisme alternatif, culturel, sportif ou durable
  - catégorie Tour Opérateur (surtout pour les opérateurs outgoing et DMC)
• Procédures administratives lourdes et garanties financières dissuasives.`,
      constat:
        'Constat FI2T : le cadre actuel freine l’innovation, encourage l’informel et pénalise les initiatives structurées.',
    },
    {
      number: '02',
      title: 'Fragilité économique des agences de voyages',
      body: `• Marges commerciales en constante compression face à la concurrence des plateformes et des TO internationaux.
• Forte dépendance aux tour-opérateurs étrangers et aux commissions réduites.
• Saisonnalité marquée limitant la trésorerie et la capacité d’investissement.
• Accès difficile au financement bancaire et aux dispositifs de soutien.`,
      constat:
        'Constat FI2T : sans renforcement économique, les agences ne peuvent ni moderniser ni résister aux chocs.',
    },
    {
      number: '03',
      title: 'Insuffisante diversification',
      body: `• Offre encore trop centrée sur le tourisme balnéaire de masse.
• Sous-exploitation des niches à forte valeur (culturel, durable, sportif, MICE, senior).
• Manque de packaging et de mise en marché des produits différenciés.
• Coordination insuffisante avec les autres filières de la Fédération.`,
      constat:
        'Constat FI2T : la diversification est la condition d’un tourisme de valeur et de résilience.',
    },
    {
      number: '04',
      title: 'Retard numérique',
      body: `• Digitalisation partielle des process internes (réservation, CRM, reporting).
• Faible présence et visibilité sur les canaux digitaux.
• Outils de distribution peu adaptés aux comportements clients actuels.
• Retard structurel face aux OTA et aux plateformes internationales.`,
      constat:
        'Constat FI2T : sans accélération digitale, les agences perdent parts de marché et clients.',
    },
    {
      number: '05',
      title: 'Déficit de compétences',
      body: `• Besoin de formation continue sur les métiers émergents du voyage.
• Lacunes en relation client digitale et en e-commerce.
• Manque de compétences en conception de produits d’expérience.
• Faible culture de la data et du yield management.`,
      constat:
        'Constat FI2T : la montée en compétences est un levier prioritaire de compétitivité.',
    },
  ],
  enjeuxItems: [
    'Positionner les agences de voyages comme acteurs centraux de la stratégie touristique nationale.',
    'Passer d’un tourisme de volume à un tourisme de valeur, d’expérience et de durabilité.',
    'Renforcer la résilience économique des agences.',
    'Favoriser l’investissement, l’innovation et l’emploi qualifié.',
    'Réduire l’informel par un cadre incitatif et moderne.',
  ],
  proposals: [
    {
      title: 'Réforme du cadre réglementaire (priorité FI2T)',
      body: `• Révision de la loi régissant les agences de voyages.
• Reconnaissance officielle des nouvelles catégories d’opérateurs.
• Simplification et digitalisation des procédures administratives.
• Révision des garanties financières selon l’activité réelle et le risque.
Rôle FI2T : force de proposition et partenaire technique de l’État dans la réforme.`,
    },
    {
      title: 'Soutien à la diversification et à la montée en gamme',
      body: 'Accompagner le développement de produits différenciés et à forte valeur ajoutée, en lien avec les autres groupements de la Fédération.',
    },
    {
      title: 'Accélération de la transformation digitale',
      body: 'Favoriser l’adoption d’outils numériques, la distribution en ligne et la modernisation des systèmes de réservation.',
    },
    {
      title: 'Formation et professionnalisation',
      body: 'Programmes de formation continue pour renforcer les compétences métier, commerciales et digitales des équipes.',
    },
    {
      title: 'Gouvernance et dialogue public–privé',
      body: 'Structurer un dialogue permanent avec les institutions pour aligner réglementation, investissement et stratégie nationale.',
    },
  ],
})
