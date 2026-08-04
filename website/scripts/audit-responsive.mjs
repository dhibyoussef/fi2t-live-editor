/**
 * Reports horizontal overflow on every public route at phone / tablet widths.
 *
 *   node scripts/audit-responsive.mjs [width] [locale]
 *
 * Prints, per page, the document scroll width and the widest offending
 * elements so fixes can target real selectors instead of guesses.
 */

import { chromium } from 'playwright'

const WIDTHS = (process.argv[2] || '390')
  .split(',')
  .map((n) => Number(n.trim()))
  .filter(Boolean)
const LOCALE = process.argv[3] || 'fr'
const BASE = 'http://localhost:3002'

const ROUTES = [
  '/',
  '/qui-sommes-nous',
  '/organisation',
  '/actualites',
  '/actualites/trois-questions-walid-tritar',
  '/contact',
  '/fiche-adhesion',
  '/agences-de-voyages',
  '/hebergements-alternatifs',
  '/tourisme-culturel',
  '/tourisme-de-sante',
  '/tourisme-medical',
  '/thalassotherapie',
  '/tourisme-thermal',
  '/tourisme-senior',
  '/tourisme-aventure',
  '/tourisme-affaire',
  '/tourisme-golfique',
  '/tourisme-plaisance',
  '/tourisme-automobile',
  '/tourisme-sportif',
  '/tourisme-nautique',
  '/tourisme-ecologique',
  '/tourisme-aeronautique',
  '/tourisme-subaquatique',
]

const browser = await chromium.launch()
const grandTotal = []

for (const WIDTH of WIDTHS) {
const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: 850 },
  isMobile: WIDTH < 700,
  hasTouch: WIDTH < 700,
})

const page = await ctx.newPage()
await page.goto(BASE, { waitUntil: 'domcontentloaded' })
await page.evaluate((l) => localStorage.setItem('fi2t_lang', l), LOCALE)

let totalBad = 0

for (const route of ROUTES) {
  const errors = []
  page.removeAllListeners('pageerror')
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 120)))

  await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 45000 })
  await page.waitForTimeout(400)

  const report = await page.evaluate((vw) => {
    const doc = document.documentElement
    const scrollW = Math.max(doc.scrollWidth, document.body.scrollWidth)
    const offenders = []
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) continue
      const right = r.right + window.scrollX
      // Ignore decorative overflow that is clipped by an ancestor.
      if (right <= vw + 1 && r.left >= -1) continue
      const style = getComputedStyle(el)
      if (style.position === 'fixed') continue
      offenders.push({
        sel:
          el.tagName.toLowerCase() +
          (el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
            : ''),
        left: Math.round(r.left),
        right: Math.round(right),
        w: Math.round(r.width),
      })
    }
    // Keep the outermost / widest offenders — children repeat the same problem.
    offenders.sort((a, b) => b.right - b.left - (a.right - a.left))
    return { scrollW, offenders: offenders.slice(0, 5), count: offenders.length }
  }, WIDTH)

  const bad = report.scrollW > WIDTH + 1
  if (bad) totalBad += 1
  if (bad || errors.length) {
    console.log(
      `OVERFLOW @${WIDTH} ${route.padEnd(26)} scrollW=${String(report.scrollW).padStart(5)} offenders=${report.count}` +
        (errors.length ? `  JS_ERR: ${errors[0]}` : ''),
    )
    for (const o of report.offenders) {
      console.log(`         ${o.sel}  left=${o.left} right=${o.right} w=${o.w}`)
    }
  }
}

console.log(`${totalBad}/${ROUTES.length} routes overflow at ${WIDTH}px (${LOCALE})`)
grandTotal.push([WIDTH, totalBad])
await ctx.close()
}

console.log('\n=== summary (' + LOCALE + ') ===')
for (const [w, n] of grandTotal) console.log(`  ${String(w).padStart(5)}px  ${n} overflowing`)
await browser.close()
