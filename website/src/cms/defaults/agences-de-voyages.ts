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
      body: 'Marges réduites, dépendance aux tour-opérateurs et saisonnalité forte limitent la capacité d’investissement et de modernisation des agences.',
    },
    {
      number: '03',
      title: 'Insuffisante diversification',
      body: 'L’offre reste trop concentrée sur le tourisme de masse, au détriment des produits à forte valeur ajoutée (culturel, durable, sportif, MICE).',
    },
    {
      number: '04',
      title: 'Retard numérique',
      body: 'Digitalisation partielle des process, faible présence en ligne et outils de distribution insuffisamment adaptés aux nouveaux comportements clients.',
    },
    {
      number: '05',
      title: 'Déficit de compétences',
      body: 'Besoin de formation continue sur les métiers émergents, la relation client digitale et la conception de produits d’expérience.',
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
