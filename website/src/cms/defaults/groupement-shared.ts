/** Shared structure for FI2T groupement detail pages. */

export type PillarCard = { title: string; icon: string }
export type ChallengeItem = { number?: string; title: string; body: string; constat?: string }
export type ProposalItem = { title: string; body: string }
export type GroupementDefaults = Record<string, string>

export function buildGroupementDefaults(opts: {
  title: string
  intro: string
  heroImage?: string
  pillars?: PillarCard[]
  challengesTitle?: string
  challenges?: ChallengeItem[]
  enjeuxTitle?: string
  enjeuxImage?: string
  enjeuxItems?: string[]
  proposalsTitle?: string
  proposals?: ProposalItem[]
}): GroupementDefaults {
  return {
    'hero.image': opts.heroImage ?? '/hero.jpg',
    'hero.title': opts.title,
    'positioning.title': 'Positionnement FI2T',
    'positioning.body': opts.intro,
    'positioning.pillars': JSON.stringify(
      opts.pillars ?? [
        { title: 'Secteur structuré', icon: '/images/g-icon-structure.svg' },
        { title: 'Intérêts professionnels', icon: '/images/g-icon-interets.svg' },
        { title: 'Valeur ajoutée', icon: '/images/g-icon-valeur.svg' },
        { title: 'Cadre réglementaire', icon: '/images/g-icon-cadre.svg' },
      ],
    ),
    'challenges.title': opts.challengesTitle ?? 'Positionnement FI2T',
    'challenges.items': JSON.stringify(opts.challenges ?? []),
    'enjeux.title': opts.enjeuxTitle ?? 'Enjeux stratégiques',
    'enjeux.image': opts.enjeuxImage ?? '/images/groupement-enjeux.jpg',
    'enjeux.items': JSON.stringify(opts.enjeuxItems ?? []),
    'proposals.title': opts.proposalsTitle ?? 'Propositions stratégiques',
    'proposals.items': JSON.stringify(opts.proposals ?? []),
  }
}
