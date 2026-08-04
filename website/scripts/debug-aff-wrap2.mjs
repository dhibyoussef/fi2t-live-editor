import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await (
  await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
).newPage()
await page.goto('http://localhost:3002/tourisme-affaire', { waitUntil: 'networkidle', timeout: 60000 })
await page.waitForTimeout(1000)

const info = await page.evaluate(() => {
  const wrap = (text, wlim) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.font = '300 18px "Montserrat Alternates"'
    const words = text.split(/\s+/)
    const lines = ['']
    for (const w of words) {
      const trial = (lines[lines.length - 1] ? `${lines[lines.length - 1]} ` : '') + w
      if (ctx.measureText(trial).width > wlim && lines[lines.length - 1]) lines.push(w)
      else lines[lines.length - 1] = trial
    }
    return lines.length
  }
  const texts = [...document.querySelectorAll('.fi2t-gl-aff-axe p')].map((p) => p.textContent.trim())
  const out = {}
  for (let i = 0; i < texts.length; i++) {
    out[`axe${i + 1}`] = {}
    for (const w of [350, 357, 363, 370, 380, 390, 400, 410, 420]) {
      out[`axe${i + 1}`][w] = wrap(texts[i], w)
    }
  }
  return out
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
