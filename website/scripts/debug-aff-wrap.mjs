import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-affaire', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1500)

const info = await page.evaluate(() => {
  const p = document.querySelector('.fi2t-gl-aff-tn__row--1 p')
  const s = getComputedStyle(p)
  const r = p.getBoundingClientRect()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  ctx.font = '300 18px "Montserrat Alternates"'
  const text = p.textContent.trim()
  const full = ctx.measureText(text).width
  const words = text.split(/\s+/)
  const wrap = (wlim) => {
    const lines = ['']
    for (const w of words) {
      const trial = (lines[lines.length - 1] ? `${lines[lines.length - 1]} ` : '') + w
      if (ctx.measureText(trial).width > wlim && lines[lines.length - 1]) lines.push(w)
      else lines[lines.length - 1] = trial
    }
    return lines
  }
  return {
    clientWidth: p.clientWidth,
    offsetWidth: p.offsetWidth,
    rectW: Math.round(r.width),
    padding: s.padding,
    flex: s.flex,
    maxWidth: s.maxWidth,
    width: s.width,
    fullTextWidth: Math.round(full),
    wrap349: wrap(349),
    wrap349w: wrap(349).map((l) => Math.round(ctx.measureText(l).width)),
    wrap370: wrap(370),
    font: s.font,
    parentW: p.parentElement.getBoundingClientRect().width,
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
