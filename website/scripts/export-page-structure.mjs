/**
 * Read the real structure of every public page and write it out for the CMS.
 *
 * Rather than maintaining a hand-written list of sections that inevitably
 * drifts from the site, this crawls the running site and records the
 * `data-cms-block` markers in document order. What the back-office shows as
 * "Structure de la page" is therefore, by construction, exactly what a visitor
 * sees — in the same order, with nothing missing and nothing invented.
 *
 *   node scripts/export-page-structure.mjs [http://localhost:3002]
 */

import { build } from 'esbuild'
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const outFile = resolve(here, '../../backend/database/seeders/data/page-structure.json')
const SITE = process.argv[2] || 'http://localhost:3002'

/**
 * Public route → CMS page slug. `global` owns the header and footer, which
 * every route renders, so any route can be used to read it.
 *
 * The seventeen Figma-custom groupement layouts are deliberately absent: they
 * render whole artboards from one JSON block per band and are structured by
 * `CustomGroupementPageSeeder` from their own schema instead.
 */
const ROUTES = [
  ['/', 'home'],
  ['/qui-sommes-nous', 'qui-sommes-nous'],
  ['/organisation', 'organisation'],
  ['/actualites', 'actualites'],
  ['/fiche-adhesion', 'fiche-adhesion'],
  ['/contact', 'contact'],
  ['/agences-de-voyages', 'agences-de-voyages'],
  ['/hebergements-alternatifs', 'hebergements-alternatifs'],
  ['/', 'global'],
]

/** Wording for the section names the pages use. */
const SECTION_LABELS = {
  hero: 'Bannière',
  about: 'Qui sommes-nous',
  objectifs: 'Nos objectifs',
  groupements: 'Groupements professionnels',
  adherer: 'Pourquoi adhérer',
  actualites: 'Actualités',
  cta: 'Appel à l’action',
  mission: 'Histoire & mission',
  values: 'Nos objectifs',
  diversify: 'Diversification',
  join: 'Appel à adhésion',
  stats: 'Chiffres clés',
  board: 'Composition actuelle',
  headquarters: 'Bureau du siège',
  regional: 'Bureaux régionaux',
  grid: 'Grille des articles',
  article: 'Page article',
  intro: 'Introduction',
  benefits: 'Avantages',
  form: 'Formulaire',
  info: 'Informations de contact',
  positioning: 'Positionnement',
  challenges: 'Défis',
  enjeux: 'Enjeux stratégiques',
  proposals: 'Propositions',
  header: 'En-tête',
  footer: 'Pied de page',
  settings: 'Paramètres du site',
}

/**
 * Blocks that exist but leave no marker in the crawled page: paging limits,
 * the banner of the article detail route, and the site metadata the
 * back-office reads but no band renders.
 */
const EXTRA_KEYS = {
  actualites: { grid: ['per_page'], article: ['banner'] },
  contact: { info: ['per_page'], form: ['success'] },
  'fiche-adhesion': { adherer: ['per_page'], form: ['success'] },
  global: { settings: ['hotel_name', 'tagline'] },
}

/** Pattern hints so the builder previews each band sensibly. */
function patternFor(section, keys) {
  if (section === 'hero') return 'hero'
  if (section === 'stats') return 'stats'
  if (section === 'cta' || section === 'join') return 'cta_banner'
  if (keys.some((k) => k === 'items' || k === 'cards' || k === 'members' || k === 'staff' || k === 'reasons')) {
    return 'cards_grid'
  }
  if (keys.some((k) => k === 'image' || k === 'logo' || k === 'bg')) return 'text_image'
  return 'text'
}

const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1).replace(/[-_]/g, ' ')

/**
 * The website's bundled defaults, so pruning can tell a block the page simply
 * did not render in this pass (a paging limit, a branch behind a breakpoint)
 * from one that no longer exists anywhere. Only the latter is safe to delete.
 */
