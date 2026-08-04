/**
 * Structure of the Figma-custom groupement pages.
 *
 * Those pages used to live in the CMS as a single opaque `custom.page` JSON
 * blob, which made the admin show one nameless field and left the public page
 * uneditable. The layouts read a flat bag of keys (`splitTitle`, `splitBody`,
 * `splitImg`, `atouts`…) where the prefix already names the band it belongs
 * to, so the bag can be regrouped into the page's real anatomy without
 * touching a single layout component.
 *
 * Every page sharing a layout has the same key set, so the derived structure is
 * identical across sibling pages — only the content differs.
 */

import {
  CUSTOM_GROUPEMENT_PAGES,
  getCustomGroupementPage,
  type CustomGroupementPage,
} from './groupement-custom-pages'

/** Section keys that name a band on their own rather than prefixing one. */
type FieldKind = 'text' | 'lines' | 'image' | 'items'

export type SchemaField = {
  /** Key inside `page.sections`. */
  key: string
  /** Field name inside the section block. */
  field: string
  kind: FieldKind
  label: string
}

export type SchemaSection = {
  /** CMS section name, e.g. `atouts`. */
  id: string
  label: string
  fields: SchemaField[]
}

const FIELD_LABELS: Record<string, string> = {
  title: 'Titre',
  sub: 'Sous-titre',
  body: 'Texte',
  lead: 'Accroche',
  img: 'Image',
  image: 'Image',
  items: 'Éléments',
  value: 'Valeur',
  label: 'Libellé',
  cards: 'Cartes',
  stats: 'Chiffres',
  metricvalue: 'Chiffre',
  metriclabel: 'Libellé du chiffre',
  metricsub: 'Légende du chiffre',
  eyebrow: 'Surtitre',
  source: 'Pôle source',
  cta: 'Libellé du lien',
  children: 'Filières',
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Bannière',
  intro: 'Introduction',
  split: 'Présentation',
  atouts: 'Atouts',
  diagnostic: 'Diagnostic',
  diag: 'Diagnostic',
  defis: 'Défis',
  plan: 'Plan de relance',
  pourquoi: 'Pourquoi',
  services: 'Services',
  roadmap: 'Feuille de route',
  pot: 'Potentiel',
  real: 'Réalité du terrain',
  places: 'Sites',
  adv: 'Avantages',
  origin: 'Origine des patients',
  bars: 'Répartition',
  donut: 'Indicateur',
  actions: 'Actions',
  market: 'Marché',
  wealth: 'Richesses',
  photos: 'Galerie',
  freins: 'Freins',
  mondial: 'Contexte mondial',
  tn: 'Tunisie',
  axes: 'Axes stratégiques',
  banner: 'Bandeau',
  etat: 'État des lieux',
  impact: 'Impact',
  marina: 'Marina',
  parent: 'Rattachement',
  prob: 'Problématiques',
  blueprint: 'Schéma',
  vision: 'Vision',
  stats: 'Chiffres clés',
  types: 'Typologies',
  values: 'Valeurs',
  growth: 'Croissance',
  artisan: 'Artisanat',
  pillars: 'Piliers',
  grid: 'Filières',
  cta: 'Appel à l’action',
  challenges: 'Enjeux',
  quote: 'Citation',
}

/**
 * Keys the prefix rule would file under a band of their own even though the
 * page renders them inside another band. `probs` is the card list of the
 * "Grandes Problématiques" band; the surtitle and accroche of the hub and
 * segment layouts sit in the intro block; `hubSlug` and `discoverCta` drive
 * the filières grid.
 */
const FOLD_INTO: Record<string, { band: string; field: string; rank: number }> = {
  probs: { band: 'prob', field: 'items', rank: 0 },
  eyebrow: { band: 'intro', field: 'eyebrow', rank: 0 },
  lead: { band: 'intro', field: 'lead', rank: 1 },
  hub: { band: 'grid', field: 'source', rank: 0 },
  discover: { band: 'grid', field: 'cta', rank: 1 },
  children: { band: 'grid', field: 'children', rank: 2 },
}

function titleCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** `splitTitle` → `split` ; `atouts` → `atouts` ; `realMetricValue` → `real`. */
function prefixOf(key: string) {
  const m = /^[a-z0-9]+/.exec(key)
  return m ? m[0] : key
}

function fieldOf(key: string, prefix: string, isArray: boolean) {
  if (key === prefix) return isArray ? 'items' : 'value'
  const rest = key.slice(prefix.length)
  return rest.charAt(0).toLowerCase() + rest.slice(1)
}

function kindOf(key: string, value: unknown): FieldKind {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? 'lines' : 'items'
  if (/img$|image$|photo$/i.test(key)) return 'image'
  return 'text'
}

/**
 * Group the flat `sections` bag into named bands, preserving declaration order
 * (which mirrors the order the bands appear on the page).
 */
export function buildSchema(page: CustomGroupementPage): SchemaSection[] {
  const own = new Map<string, SchemaField[]>()
  const folded = new Map<string, { rank: number; field: SchemaField }[]>()
  /** Where each band sits on the page: the first key it renders. */
  const at = new Map<string, number>()

  let i = 0
  for (const [key, value] of Object.entries(page.sections)) {
    const isArray = Array.isArray(value)
    const prefix = prefixOf(key)
    const fold = FOLD_INTO[prefix]
    const band = fold ? fold.band : prefix
    const field = fold ? fold.field : fieldOf(key, prefix, isArray)
    const entry: SchemaField = {
      key,
      field,
      kind: kindOf(key, value),
      label: FIELD_LABELS[field.toLowerCase()] ?? titleCase(field),
    }

    if (fold) {
      if (!folded.has(band)) folded.set(band, [])
      folded.get(band)!.push({ rank: fold.rank, field: entry })
      // A folded key only fixes the band's position if nothing else does.
      if (!at.has(band)) at.set(band, i)
    } else {
      if (!own.has(band)) {
        own.set(band, [])
        at.set(band, i)
      }
      own.get(band)!.push(entry)
    }
    i += 1
  }

  const ids = [...new Set([...own.keys(), ...folded.keys()])]
  ids.sort((a, b) => at.get(a)! - at.get(b)!)

  return ids.map((id) => ({
    id,
    label: SECTION_LABELS[id] ?? titleCase(id),
    fields: [
      ...(own.get(id) ?? []),
      ...(folded.get(id) ?? []).sort((a, b) => a.rank - b.rank).map((f) => f.field),
    ],
  }))
}

