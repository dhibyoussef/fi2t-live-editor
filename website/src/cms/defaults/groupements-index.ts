import { GROUPEMENTS } from '../../lib/groupements'
import { AGENCES_DE_VOYAGES_DEFAULTS } from './agences-de-voyages'
import { HEBERGEMENTS_ALTERNATIFS_DEFAULTS } from './hebergements-alternatifs'
import { buildGroupementDefaults } from './groupement-shared'

function stubFor(label: string) {
  return buildGroupementDefaults({
    title: label.trim(),
    intro: `La Fédération Interprofessionnelle du Tourisme Tunisien (FI2T) représente les acteurs du segment « ${label.trim()} » engagés dans la modernisation, la diversification et la professionnalisation du tourisme tunisien.\nÀ travers ce groupement, la Fi2T œuvre pour :`,
    challenges: [
      {
        number: '01',
        title: 'Cadre réglementaire à moderniser',
        body: 'Adapter la réglementation aux réalités actuelles du métier et reconnaître les nouvelles formes d’activité.',
        constat: 'Constat FI2T : un cadre plus clair favorise l’investissement et limite l’informel.',
      },
      {
        number: '02',
        title: 'Structuration professionnelle',
        body: 'Renforcer la structuration du groupement, la qualité de service et la représentation collective.',
      },
      {
        number: '03',
        title: 'Visibilité et valorisation',
        body: 'Améliorer la visibilité nationale et internationale de l’offre liée à ce groupement.',
      },
      {
        number: '04',
        title: 'Transformation digitale',
        body: 'Accélérer la digitalisation des outils, de la distribution et de la relation client.',
      },
      {
        number: '05',
        title: 'Compétences et formation',
        body: 'Développer des parcours de formation adaptés aux métiers spécifiques du groupement.',
      },
    ],
    enjeuxItems: [
      `Positionner « ${label.trim()} » comme un levier stratégique du tourisme tunisien.`,
      'Passer d’un tourisme de volume à un tourisme de valeur et d’expérience.',
      'Renforcer la résilience économique des opérateurs du groupement.',
      'Favoriser l’investissement, l’innovation et l’emploi qualifié.',
      'Réduire l’informel par un cadre incitatif et moderne.',
    ],
    proposals: [
      {
        title: 'Réforme et accompagnement réglementaire',
        body: 'Proposer des évolutions réglementaires adaptées et accompagner les opérateurs dans leur mise en conformité.',
      },
      {
        title: 'Diversification et montée en gamme',
        body: 'Soutenir le développement de produits différenciés et de qualité.',
      },
      {
        title: 'Transformation digitale',
        body: 'Accélérer l’adoption d’outils numériques et de nouveaux canaux de distribution.',
      },
      {
        title: 'Formation et professionnalisation',
        body: 'Mettre en place des programmes de formation continue pour les équipes.',
      },
      {
        title: 'Dialogue public–privé',
        body: 'Structurer un dialogue permanent avec les institutions et les partenaires du secteur.',
      },
    ],
  })
}

const BY_SLUG: Record<string, Record<string, string>> = {
  'agences-de-voyages': AGENCES_DE_VOYAGES_DEFAULTS,
  'hebergements-alternatifs': HEBERGEMENTS_ALTERNATIFS_DEFAULTS,
}

for (const g of GROUPEMENTS) {
  if (!BY_SLUG[g.slug]) {
    BY_SLUG[g.slug] = stubFor(g.label)
  }
}

export const GROUPEMENT_SLUGS = GROUPEMENTS.map((g) => g.slug)

export function isGroupementSlug(slug: string): boolean {
  return GROUPEMENT_SLUGS.includes(slug)
}

export function getGroupementDefaults(slug: string): Record<string, string> {
  return BY_SLUG[slug] ?? {}
}