async function loadDefaults() {
  const p = (rel) => resolve(root, rel).replace(/\\/g, '/')
  const entry = `
    import { getPageDefaults } from '${p('src/cms/pageDefaults.ts')}'
    const out = {}
    for (const page of ${JSON.stringify(ROUTES.map(([, slug]) => slug))}) {
      out[page] = {}
      for (const locale of ['fr', 'en', 'ar']) out[page][locale] = getPageDefaults(page, locale)
    }
    process.stdout.write(JSON.stringify(out))
  `
  const result = await build({
    stdin: { contents: entry, resolveDir: root, loader: 'ts' },
    bundle: true,
    platform: 'node',
    format: 'esm',
    write: false,
    logLevel: 'warning',
  })
  const dataUrl =
    'data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64')

  let captured = ''
  const write = process.stdout.write.bind(process.stdout)
  process.stdout.write = (chunk) => {
    captured += typeof chunk === 'string' ? chunk : chunk.toString()
    return true
  }
  await import(dataUrl)
  process.stdout.write = write
  return JSON.parse(captured)
}

const defaults = await loadDefaults()

const b = await chromium.launch()
const c = await b.newContext({ viewport: { width: 1440, height: 1000 } })
const p = await c.newPage()
const out = {}

for (const [route, slug] of ROUTES) {
  await p.goto(SITE + route, { waitUntil: 'networkidle', timeout: 60000 })
  await p.waitForTimeout(700)

  // Only blocks owned by this page — the header and footer belong to `global`.
  const blocks = await p.evaluate(
    (owner) =>
      [...document.querySelectorAll(`[data-cms-page="${owner}"][data-cms-block]`)].map((el) =>
        el.getAttribute('data-cms-block'),
      ),
    slug,
  )

  // Preserve document order; first appearance decides the section order.
  const order = []
  const keysBySection = new Map()
  for (const block of blocks) {
    const [section, key] = block.includes('.') ? block.split('.') : ['content', block]
    if (!keysBySection.has(section)) {
      keysBySection.set(section, [])
      order.push(section)
    }
    const keys = keysBySection.get(section)
    if (!keys.includes(key)) keys.push(key)
  }

  /*
   * A handful of blocks steer a section without rendering anything of their
   * own (`grid.per_page`) or belong to a detail route (`article.banner`).
   * They are real content, so keep them attached to the band they configure.
   */
  for (const [section, keys] of Object.entries(EXTRA_KEYS[slug] ?? {})) {
    if (!keysBySection.has(section)) {
      keysBySection.set(section, [])
      order.push(section)
    }
    for (const key of keys) {
      if (!keysBySection.get(section).includes(key)) keysBySection.get(section).push(key)
    }
  }

  /*
   * A block can be legitimately absent from this crawl — hidden behind a
   * breakpoint, or belonging to a detail route. Anything the website still
   * ships a default for stays; only keys with no default anywhere are dead.
   */
  const pageDefaults = defaults[slug] ?? { fr: {}, en: {}, ar: {} }
  for (const key of Object.keys(pageDefaults.fr)) {
    const [section, name] = key.includes('.') ? key.split('.') : ['content', key]
    if (!keysBySection.has(section)) continue
    if (!keysBySection.get(section).includes(name)) keysBySection.get(section).push(name)
  }

  out[slug] = order.map((section, i) => ({
    slug: section,
    title: SECTION_LABELS[section] ?? titleCase(section),
    pattern: patternFor(section, keysBySection.get(section)),
    sort_order: i + 1,
    keys: keysBySection.get(section),
    // Seed values for fields the database has never heard of, so every band
    // in the back-office opens with real content instead of blank inputs.
    values: Object.fromEntries(
      ['fr', 'en', 'ar'].map((locale) => [
        locale,
        Object.fromEntries(
          keysBySection
            .get(section)
            .filter((k) => pageDefaults[locale]?.[`${section}.${k}`] !== undefined)
            .map((k) => [k, pageDefaults[locale][`${section}.${k}`]]),
        ),
      ]),
    ),
  }))

  console.log(`${slug.padEnd(20)} ${out[slug].length} sections`)
  for (const s of out[slug]) {
    console.log(`   ${String(s.sort_order).padStart(2)}. ${s.slug.padEnd(14)} ${s.title.padEnd(28)} [${s.keys.join(', ')}]`)
  }
}

await b.close()
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(out, null, 2) + '\n', 'utf8')
console.log(`\nwrote ${outFile}`)
