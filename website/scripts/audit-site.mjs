/**
 * Site-wide design audit.
 * Screenshots every page at 1440px and compares it to its Figma artboard export.
 * Reports overall MAE, the best vertical shift (to expose systematic 1px offsets),
 * and page-height deltas.
 *
 * Usage: node scripts/audit-site.mjs [routeFilter]
 */
import { chromium } from 'playwright'
import { spawnSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, 'audit-out', 'site')
const designDir = path.resolve(__dirname, '../public/design-refs')
fs.mkdirSync(out, { recursive: true })

const BASE = process.env.AUDIT_BASE || 'http://localhost:3002'

// route -> design artboard filename
const PAGES = [
  ['/', 'Home page.jpg'],
  ['/qui-sommes-nous', 'qui somme ns.png'],
  ['/organisation', 'Organisation.png'],
  ['/actualites', 'Actualité.png'],
  ['/contact', 'Contact.png'],
  ['/thalassotherapie', 'Thalassothérapie.png'],
  ['/tourisme-senior', 'Tourisme des Sénior.png'],
  ['/tourisme-thermal', 'Tourisme thermal.png'],
  ['/tourisme-medical', 'Tourisme medical.png'],
  ['/tourisme-affaire', 'Tourisme d\u2019affaire.png'],
  ['/tourisme-golfique', 'Tourisme golfique.png'],
  ['/tourisme-plaisance', 'Tourisme la plaisance.png'],
  ['/tourisme-automobile', 'Tourisme automobile.png'],
  ['/tourisme-aventure', 'Tourisme d\u2019aventure/Tourisme Alternatif.png'],
  ['/hebergements-alternatifs', 'Hébergements Alternatifs touristiques.png'],
  ['/tourisme-culturel', 'Tourisme culturel.png'],
  ['/agences-de-voyages', 'Agences de voyages.png'],
]

const filter = process.argv[2]
const browser = await chromium.launch({ headless: true })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const page = await ctx.newPage()

const rows = []
for (const [route, design] of PAGES) {
  if (filter && !route.includes(filter)) continue
  const designPath = path.join(designDir, design)
  if (!fs.existsSync(designPath)) {
    rows.push({ route, design, status: 'DESIGN MISSING' })
    continue
  }
  let status = 'ok'
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(2500)
    await page.addStyleTag({
      content: '.cms-edit-toolbar,[class*=EditToolbar]{display:none!important}',
    })
    await page.evaluate(async () => {
      await Promise.all(
        [...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r })),
      )
    })
    await page.waitForTimeout(400)
  } catch (e) {
    rows.push({ route, design, status: 'LOAD FAIL: ' + e.message.slice(0, 60) })
    continue
  }
  const slug = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '')
  const shot = path.join(out, `${slug}.png`)
  await page.screenshot({ path: shot, fullPage: true })

  const py = `
import json
from PIL import Image
import numpy as np
live = Image.open(r'${shot.replace(/\\/g, '/')}').convert('RGB')
des  = Image.open(r'${designPath.replace(/\\/g, '/')}').convert('RGB')
w = min(live.width, des.width, 1440)
h = min(live.height, des.height)
a = np.asarray(live.crop((0,0,w,h)), dtype=np.float32)
b = np.asarray(des.crop((0,0,w,h)), dtype=np.float32)
res = {'liveH': live.height, 'desH': des.height, 'mae': round(float(np.mean(np.abs(a-b))),2)}
# best global vertical shift over a mid band (skip header/footer chrome)
y0, y1 = 120, min(h-1, des.height-120)
best = None
for dy in range(-4, 5):
    ya0, ya1 = max(0,y0+dy), min(a.shape[0], y1+dy)
    n = ya1-ya0
    if n <= 50: continue
    m = float(np.mean(np.abs(a[ya0:ya0+n] - b[y0:y0+n])))
    if best is None or m < best[0]: best = (m, dy)
res['bestShift'] = best[1]
res['maeAtBestShift'] = round(best[0],2)
res['maeBand'] = round(float(np.mean(np.abs(a[y0:y1]-b[y0:y1]))),2)
# Every artboard puts the banner at rows 110-503. Several pages intentionally
# replace the design's placeholder photo, so score the banner separately from
# the content below it — otherwise a deliberate photo swap reads as a regression.
if h > 503:
    res['maeBanner'] = round(float(np.mean(np.abs(a[110:503]-b[110:503]))),2)
    res['maeContent'] = round(float(np.mean(np.abs(a[503:y1]-b[503:y1]))),2)
print(json.dumps(res))
`
  const r = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
  let m = {}
  try {
    m = JSON.parse((r.stdout || '').trim().split('\n').pop())
  } catch {
    status = 'CMP FAIL: ' + (r.stderr || '').slice(0, 80)
  }
  rows.push({ route, design, status, ...m, heightDelta: m.liveH != null ? m.liveH - m.desH : null })
  console.log(
    route.padEnd(28),
    `mae=${String(m.mae).padEnd(6)}`,
    `band=${String(m.maeBand).padEnd(6)}`,
    m.maeBanner != null ? `banner=${String(m.maeBanner).padEnd(6)}` : 'banner=—     ',
    m.maeContent != null ? `content=${String(m.maeContent).padEnd(6)}` : 'content=—     ',
    `h=${m.liveH}/${m.desH}`,
    status === 'ok' ? '' : status,
  )
}
await browser.close()

fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(rows, null, 2))
console.log('\nWrote', path.join(out, 'report.json'))
