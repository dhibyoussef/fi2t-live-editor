/**
 * Groupement hierarchy check: every Accueil slug and every hub child must
 * resolve, carry a title, load its photography, and (for children) expose a
 * breadcrumb back to its hub. Hubs and new leaves must render their content
 * bands. Expects the dev server on http://localhost:3002 (override AUDIT_BASE).
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.AUDIT_BASE || 'http://localhost:3002'
const OUT = 'scripts/audit-out/tree'
mkdirSync(OUT, { recursive: true })

/** slug → expectations. crumb: links back to a hub. bands: hub/segment content. */
const PAGES = [
  { slug: 'agences-de-voyages' },
  { slug: 'hebergements-alternatifs' },
  { slug: 'tourisme-culturel' },
  { slug: 'tourisme-aventure' },
  { slug: 'tourisme-affaires', redirectsTo: '/tourisme-affaire' },
  { slug: 'tourisme-affaire' },
  { slug: 'tourisme-automobile' },
  { slug: 'tourisme-de-sante', bands: true, cards: 4 },
  { slug: 'tourisme-sportif', bands: true, cards: 1 },
  { slug: 'tourisme-nautique', bands: true, cards: 1 },
  { slug: 'tourisme-ecologique', bands: true },
  { slug: 'tourisme-aeronautique', bands: true },
  { slug: 'tourisme-subaquatique', bands: true },
  { slug: 'tourisme-medical', crumb: true },
  { slug: 'thalassotherapie', crumb: true },
  { slug: 'tourisme-thermal', crumb: true },
  { slug: 'tourisme-senior', crumb: true },
  { slug: 'tourisme-golfique', crumb: true },
  { slug: 'tourisme-plaisance', crumb: true },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const failures = []

for (const spec of PAGES) {
  await page.goto(`${BASE}/${spec.slug}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)

  const path = new URL(page.url()).pathname
  const title = ((await page.locator('h1').first().textContent()) || '').trim()
  const crumbs = await page.locator('.fi2t-gl-crumb').count()
  const cards = await page.locator('.fi2t-gl-hub-card').count()
  const stats = await page.locator('.fi2t-gl-tree-stat').count()
  const pillars = await page.locator('.fi2t-gl-tree-pillar').count()
  const brokenImages = await page.evaluate(() =>
    [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
  )

  const problems = []
  if (!title) problems.push('no <h1>')
  if (brokenImages.length) problems.push(`broken images: ${brokenImages.join(', ')}`)
  if (spec.redirectsTo && path !== spec.redirectsTo) problems.push(`expected redirect to ${spec.redirectsTo}, got ${path}`)
  if (spec.crumb && !crumbs) problems.push('missing hub breadcrumb')
  if (spec.bands && (!stats || !pillars)) problems.push(`empty content bands (stats=${stats} pillars=${pillars})`)
  if (spec.cards != null && cards !== spec.cards) problems.push(`expected ${spec.cards} filière cards, got ${cards}`)

  if (problems.length) failures.push({ slug: spec.slug, problems })
  console.log(
    `${problems.length ? 'FAIL' : 'ok  '} /${spec.slug.padEnd(26)} "${title}"` +
      (crumbs ? ' [crumb]' : '') +
      (cards ? ` cards=${cards}` : '') +
      (stats ? ` stats=${stats}` : '') +
      (pillars ? ` pillars=${pillars}` : ''),
  )
  if (spec.bands) await page.screenshot({ path: `${OUT}/${spec.slug}.png`, fullPage: true })
}

await browser.close()

if (failures.length) {
  console.log('')
  for (const f of failures) console.log(`/${f.slug}: ${f.problems.join('; ')}`)
  process.exitCode = 1
} else {
  console.log(`\n${PAGES.length} pages ok — routes, photography, breadcrumbs and content bands`)
}