/** Schema for a layout, derived from the first page that uses it. */
const SCHEMA_BY_LAYOUT = new Map<string, SchemaSection[]>()
for (const page of Object.values(CUSTOM_GROUPEMENT_PAGES)) {
  if (!SCHEMA_BY_LAYOUT.has(page.layout)) {
    SCHEMA_BY_LAYOUT.set(page.layout, buildSchema(page))
  }
}

export function getLayoutSchema(layout: string): SchemaSection[] {
  return SCHEMA_BY_LAYOUT.get(layout) ?? []
}

export function getSchemaForSlug(slug: string): SchemaSection[] {
  const page = getCustomGroupementPage(slug)
  return page ? getLayoutSchema(page.layout) : []
}

/** Block key holding one band of a custom page, e.g. `atouts.data`. */
export function sectionBlockKey(sectionId: string) {
  return `${sectionId}.data`
}

/** Sequence chrome is derived from list order — never persist num/number. */
function stripSequenceFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripSequenceFields)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => key !== 'num' && key !== 'number')
        .map(([key, child]) => [key, stripSequenceFields(child)]),
    )
  }
  return value
}

/**
 * Serialise a page into one JSON block per band, plus the hero/intro basics.
 * Returns `{ 'split.data': '{...}', … }`.
 *
 * Hébergements, culturel, hub, thalasso, senior, thermal, medical, aventure, affaire, segment, golf, plaisance and auto use
 * Agences-style flat CMS keys so every field is click-editable.
 */
