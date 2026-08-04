import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { createCanvas, loadImage } = (() => {
  try {
    return require('canvas')
  } catch {
    return {}
  }
})()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, 'audit-out')
const designPath = path.resolve(
  __dirname,
  '../../Untitled (1)/Tourisme medical.png',
)

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-medical', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(3000)
await page.addStyleTag({ content: '.cms-edit-toolbar,[class*=EditToolbar]{display:none!important}' })

const m = await page.evaluate(() => {
  const box = (sel, i) => {
    const els = [...document.querySelectorAll(sel)]
    const el = i == null ? els[0] : els[i]
    if (!el) return null
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      x: Math.round(r.x),
      y: Math.round(r.top + scrollY),
      w: Math.round(r.width),
      h: Math.round(r.height),
      font: cs.fontFamily.split(',')[0].replace(/['"]/g, ''),
      size: cs.fontSize,
      weight: cs.fontWeight,
      text: (el.textContent || '').trim().slice(0, 60),
    }
  }
  return {
    pageH: document.documentElement.scrollHeight,
    cssOk: !!document.querySelector('.fi2t-gl-med-stage'),
    intro: box('.fi2t-gl-med-intro p'),
    advTitle: box('.fi2t-gl-med-adv__title'),
    advCard1: box('.fi2t-gl-med-adv__card--1'),
    originH2: box('.fi2t-gl-med-origin__left h2'),
    donut: box('.fi2t-gl-med-donut'),
    diagIntro: box('.fi2t-gl-med-diag__intro'),
    diag1: box('.fi2t-gl-med-diag__card--1'),
    actionsTitle: box('.fi2t-gl-med-actions__title'),
    action1: box('.fi2t-gl-med-action--1'),
    action2: box('.fi2t-gl-med-action--2'),
    footer: box('.fi2t-footer'),
  }
})
console.log(JSON.stringify(m, null, 2))

const shotPath = path.join(out, 'medical-full.png')
await page.screenshot({ path: shotPath, fullPage: true })
await browser.close()

// MAE via Pillow through python is more reliable on Windows
import { spawnSync } from 'child_process'
const py = `
from PIL import Image
import numpy as np
from pathlib import Path
live = Image.open(r'${shotPath.replace(/\\/g, '/')}').convert('RGB')
des = Image.open(r'${designPath.replace(/\\/g, '/')}').convert('RGB')
print('live', live.size, 'des', des.size)
# crop live to design height if taller (footer variance)
w = min(live.width, des.width, 1440)
h = min(live.height, des.height)
live = live.crop((0,0,w,h))
des = des.crop((0,0,w,h))
a = np.asarray(live, dtype=np.float32)
b = np.asarray(des, dtype=np.float32)
mae = float(np.mean(np.abs(a-b)))
print('full MAE', round(mae, 2))
bands = {
  'hero': (110, 503),
  'intro': (555, 670),
  'adv': (728, 1244),
  'origin': (1324, 1966),
  'diag': (1966, 2554),
  'actions': (2554, 2987),
  'footer': (2987, h),
  'real': (555, 2987),
}
for name,(y0,y1) in bands.items():
  y1=min(y1,h); y0=min(y0,h)
  if y1<=y0: continue
  mae=float(np.mean(np.abs(a[y0:y1]-b[y0:y1])))
  print(name, round(mae,2))
`
const r = spawnSync('python', ['-c', py], { encoding: 'utf-8' })
console.log(r.stdout)
if (r.stderr) console.error(r.stderr)
