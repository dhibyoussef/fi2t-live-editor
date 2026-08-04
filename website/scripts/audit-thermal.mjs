import { chromium } from 'playwright'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, 'audit-out')
const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-thermal', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(2500)
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
      lh: cs.lineHeight,
      color: cs.color,
      text: (el.textContent || '').trim().slice(0, 50),
    }
  }
  return {
    pageH: document.documentElement.scrollHeight,
    intro: box('.fi2t-gl-therm-intro p'),
    potH2: box('.fi2t-gl-therm-pot__head h2'),
    potSub: box('.fi2t-gl-therm-pot__head p'),
    statIcon: box('.fi2t-gl-therm-stat--1 .fi2t-gl-therm-stat__icon'),
    statVal: box('.fi2t-gl-therm-stat--1 .fi2t-gl-therm-stat__value'),
    statLabel: box('.fi2t-gl-therm-stat--1 .fi2t-gl-therm-stat__label'),
    statDesc: box('.fi2t-gl-therm-stat--1 p'),
    realH2: box('.fi2t-gl-therm-real__copy h2'),
    realBody: box('.fi2t-gl-therm-real__copy > p'),
    metric: box('.fi2t-gl-therm-metric'),
    metricVal: box('.fi2t-gl-therm-metric__value'),
    metricLabel: box('.fi2t-gl-therm-metric__label'),
    place1: box('.fi2t-gl-therm-place--1'),
    place2: box('.fi2t-gl-therm-place--2'),
    place3: box('.fi2t-gl-therm-place--3'),
    place4: box('.fi2t-gl-therm-place--4'),
    defisH2: box('.fi2t-gl-therm-defis__head h2'),
    defisIcon: [0, 1, 2].map((i) => box('.fi2t-gl-therm-defis-item__icon', i)),
    defisH3: box('.fi2t-gl-therm-defis-item--1 h3'),
    defisP: box('.fi2t-gl-therm-defis-item--1 p'),
    roadmapH2: box('.fi2t-gl-therm-roadmap__head h2'),
    num1: box('.fi2t-gl-therm-numcard--1'),
    numNum: box('.fi2t-gl-therm-numcard--1 .fi2t-gl-therm-numcard__num'),
    numH3: box('.fi2t-gl-therm-numcard--1 h3'),
    footer: box('.fi2t-footer'),
  }
})
console.log(JSON.stringify(m, null, 2))
await page.screenshot({ path: path.join(out, 'thermal-full.png'), fullPage: true })
await browser.close()