export function pageToBlocks(page: CustomGroupementPage): Record<string, string> {
  if (page.layout === 'hebergements') {
    const s = page.sections
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'intro.lead': String(s.introLead ?? ''),
      'intro.copy': String(s.introBody ?? ''),
      'types.items': JSON.stringify(stripSequenceFields(s.types ?? [])),
      'values.items': JSON.stringify(stripSequenceFields(s.values ?? [])),
      'growth.title': String(s.growthTitle ?? ''),
      'growth.body': String(s.growthBody ?? ''),
      'growth.stats': JSON.stringify(stripSequenceFields(s.growthStats ?? [])),
      'diag.title': String(s.diagTitle ?? ''),
      'diag.items': JSON.stringify(stripSequenceFields(s.diag ?? [])),
    }
  }

  if (page.layout === 'culturel') {
    const s = page.sections
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'stats.items': JSON.stringify(stripSequenceFields(s.stats ?? [])),
      'atouts.title': String(s.atoutsTitle ?? ''),
      'atouts.body': String(s.atoutsBody ?? ''),
      'atouts.items': JSON.stringify(stripSequenceFields(s.atouts ?? [])),
      'artisan.img': String(s.artisanImg ?? ''),
      'quote.value': String(s.quote ?? ''),
      'diag.title': String(s.diagTitle ?? ''),
      'diag.sub': String(s.diagSub ?? ''),
      'diag.items': JSON.stringify(stripSequenceFields(s.diag ?? [])),
      'roadmap.title': String(s.roadmapTitle ?? ''),
      'roadmap.body': String(s.roadmapBody ?? ''),
      'roadmap.items': JSON.stringify(stripSequenceFields(s.roadmap ?? [])),
    }
  }

  if (page.layout === 'hub') {
    const s = page.sections
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'intro.eyebrow': String(s.eyebrow ?? ''),
      'intro.lead': String(s.lead ?? ''),
      'stats.title': String(s.statsTitle ?? ''),
      'stats.items': JSON.stringify(stripSequenceFields(s.stats ?? [])),
      'pillars.title': String(s.pillarsTitle ?? ''),
      'pillars.sub': String(s.pillarsSub ?? ''),
      'pillars.items': JSON.stringify(stripSequenceFields(s.pillars ?? [])),
      'grid.title': String(s.gridTitle ?? ''),
      'grid.sub': String(s.gridSub ?? ''),
      'grid.source': String(s.hubSlug ?? ''),
      'grid.cta': String(s.discoverCta ?? ''),
      'grid.children': JSON.stringify(stripSequenceFields(s.children ?? [])),
      'cta.title': String(s.ctaTitle ?? ''),
      'cta.body': String(s.ctaBody ?? ''),
      'cta.label': String(s.ctaLabel ?? ''),
      'cta.to': String(s.ctaTo ?? '/fiche-adhesion'),
    }
  }

  if (page.layout === 'thalasso') {
    const s = page.sections
    const body = Array.isArray(s.splitBody) ? (s.splitBody as string[]) : []
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'split.title': String(s.splitTitle ?? ''),
      'split.lead': String(body[0] ?? ''),
      'split.copy': String(body[1] ?? ''),
      'split.img': String(s.splitImg ?? ''),
      'atouts.title': String(s.atoutsTitle ?? ''),
      'atouts.sub': String(s.atoutsSub ?? ''),
      'atouts.items': JSON.stringify(stripSequenceFields(s.atouts ?? [])),
      'diagnostic.title': String(s.diagnosticTitle ?? ''),
      'diagnostic.items': JSON.stringify(stripSequenceFields(s.diagnostic ?? [])),
      'defis.title': String(s.defisTitle ?? ''),
      'defis.sub': String(s.defisSub ?? ''),
      'defis.items': JSON.stringify(stripSequenceFields(s.defis ?? [])),
      'plan.title': String(s.planTitle ?? ''),
      'plan.items': JSON.stringify(stripSequenceFields(s.plan ?? [])),
    }
  }

  if (page.layout === 'senior') {
    const s = page.sections
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'pourquoi.title': String(s.pourquoiTitle ?? ''),
      'pourquoi.sub': String(s.pourquoiSub ?? ''),
      'pourquoi.items': JSON.stringify(stripSequenceFields(s.pourquoi ?? [])),
      'services.title': String(s.servicesTitle ?? ''),
      'services.sub': String(s.servicesSub ?? ''),
      'services.items': JSON.stringify(stripSequenceFields(s.services ?? [])),
      'defis.title': String(s.defisTitle ?? ''),
      'defis.sub': String(s.defisSub ?? ''),
      'defis.items': JSON.stringify(stripSequenceFields(s.defis ?? [])),
      'roadmap.title': String(s.roadmapTitle ?? ''),
      'roadmap.body': String(s.roadmapBody ?? ''),
      'roadmap.items': JSON.stringify(stripSequenceFields(s.roadmap ?? [])),
    }
  }

  if (page.layout === 'thermal') {
    const s = page.sections
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'pot.title': String(s.potTitle ?? ''),
      'pot.sub': String(s.potSub ?? ''),
      'pot.items': JSON.stringify(stripSequenceFields(s.pot ?? [])),
      'real.title': String(s.realTitle ?? ''),
      'real.body': String(s.realBody ?? ''),
      'real.metricValue': String(s.realMetricValue ?? ''),
      'real.metricLabel': String(s.realMetricLabel ?? ''),
      'real.metricSub': String(s.realMetricSub ?? ''),
      'places.items': JSON.stringify(stripSequenceFields(s.places ?? [])),
      'defis.title': String(s.defisTitle ?? ''),
      'defis.items': JSON.stringify(stripSequenceFields(s.defis ?? [])),
      'roadmap.title': String(s.roadmapTitle ?? ''),
      'roadmap.items': JSON.stringify(stripSequenceFields(s.roadmap ?? [])),
    }
  }

  if (page.layout === 'medical') {
    const s = page.sections
    const bars = ((s.bars as { label: string; pct: number; fill?: string }[]) || []).map((b) => ({
      label: b.label,
      pct: String(b.pct),
      fill: b.fill ?? '',
    }))
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'adv.title': String(s.advTitle ?? ''),
      'adv.items': JSON.stringify(stripSequenceFields(s.adv ?? [])),
      'origin.title': String(s.originTitle ?? ''),
      'origin.sub': String(s.originSub ?? ''),
      'bars.items': JSON.stringify(stripSequenceFields(bars)),
      'donut.value': String(s.donutValue ?? ''),
      'donut.label': String(s.donutLabel ?? ''),
      'diag.intro': String(s.diagIntro ?? ''),
      'diag.items': JSON.stringify(stripSequenceFields(s.diag ?? [])),
      'actions.title': String(s.actionsTitle ?? ''),
      'actions.items': JSON.stringify(stripSequenceFields(s.actions ?? [])),
    }
  }

  if (page.layout === 'aventure') {
    const s = page.sections
    const photos = ((s.photos as string[]) || []).map((img) => ({
      img: String(img),
    }))
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'market.title': String(s.marketTitle ?? ''),
      'market.body': String(s.marketBody ?? ''),
      'market.items': JSON.stringify(stripSequenceFields(s.market ?? [])),
      'wealth.title': String(s.wealthTitle ?? ''),
      'wealth.body': String(s.wealthBody ?? ''),
      'wealth.metricValue': String(s.wealthMetricValue ?? ''),
      'wealth.metricLabel': String(s.wealthMetricLabel ?? ''),
      'wealth.metricSub': String(s.wealthMetricSub ?? ''),
      'photos.items': JSON.stringify(stripSequenceFields(photos)),
      'freins.title': String(s.freinsTitle ?? ''),
      'freins.sub': String(s.freinsSub ?? ''),
      'freins.items': JSON.stringify(stripSequenceFields(s.freins ?? [])),
      'roadmap.title': String(s.roadmapTitle ?? ''),
      'roadmap.sub': String(s.roadmapSub ?? ''),
      'roadmap.items': JSON.stringify(stripSequenceFields(s.roadmap ?? [])),
    }
  }

  if (page.layout === 'affaire') {
    const s = page.sections
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'mondial.title': String(s.mondialTitle ?? ''),
      'mondial.items': JSON.stringify(stripSequenceFields(s.mondial ?? [])),
      'tn.title': String(s.tnTitle ?? ''),
      'tn.body': String(s.tnBody ?? ''),
      'tn.stats': JSON.stringify(stripSequenceFields(s.tnStats ?? [])),
      'atouts.title': String(s.atoutsTitle ?? ''),
      'atouts.sub': String(s.atoutsSub ?? ''),
      'atouts.items': JSON.stringify(stripSequenceFields(s.atouts ?? [])),
      'diag.title': String(s.diagTitle ?? ''),
      'diag.body': String(s.diagBody ?? ''),
      'diag.items': JSON.stringify(stripSequenceFields(s.diag ?? [])),
      'axes.title': String(s.axesTitle ?? ''),
      'axes.sub': String(s.axesSub ?? ''),
      'axes.items': JSON.stringify(stripSequenceFields(s.axes ?? [])),
    }
  }

  if (page.layout === 'segment') {
    const s = page.sections
    const toTextItems = (raw: unknown) =>
      ((raw as unknown[]) || []).map((row) =>
        typeof row === 'string' ? { text: row } : { text: String((row as { text?: string })?.text ?? '') },
      )
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'intro.eyebrow': String(s.eyebrow ?? ''),
      'intro.lead': String(s.lead ?? ''),
      'stats.title': String(s.statsTitle ?? ''),
      'stats.items': JSON.stringify(stripSequenceFields(s.stats ?? [])),
      'pillars.title': String(s.pillarsTitle ?? ''),
      'pillars.sub': String(s.pillarsSub ?? ''),
      'pillars.items': JSON.stringify(stripSequenceFields(s.pillars ?? [])),
      'challenges.title': String(s.challengesTitle ?? ''),
      'challenges.items': JSON.stringify(stripSequenceFields(toTextItems(s.challenges))),
      'actions.title': String(s.actionsTitle ?? ''),
      'actions.items': JSON.stringify(stripSequenceFields(toTextItems(s.actions))),
      'cta.title': String(s.ctaTitle ?? ''),
      'cta.body': String(s.ctaBody ?? ''),
      'cta.label': String(s.ctaLabel ?? ''),
      'cta.to': String(s.ctaTo ?? '/fiche-adhesion'),
    }
  }

  if (page.layout === 'golf') {
    const s = page.sections
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'pot.title': String(s.potTitle ?? ''),
      'pot.sub': String(s.potSub ?? ''),
      'pot.items': JSON.stringify(stripSequenceFields(s.pot ?? [])),
      'banner.text': String(s.banner ?? ''),
      'etat.title': String(s.etatTitle ?? ''),
      'etat.body': String(s.etatBody ?? ''),
      'etat.stats': JSON.stringify(stripSequenceFields(s.etatStats ?? [])),
      'etat.box': String(s.etatBox ?? ''),
      'etat.boxLabel': String(s.etatBoxLabel ?? ''),
      'etat.boxSub': String(s.etatBoxSub ?? ''),
      'defis.title': String(s.defisTitle ?? ''),
      'defis.sub': String(s.defisSub ?? ''),
      'defis.items': JSON.stringify(stripSequenceFields(s.defis ?? [])),
      'roadmap.title': String(s.roadmapTitle ?? ''),
      'roadmap.sub': String(s.roadmapSub ?? ''),
      'roadmap.items': JSON.stringify(stripSequenceFields(s.roadmap ?? [])),
    }
  }

  if (page.layout === 'plaisance') {
    const s = page.sections
    const toTextItems = (raw: unknown) =>
      ((raw as unknown[]) || []).map((row) =>
        typeof row === 'string' ? { text: row } : { text: String((row as { text?: string })?.text ?? '') },
      )
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'impact.title': String(s.impactTitle ?? ''),
      'impact.items': JSON.stringify(stripSequenceFields(s.impactCards ?? [])),
      'marina.img': String(s.marinaImg ?? ''),
      'parent.icon': String(s.parentIcon ?? '/images/groupement-media/plaisance-parent-icon.png?v=2'),
      'parent.title': String(s.parentTitle ?? ''),
      'parent.body': String(s.parentBody ?? ''),
      'prob.title': String(s.probTitle ?? ''),
      'prob.sub': String(s.probSub ?? ''),
      'prob.items': JSON.stringify(stripSequenceFields(s.probs ?? [])),
      'actions.title': String(s.actionsTitle ?? ''),
      'actions.body': String(s.actionsBody ?? ''),
      'actions.items': JSON.stringify(stripSequenceFields(toTextItems(s.actions))),
      'blueprint.img': String(s.blueprint ?? ''),
    }
  }

  if (page.layout === 'auto') {
    const s = page.sections
    const toTextItems = (raw: unknown) =>
      ((raw as unknown[]) || []).map((row) =>
        typeof row === 'string' ? { text: row } : { text: String((row as { text?: string })?.text ?? '') },
      )
    return {
      'hero.title': page.heroTitle,
      'intro.body': page.intro,
      'vision.title': String(s.visionTitle ?? ''),
      'vision.body': String(s.visionBody ?? ''),
      'stats.items': JSON.stringify(stripSequenceFields(s.stats ?? [])),
      'real.title': String(s.realTitle ?? ''),
      'real.body': String(s.realBody ?? ''),
      'real.items': JSON.stringify(stripSequenceFields(toTextItems(s.realItems))),
      'real.img': String(s.realImg ?? ''),
      'actions.title': String(s.actionsTitle ?? ''),
      'actions.items': JSON.stringify(stripSequenceFields(toTextItems(s.actionsItems))),
      'actions.body': String(s.actionsBody ?? ''),
      'actions.img': String(s.actionsImg ?? ''),
    }
  }

  const out: Record<string, string> = {
    'hero.title': page.heroTitle,
    'intro.body': page.intro,
  }
  for (const section of getLayoutSchema(page.layout)) {
    const data: Record<string, unknown> = {}
    for (const f of section.fields) {
      if (page.sections[f.key] !== undefined) data[f.field] = page.sections[f.key]
    }
    out[sectionBlockKey(section.id)] = JSON.stringify(stripSequenceFields(data))
  }
  return out
}

