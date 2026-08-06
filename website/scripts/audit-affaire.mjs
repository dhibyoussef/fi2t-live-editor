import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, 'audit-out')
const designPath = path.resolve(__dirname, '../public/design-refs/Tourisme d’affaire.png')

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-affaire', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(3000)
await page.addStyleTag({ content: '.cms-edit-toolbar,[class*=EditToolbar]{display:none!important}' })

const m = await page.evaluate(() => {
  const box = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return {
      x: Math.round(r.x),
      y: Math.round(r.top + scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
      t: (el.textContent || '').trim().slice(0, 60),
    }
  }
  return {
    pageH: document.documentElement.scrollHeight,
    stage: box('.fi2t-gl-aff-stage'),
    mondialH2: box('.fi2t-gl-aff-mondial__title'),
    col1: box('.fi2t-gl-aff-mondial__col--1'),
    tnH2: box('.fi2t-gl-aff-tn__title'),
    pill1: box('.fi2t-gl-aff-tn__pill--1'),
    atoutsH2: box('.fi2t-gl-aff-atouts__title'),
    card1: box('.fi2t-gl-aff-atouts__card--1'),
    diagH2: box('.fi2t-gl-aff-diag__copy h2'),
    cell1: box('.fi2t-gl-aff-diag__cell--1'),
    axesH2: box('.fi2t-gl-aff-axes__head h2'),
    axe1: box('.fi2t-gl-aff-axe--1'),
    footer: box('.fi2t-footer'),
  }
})
console.log(JSON.stringify(m, null, 2))

const shotPath = path.join(out, 'affaire-full.png')
await page.screenshot({ path: shotPath, fullPage: true })
await browser.close()

const py = `
from PIL import Image
import numpy as np
from pathlib import Path
live = Image.open(r'${shotPath.replace(/\\/g, '/')}').convert('RGB')
des = Image.open(r'${designPath.replace(/\\/g, '/')}').convert('RGB')
print('live', live.size, 'des', des.size)
w = min(live.width, des.width, 1440)
h = min(live.height, des.height)
a = np.asarray(live.crop((0,0,w,h)), dtype=np.float32)
b = np.asarray(des.crop((0,0,w,h)), dtype=np.float32)
print('full MAE', round(float(np.mean(np.abs(a-b))), 2))
for name,y0,y1 in [
  ('hero',110,503),('mondial',503,1066),('tunisie',1066,1527),
  ('atouts',1527,2131),('diag',2131,2933),('axes',2933,3644),('footer',3644,h),
  ('content',503,3644),
]:
  y1=min(y1,h); y0=min(y0,h)
  if y1<=y0: continue
  print(name, round(float(np.mean(np.abs(a[y0:y1]-b[y0:y1]))),2))
`
const r = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
console.log(r.stdout)
if (r.stderr) console.error(r.stderr)
