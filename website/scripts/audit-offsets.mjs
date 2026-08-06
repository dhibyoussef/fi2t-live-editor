/**
 * Diagnose per-page vertical alignment: hero band vs content band.
 * Reports the best vertical shift for the hero region and for the content region
 * separately, so systematic 1px offsets are visible.
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
  ['/tourisme-aventure', "Tourisme d'aventure"],
  ['/hebergements-alternatifs', 'Hébergements Alternatifs touristiques.png'],
  ['/tourisme-culturel', 'Tourisme culturel.png'],
  ['/agences-de-voyages', 'Agences de voyages.png'],
]

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()

for (const [route, design] of PAGES) {
  const designPath = path.join(designDir, design)
  if (!fs.existsSync(designPath)) {
    console.log(route.padEnd(28), 'DESIGN MISSING:', design)
    continue
  }
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 60000 })
    await page.waitForTimeout(2200)
    await page.addStyleTag({ content: '.cms-edit-toolbar,[class*=EditToolbar]{display:none!important}' })
    await page.evaluate(async () => {
      await Promise.all([...document.images].filter((i) => !i.complete).map((i) => new Promise((r) => { i.onload = i.onerror = r })))
    })
  } catch (e) {
    console.log(route.padEnd(28), 'LOAD FAIL')
    continue
  }
  const geo = await page.evaluate(() => {
    const hero = document.querySelector('[class*=fi2t-page-hero]')
    const hr = hero ? hero.getBoundingClientRect() : null
    const hdr = document.querySelector('.fi2t-header')
    // first element after the hero that starts a content band
    let contentTop = null
    if (hero && hero.nextElementSibling) contentTop = hero.nextElementSibling.getBoundingClientRect().top + scrollY
    else if (hero?.parentElement?.nextElementSibling) contentTop = hero.parentElement.nextElementSibling.getBoundingClientRect().top + scrollY
    return {
      hdrH: hdr ? hdr.getBoundingClientRect().height : null,
      heroTop: hr ? +(hr.top + scrollY).toFixed(1) : null,
      heroH: hr ? +hr.height.toFixed(1) : null,
      contentTop: contentTop != null ? +contentTop.toFixed(1) : null,
    }
  })
  const slug = route.replace(/\//g, '-').replace(/^-/, '')
  const shot = path.join(out, `off-${slug}.png`)
  await page.screenshot({ path: shot, fullPage: true })

  const heroTop = geo.heroTop ?? 111
  const heroBot = heroTop + (geo.heroH ?? 393)
  const py = `
import json
from PIL import Image
import numpy as np
live=Image.open(r'${shot.replace(/\\/g, '/')}').convert('RGB')
des=Image.open(r'${designPath.replace(/\\/g, '/')}').convert('RGB')
w=min(live.width,des.width,1440); h=min(live.height,des.height)
a=np.asarray(live.crop((0,0,w,h)),dtype=np.float32)
b=np.asarray(des.crop((0,0,w,h)),dtype=np.float32)
def best(y0,y1):
    y0=max(0,int(y0)); y1=min(h,int(y1))
    if y1-y0<40: return (None,None)
    r=[]
    for dy in range(-20,21):
        ya0=y0+dy; ya1=y1+dy
        if ya0<0 or ya1>a.shape[0]: continue
        r.append((float(np.mean(np.abs(a[ya0:ya1]-b[y0:y1]))),dy))
    r.sort()
    return (round(r[0][0],2), r[0][1])
hm,hd=best(${Math.round(heroTop)}+8, ${Math.round(heroBot)}-4)
cm,cd=best(${Math.round(heroBot)}+8, h-140)
print(json.dumps({'heroMae':hm,'heroShift':hd,'contMae':cm,'contShift':cd}))
`
  const r = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
  let m = {}
  try { m = JSON.parse((r.stdout || '').trim().split('\n').pop()) } catch { m = { err: (r.stderr || '').slice(0, 70) } }
  console.log(
    route.padEnd(28),
    `hdr=${geo.hdrH}`,
    `hero=${geo.heroTop}+${geo.heroH}`,
    `content=${geo.contentTop}`,
    `| heroMAE=${String(m.heroMae).padEnd(6)} heroShift=${String(m.heroShift).padEnd(3)}`,
    `contMAE=${String(m.contMae).padEnd(6)} contShift=${m.contShift}`,
    m.err || '',
  )
}
await browser.close()
