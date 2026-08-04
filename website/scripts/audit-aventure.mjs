import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, 'audit-out')
const designPath = path.resolve(
  __dirname,
  '../../Untitled (1)/Tourisme d’aventure/Tourisme Alternatif.png',
)

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-aventure', { waitUntil: 'networkidle', timeout: 60000 })
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
      t: (el.textContent || '').trim().slice(0, 50),
    }
  }
  return {
    pageH: document.documentElement.scrollHeight,
    cssOk: !!document.querySelector('.fi2t-gl-av-stage'),
    intro: box('.fi2t-gl-av-intro p'),
    marketH2: box('.fi2t-gl-av-market__copy h2'),
    kpi1: box('.fi2t-gl-av-kpi'),
    photo1: box('.fi2t-gl-av-wealth__photo--1'),
    photo3: box('.fi2t-gl-av-wealth__photo--3'),
    wealthH2: box('.fi2t-gl-av-wealth__copy h2'),
    callout: box('.fi2t-gl-av-callout'),
    freinsH2: box('.fi2t-gl-av-freins__head h2'),
    freins1: box('.fi2t-gl-av-freins__card--1'),
    roadmapH2: box('.fi2t-gl-av-roadmap__copy h2'),
    step1: box('.fi2t-gl-av-roadmap__list li'),
    footer: box('.fi2t-footer'),
  }
})
console.log(JSON.stringify(m, null, 2))

const shotPath = path.join(out, 'aventure-full.png')
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
  ('hero',110,503),('top',503,914),('wealth',914,1574),
  ('freins',1574,2178),('roadmap',2178,2736),('footer',2736,h),
  ('real',555,2736),
]:
  y1=min(y1,h); y0=min(y0,h)
  if y1<=y0: continue
  print(name, round(float(np.mean(np.abs(a[y0:y1]-b[y0:y1]))),2))
`
const r = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
console.log(r.stdout)
if (r.stderr) console.error(r.stderr)