/**
 * Rebuild the flat page object the layouts expect from the per-band blocks,
 * falling back to the shipped defaults for anything not yet in the CMS.
 */
export function blocksToPage(
  fallback: CustomGroupementPage,
  read: (blockKey: string) => string | undefined,
): CustomGroupementPage {
  if (fallback.layout === 'hebergements') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const lead = read('intro.lead')
    const copy = read('intro.copy')
    const types = read('types.items')
    const values = read('values.items')
    const growthTitle = read('growth.title')
    const growthBody = read('growth.body')
    const growthStats = read('growth.stats')
    const diagTitle = read('diag.title')
    const diagItems = read('diag.items')
    if (lead !== undefined) sections.introLead = lead
    if (copy !== undefined) sections.introBody = copy
    if (types) {
      try {
        const parsed = JSON.parse(types)
        if (Array.isArray(parsed)) sections.types = parsed
      } catch { /* keep fallback */ }
    }
    if (values) {
      try {
        const parsed = JSON.parse(values)
        if (Array.isArray(parsed)) sections.values = parsed
      } catch { /* keep fallback */ }
    }
    if (growthTitle !== undefined) sections.growthTitle = growthTitle
    if (growthBody !== undefined) sections.growthBody = growthBody
    if (growthStats) {
      try {
        const parsed = JSON.parse(growthStats)
        if (Array.isArray(parsed)) sections.growthStats = parsed
      } catch { /* keep fallback */ }
    }
    if (diagTitle !== undefined) sections.diagTitle = diagTitle
    if (diagItems) {
      try {
        const parsed = JSON.parse(diagItems)
        if (Array.isArray(parsed)) sections.diag = parsed
      } catch { /* keep fallback */ }
    }
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'culturel') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const atoutsTitle = read('atouts.title')
    const atoutsBody = read('atouts.body')
    const artisanImg = read('artisan.img')
    const quote = read('quote.value')
    const diagTitle = read('diag.title')
    const diagSub = read('diag.sub')
    const roadmapTitle = read('roadmap.title')
    const roadmapBody = read('roadmap.body')
    if (atoutsTitle !== undefined) sections.atoutsTitle = atoutsTitle
    if (atoutsBody !== undefined) sections.atoutsBody = atoutsBody
    if (artisanImg !== undefined) sections.artisanImg = artisanImg
    if (quote !== undefined) sections.quote = quote
    if (diagTitle !== undefined) sections.diagTitle = diagTitle
    if (diagSub !== undefined) sections.diagSub = diagSub
    if (roadmapTitle !== undefined) sections.roadmapTitle = roadmapTitle
    if (roadmapBody !== undefined) sections.roadmapBody = roadmapBody
    parseArr(read('stats.items'), 'stats')
    parseArr(read('atouts.items'), 'atouts')
    parseArr(read('diag.items'), 'diag')
    parseArr(read('roadmap.items'), 'roadmap')
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'hub') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    set('intro.eyebrow', 'eyebrow')
    set('intro.lead', 'lead')
    set('stats.title', 'statsTitle')
    set('pillars.title', 'pillarsTitle')
    set('pillars.sub', 'pillarsSub')
    set('grid.title', 'gridTitle')
    set('grid.sub', 'gridSub')
    set('grid.source', 'hubSlug')
    set('grid.cta', 'discoverCta')
    set('cta.title', 'ctaTitle')
    set('cta.body', 'ctaBody')
    set('cta.label', 'ctaLabel')
    set('cta.to', 'ctaTo')
    parseArr(read('stats.items'), 'stats')
    parseArr(read('pillars.items'), 'pillars')
    parseArr(read('grid.children'), 'children')
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'thalasso') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const lead = read('split.lead')
    const copy = read('split.copy')
    set('split.title', 'splitTitle')
    set('split.img', 'splitImg')
    set('atouts.title', 'atoutsTitle')
    set('atouts.sub', 'atoutsSub')
    set('diagnostic.title', 'diagnosticTitle')
    set('defis.title', 'defisTitle')
    set('defis.sub', 'defisSub')
    set('plan.title', 'planTitle')
    if (lead !== undefined || copy !== undefined) {
      const prev = Array.isArray(sections.splitBody) ? (sections.splitBody as string[]) : ['', '']
      sections.splitBody = [
        lead !== undefined ? lead : String(prev[0] ?? ''),
        copy !== undefined ? copy : String(prev[1] ?? ''),
      ]
    }
    parseArr(read('atouts.items'), 'atouts')
    parseArr(read('diagnostic.items'), 'diagnostic')
    parseArr(read('defis.items'), 'defis')
    parseArr(read('plan.items'), 'plan')
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'senior') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: { title?: string; sub?: string; body?: string; items?: string },
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.body && data.body !== undefined && read(`${id}.body`) === undefined) {
          sections[map.body] = data.body
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          sections[map.items] = data.items
        }
      } catch { /* keep fallback */ }
    }

    set('pourquoi.title', 'pourquoiTitle')
    set('pourquoi.sub', 'pourquoiSub')
    set('services.title', 'servicesTitle')
    set('services.sub', 'servicesSub')
    set('defis.title', 'defisTitle')
    set('defis.sub', 'defisSub')
    set('roadmap.title', 'roadmapTitle')
    set('roadmap.body', 'roadmapBody')
    parseArr(read('pourquoi.items'), 'pourquoi')
    parseArr(read('services.items'), 'services')
    parseArr(read('defis.items'), 'defis')
    parseArr(read('roadmap.items'), 'roadmap')
    // Migrate legacy opaque `*.data` bands still present in older DBs.
    hydrateBand('pourquoi', { title: 'pourquoiTitle', sub: 'pourquoiSub', items: 'pourquoi' })
    hydrateBand('services', { title: 'servicesTitle', sub: 'servicesSub', items: 'services' })
    hydrateBand('defis', { title: 'defisTitle', sub: 'defisSub', items: 'defis' })
    hydrateBand('roadmap', { title: 'roadmapTitle', body: 'roadmapBody', items: 'roadmap' })
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'thermal') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: { title?: string; sub?: string; items?: string },
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          sections[map.items] = data.items
        }
      } catch { /* keep fallback */ }
    }

    set('pot.title', 'potTitle')
    set('pot.sub', 'potSub')
    set('real.title', 'realTitle')
    set('real.body', 'realBody')
    set('real.metricValue', 'realMetricValue')
    set('real.metricLabel', 'realMetricLabel')
    set('real.metricSub', 'realMetricSub')
    set('defis.title', 'defisTitle')
    set('roadmap.title', 'roadmapTitle')
    parseArr(read('pot.items'), 'pot')
    parseArr(read('places.items'), 'places')
    parseArr(read('defis.items'), 'defis')
    parseArr(read('roadmap.items'), 'roadmap')
    hydrateBand('pot', { title: 'potTitle', sub: 'potSub', items: 'pot' })
    hydrateBand('places', { items: 'places' })
    hydrateBand('defis', { title: 'defisTitle', items: 'defis' })
    hydrateBand('roadmap', { title: 'roadmapTitle', items: 'roadmap' })
    // Legacy places.data shape: { items: [...] }
    const placesRaw = read('places.data')
    if (placesRaw && read('places.items') === undefined) {
      try {
        const data = JSON.parse(placesRaw) as Record<string, unknown>
        if (Array.isArray(data.items)) sections.places = data.items
        else if (Array.isArray(data)) sections.places = data
      } catch { /* keep fallback */ }
    }
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'medical') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: { title?: string; sub?: string; intro?: string; items?: string; value?: string; label?: string },
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.intro && data.intro !== undefined && read(`${id}.intro`) === undefined) {
          sections[map.intro] = data.intro
        }
        if (map.value && data.value !== undefined && read(`${id}.value`) === undefined) {
          sections[map.value] = data.value
        }
        if (map.label && data.label !== undefined && read(`${id}.label`) === undefined) {
          sections[map.label] = data.label
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          sections[map.items] = data.items
        }
      } catch { /* keep fallback */ }
    }

    set('adv.title', 'advTitle')
    set('origin.title', 'originTitle')
    set('origin.sub', 'originSub')
    set('donut.value', 'donutValue')
    set('donut.label', 'donutLabel')
    set('diag.intro', 'diagIntro')
    set('actions.title', 'actionsTitle')
    parseArr(read('adv.items'), 'adv')
    parseArr(read('bars.items'), 'bars')
    parseArr(read('diag.items'), 'diag')
    parseArr(read('actions.items'), 'actions')
    hydrateBand('adv', { title: 'advTitle', items: 'adv' })
    hydrateBand('origin', { title: 'originTitle', sub: 'originSub' })
    hydrateBand('bars', { items: 'bars' })
    hydrateBand('donut', { value: 'donutValue', label: 'donutLabel' })
    hydrateBand('diag', { intro: 'diagIntro', items: 'diag' })
    hydrateBand('actions', { title: 'actionsTitle', items: 'actions' })
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'aventure') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: {
        title?: string
        sub?: string
        body?: string
        items?: string
        metricValue?: string
        metricLabel?: string
        metricSub?: string
      },
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.body && data.body !== undefined && read(`${id}.body`) === undefined) {
          sections[map.body] = data.body
        }
        if (map.metricValue && data.metricValue !== undefined && read(`${id}.metricValue`) === undefined) {
          sections[map.metricValue] = data.metricValue
        }
        if (map.metricLabel && data.metricLabel !== undefined && read(`${id}.metricLabel`) === undefined) {
          sections[map.metricLabel] = data.metricLabel
        }
        if (map.metricSub && data.metricSub !== undefined && read(`${id}.metricSub`) === undefined) {
          sections[map.metricSub] = data.metricSub
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          sections[map.items] = data.items
        }
      } catch { /* keep fallback */ }
    }

    set('market.title', 'marketTitle')
    set('market.body', 'marketBody')
    set('wealth.title', 'wealthTitle')
    set('wealth.body', 'wealthBody')
    set('wealth.metricValue', 'wealthMetricValue')
    set('wealth.metricLabel', 'wealthMetricLabel')
    set('wealth.metricSub', 'wealthMetricSub')
    set('freins.title', 'freinsTitle')
    set('freins.sub', 'freinsSub')
    set('roadmap.title', 'roadmapTitle')
    set('roadmap.sub', 'roadmapSub')
    parseArr(read('market.items'), 'market')
    parseArr(read('freins.items'), 'freins')
    parseArr(read('roadmap.items'), 'roadmap')

    const photosRaw = read('photos.items')
    if (photosRaw) {
      try {
        const parsed = JSON.parse(photosRaw)
        if (Array.isArray(parsed)) {
          sections.photos = parsed.map((p: unknown) =>
            typeof p === 'string' ? p : String((p as { img?: string })?.img ?? ''),
          )
        }
      } catch { /* keep fallback */ }
    }

    hydrateBand('market', { title: 'marketTitle', body: 'marketBody', items: 'market' })
    hydrateBand('wealth', {
      title: 'wealthTitle',
      body: 'wealthBody',
      metricValue: 'wealthMetricValue',
      metricLabel: 'wealthMetricLabel',
      metricSub: 'wealthMetricSub',
    })
    hydrateBand('freins', { title: 'freinsTitle', sub: 'freinsSub', items: 'freins' })
    hydrateBand('roadmap', { title: 'roadmapTitle', sub: 'roadmapSub', items: 'roadmap' })

    const photosData = read('photos.data')
    if (photosData && read('photos.items') === undefined) {
      try {
        const data = JSON.parse(photosData) as Record<string, unknown>
        if (Array.isArray(data.items)) sections.photos = data.items
        else if (Array.isArray(data)) sections.photos = data
      } catch { /* keep fallback */ }
    }

    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'affaire') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: { title?: string; sub?: string; body?: string; items?: string; stats?: string },
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.body && data.body !== undefined && read(`${id}.body`) === undefined) {
          sections[map.body] = data.body
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          sections[map.items] = data.items
        }
        if (map.stats && Array.isArray(data.stats) && read(`${id}.stats`) === undefined) {
          sections[map.stats] = data.stats
        }
      } catch { /* keep fallback */ }
    }

    set('mondial.title', 'mondialTitle')
    set('tn.title', 'tnTitle')
    set('tn.body', 'tnBody')
    set('atouts.title', 'atoutsTitle')
    set('atouts.sub', 'atoutsSub')
    set('diag.title', 'diagTitle')
    set('diag.body', 'diagBody')
    set('axes.title', 'axesTitle')
    set('axes.sub', 'axesSub')
    parseArr(read('mondial.items'), 'mondial')
    parseArr(read('tn.stats'), 'tnStats')
    parseArr(read('atouts.items'), 'atouts')
    parseArr(read('diag.items'), 'diag')
    parseArr(read('axes.items'), 'axes')
    hydrateBand('mondial', { title: 'mondialTitle', items: 'mondial' })
    hydrateBand('tn', { title: 'tnTitle', body: 'tnBody', stats: 'tnStats' })
    hydrateBand('atouts', { title: 'atoutsTitle', sub: 'atoutsSub', items: 'atouts' })
    hydrateBand('diag', { title: 'diagTitle', body: 'diagBody', items: 'diag' })
    hydrateBand('axes', { title: 'axesTitle', sub: 'axesSub', items: 'axes' })
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'segment') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const parseTextList = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return
        sections[key] = parsed.map((row: unknown) =>
          typeof row === 'string' ? row : String((row as { text?: string })?.text ?? ''),
        )
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: { title?: string; sub?: string; body?: string; items?: string; label?: string; to?: string; eyebrow?: string; lead?: string },
      textListKey?: string,
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.body && data.body !== undefined && read(`${id}.body`) === undefined) {
          sections[map.body] = data.body
        }
        if (map.label && data.label !== undefined && read(`${id}.label`) === undefined) {
          sections[map.label] = data.label
        }
        if (map.to && data.to !== undefined && read(`${id}.to`) === undefined) {
          sections[map.to] = data.to
        }
        if (map.eyebrow && data.eyebrow !== undefined && read('intro.eyebrow') === undefined) {
          sections[map.eyebrow] = data.eyebrow
        }
        if (map.lead && data.lead !== undefined && read('intro.lead') === undefined) {
          sections[map.lead] = data.lead
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          if (textListKey) {
            sections[textListKey] = (data.items as unknown[]).map((row) =>
              typeof row === 'string' ? row : String((row as { text?: string })?.text ?? ''),
            )
          } else {
            sections[map.items] = data.items
          }
        }
      } catch { /* keep fallback */ }
    }

    set('intro.eyebrow', 'eyebrow')
    set('intro.lead', 'lead')
    set('stats.title', 'statsTitle')
    set('pillars.title', 'pillarsTitle')
    set('pillars.sub', 'pillarsSub')
    set('challenges.title', 'challengesTitle')
    set('actions.title', 'actionsTitle')
    set('cta.title', 'ctaTitle')
    set('cta.body', 'ctaBody')
    set('cta.label', 'ctaLabel')
    set('cta.to', 'ctaTo')
    parseArr(read('stats.items'), 'stats')
    parseArr(read('pillars.items'), 'pillars')
    parseTextList(read('challenges.items'), 'challenges')
    parseTextList(read('actions.items'), 'actions')
    hydrateBand('intro', { eyebrow: 'eyebrow', lead: 'lead' })
    hydrateBand('stats', { title: 'statsTitle', items: 'stats' })
    hydrateBand('pillars', { title: 'pillarsTitle', sub: 'pillarsSub', items: 'pillars' })
    hydrateBand('challenges', { title: 'challengesTitle', items: 'challenges' }, 'challenges')
    hydrateBand('actions', { title: 'actionsTitle', items: 'actions' }, 'actions')
    hydrateBand('cta', { title: 'ctaTitle', body: 'ctaBody', label: 'ctaLabel', to: 'ctaTo' })
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'golf') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: {
        title?: string
        sub?: string
        body?: string
        items?: string
        stats?: string
        box?: string
        boxLabel?: string
        boxSub?: string
        value?: string
      },
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.body && data.body !== undefined && read(`${id}.body`) === undefined) {
          sections[map.body] = data.body
        }
        if (map.box && data.box !== undefined && read(`${id}.box`) === undefined) {
          sections[map.box] = data.box
        }
        if (map.boxLabel && data.boxLabel !== undefined && read(`${id}.boxLabel`) === undefined) {
          sections[map.boxLabel] = data.boxLabel
        }
        if (map.boxSub && data.boxSub !== undefined && read(`${id}.boxSub`) === undefined) {
          sections[map.boxSub] = data.boxSub
        }
        if (map.value && data.value !== undefined && read('banner.text') === undefined) {
          sections[map.value] = data.value
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          sections[map.items] = data.items
        }
        if (map.stats && Array.isArray(data.stats) && read(`${id}.stats`) === undefined) {
          sections[map.stats] = data.stats
        }
      } catch { /* keep fallback */ }
    }

    set('pot.title', 'potTitle')
    set('pot.sub', 'potSub')
    set('banner.text', 'banner')
    set('etat.title', 'etatTitle')
    set('etat.body', 'etatBody')
    set('etat.box', 'etatBox')
    set('etat.boxLabel', 'etatBoxLabel')
    set('etat.boxSub', 'etatBoxSub')
    set('defis.title', 'defisTitle')
    set('defis.sub', 'defisSub')
    set('roadmap.title', 'roadmapTitle')
    set('roadmap.sub', 'roadmapSub')
    parseArr(read('pot.items'), 'pot')
    parseArr(read('etat.stats'), 'etatStats')
    parseArr(read('defis.items'), 'defis')
    parseArr(read('roadmap.items'), 'roadmap')
    hydrateBand('pot', { title: 'potTitle', sub: 'potSub', items: 'pot' })
    hydrateBand('banner', { value: 'banner' })
    hydrateBand('etat', {
      title: 'etatTitle',
      body: 'etatBody',
      stats: 'etatStats',
      box: 'etatBox',
      boxLabel: 'etatBoxLabel',
      boxSub: 'etatBoxSub',
    })
    hydrateBand('defis', { title: 'defisTitle', sub: 'defisSub', items: 'defis' })
    hydrateBand('roadmap', { title: 'roadmapTitle', sub: 'roadmapSub', items: 'roadmap' })
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'plaisance') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const parseTextList = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return
        sections[key] = parsed.map((row: unknown) =>
          typeof row === 'string' ? row : String((row as { text?: string })?.text ?? ''),
        )
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: {
        title?: string
        sub?: string
        body?: string
        items?: string
        cards?: string
        img?: string
        value?: string
      },
      textListKey?: string,
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.sub && data.sub !== undefined && read(`${id}.sub`) === undefined) {
          sections[map.sub] = data.sub
        }
        if (map.body && data.body !== undefined && read(`${id}.body`) === undefined) {
          sections[map.body] = data.body
        }
        if (map.img && data.img !== undefined && read(`${id}.img`) === undefined) {
          sections[map.img] = data.img
        }
        if (map.value && data.value !== undefined && read('blueprint.img') === undefined) {
          sections[map.value] = data.value
        }
        const list = map.cards
          ? (Array.isArray(data.cards) ? data.cards : undefined)
          : (Array.isArray(data.items) ? data.items : undefined)
        const targetKey = map.cards || map.items
        const flatKey = map.cards ? 'impact.items' : `${id}.items`
        if (targetKey && list && read(flatKey) === undefined) {
          if (textListKey) {
            sections[textListKey] = (list as unknown[]).map((row) =>
              typeof row === 'string' ? row : String((row as { text?: string })?.text ?? ''),
            )
          } else {
            sections[targetKey] = list
          }
        }
      } catch { /* keep fallback */ }
    }

    set('impact.title', 'impactTitle')
    set('marina.img', 'marinaImg')
    set('parent.icon', 'parentIcon')
    set('parent.title', 'parentTitle')
    set('parent.body', 'parentBody')
    set('prob.title', 'probTitle')
    set('prob.sub', 'probSub')
    set('actions.title', 'actionsTitle')
    set('actions.body', 'actionsBody')
    set('blueprint.img', 'blueprint')
    parseArr(read('impact.items'), 'impactCards')
    parseArr(read('prob.items'), 'probs')
    parseTextList(read('actions.items'), 'actions')
    hydrateBand('impact', { title: 'impactTitle', cards: 'impactCards' })
    hydrateBand('marina', { img: 'marinaImg' })
    hydrateBand('parent', { title: 'parentTitle', body: 'parentBody' })
    hydrateBand('prob', { title: 'probTitle', sub: 'probSub', items: 'probs' })
    hydrateBand('actions', { title: 'actionsTitle', body: 'actionsBody', items: 'actions' }, 'actions')
    hydrateBand('blueprint', { value: 'blueprint' })
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  if (fallback.layout === 'auto') {
    const sections: Record<string, unknown> = { ...fallback.sections }
    const parseArr = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) sections[key] = parsed
      } catch { /* keep fallback */ }
    }
    const parseTextList = (raw: string | undefined, key: string) => {
      if (!raw) return
      try {
        const parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return
        sections[key] = parsed.map((row: unknown) =>
          typeof row === 'string' ? row : String((row as { text?: string })?.text ?? ''),
        )
      } catch { /* keep fallback */ }
    }
    const set = (block: string, key: string) => {
      const v = read(block)
      if (v !== undefined) sections[key] = v
    }
    const hydrateBand = (
      id: string,
      map: {
        title?: string
        body?: string
        items?: string
        img?: string
        textList?: boolean
      },
    ) => {
      const raw = read(`${id}.data`)
      if (!raw) return
      try {
        const data = JSON.parse(raw) as Record<string, unknown>
        if (map.title && data.title !== undefined && read(`${id}.title`) === undefined) {
          sections[map.title] = data.title
        }
        if (map.body && data.body !== undefined && read(`${id}.body`) === undefined) {
          sections[map.body] = data.body
        }
        if (map.img && data.img !== undefined && read(`${id}.img`) === undefined) {
          sections[map.img] = data.img
        }
        if (map.items && Array.isArray(data.items) && read(`${id}.items`) === undefined) {
          if (map.textList) {
            sections[map.items] = (data.items as unknown[]).map((row) =>
              typeof row === 'string' ? row : String((row as { text?: string })?.text ?? ''),
            )
          } else {
            sections[map.items] = data.items
          }
        }
      } catch { /* keep fallback */ }
    }

    set('vision.title', 'visionTitle')
    set('vision.body', 'visionBody')
    set('real.title', 'realTitle')
    set('real.body', 'realBody')
    set('real.img', 'realImg')
    set('actions.title', 'actionsTitle')
    set('actions.body', 'actionsBody')
    set('actions.img', 'actionsImg')
    parseArr(read('stats.items'), 'stats')
    parseTextList(read('real.items'), 'realItems')
    parseTextList(read('actions.items'), 'actionsItems')
    hydrateBand('vision', { title: 'visionTitle', body: 'visionBody' })
    hydrateBand('stats', { items: 'stats' })
    hydrateBand('real', { title: 'realTitle', body: 'realBody', items: 'realItems', img: 'realImg', textList: true })
    hydrateBand('actions', {
      title: 'actionsTitle',
      body: 'actionsBody',
      items: 'actionsItems',
      img: 'actionsImg',
      textList: true,
    })
    return {
      ...fallback,
      heroTitle: read('hero.title') ?? fallback.heroTitle,
      intro: read('intro.body') ?? fallback.intro,
      sections,
    }
  }

  const sections: Record<string, unknown> = { ...fallback.sections }

  for (const section of getLayoutSchema(fallback.layout)) {
    const raw = read(sectionBlockKey(section.id))
    if (!raw) continue
    let data: Record<string, unknown>
    try {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue
      data = parsed as Record<string, unknown>
    } catch {
      continue
    }
    for (const f of section.fields) {
      if (data[f.field] !== undefined) sections[f.key] = data[f.field]
    }
  }

  // `??` not `||`: several pages ship an intentionally empty intro.
  const heroTitle = read('hero.title')
  const intro = read('intro.body')

  return {
    ...fallback,
    heroTitle: heroTitle ?? fallback.heroTitle,
    intro: intro ?? fallback.intro,
    sections,
  }
}
