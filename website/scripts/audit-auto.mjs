import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, 'audit-out')
const designPath = path.resolve(__dirname, '../../Untitled (1)/Tourisme automobile.png')

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-automobile', { waitUntil: 'networkidle', timeout: 60000 })
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
      t: (el.textContent || '').trim().slice(0, 55),
    }
  }
  return {
    pageH: document.documentElement.scrollHeight,
    stage: box('.fi2t-gl-auto-stage'),
    visionH2: box('.fi2t-gl-auto-vision__title'),
    stat1: box('.fi2t-gl-auto-stat-card--1'),
    stat2: box('.fi2t-gl-auto-stat-card--2'),
    realH2: box('.fi2t-gl-auto-real__copy h2'),
    realImg: box('.fi2t-gl-auto-real__img'),
    actH2: box('.fi2t-gl-auto-actions__copy h2'),
    actImg: box('.fi2t-gl-auto-actions__img'),
    footer: box('.fi2t-footer'),
  }
})
console.log(JSON.stringify(m, null, 2))

const shotPath = path.join(out, 'auto-full.png')
await page.screenshot({ path: shotPath, fullPage: true })
await browser.close()

const py = `
from PIL import Image
import numpy as np
live = Image.open(r'${shotPath.replace(/\\/g, '/')}').convert('RGB')
des = Image.open(r'${designPath.replace(/\\/g, '/')}').convert('RGB')
print('live', live.size, 'des', des.size)
w = min(live.width, des.width, 1440)
h = min(live.height, des.height)
a = np.asarray(live.crop((0,0,w,h)), dtype=np.float32)
b = np.asarray(des.crop((0,0,w,h)), dtype=np.float32)
print('full MAE', round(float(np.mean(np.abs(a-b))), 2))
for name,y0,y1 in [
  ('hero',110,503),('vision',503,870),('stats',870,1350),
  ('real',1350,1931),('actions',1931,2524),('footer',2524,h),
  ('content',503,2524),
]:
  y1=min(y1,h); y0=min(y0,h)
  if y1<=y0: continue
  print(name, round(float(np.mean(np.abs(a[y0:y1]-b[y0:y1]))),2))
`
const r = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
console.log(r.stdout)
if (r.stderr) console.error(r.stderr)
