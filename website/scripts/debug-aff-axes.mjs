import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-affaire', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1500)

const info = await page.evaluate(() => {
  const wrap = (font, text, wlim) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = font
    const words = text.split(/\s+/)
    const lines = ['']
    for (const w of words) {
      const trial = (lines[lines.length - 1] ? `${lines[lines.length - 1]} ` : '') + w
      if (ctx.measureText(trial).width > wlim && lines[lines.length - 1]) lines.push(w)
      else lines[lines.length - 1] = trial
    }
    return { lines, widths: lines.map((l) => Math.round(ctx.measureText(l).width)) }
  }

  const bodies = [...document.querySelectorAll('.fi2t-gl-aff-axe p')].map((p, i) => {
    const text = p.textContent.trim()
    const font = getComputedStyle(p).font
    const w = p.clientWidth
    return {
      i,
      w,
      text: text.slice(0, 60),
      wrap: wrap('300 18px "Montserrat Alternates"', text, w),
      wrap355: wrap('300 18px "Montserrat Alternates"', text, 355),
      wrap360: wrap('300 18px "Montserrat Alternates"', text, 360),
      wrap363: wrap('300 18px "Montserrat Alternates"', text, 363),
    }
  })

  const titles = [...document.querySelectorAll('.fi2t-gl-aff-axe h3')].map((h, i) => {
    const s = getComputedStyle(h)
    const r = h.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(h)
    return {
      i,
      font: s.fontFamily,
      y: Math.round(r.top + scrollY),
      h: Math.round(r.height),
      rects: [...range.getClientRects()].map((x) => ({
        y: Math.round(x.top + scrollY),
        w: Math.round(x.width),
      })),
    }
  })

  return { bodies, titles }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
