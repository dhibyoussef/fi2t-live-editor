import { chromium } from '../../frontend/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '../audit-out/client-qa')
fs.mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

await page.goto('http://127.0.0.1:3002/', { waitUntil: 'networkidle' })
await page.evaluate(() => localStorage.setItem('fi2t_lang', 'ar'))
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
const ar = await page.evaluate(() => ({
  dir: document.documentElement.dir,
  lang: document.documentElement.lang,
  hero: document.querySelector('.fi2t-hero__title')?.textContent?.trim()?.slice(0, 120) || '',
  aboutH2: document.querySelector('.fi2t-about h2')?.textContent?.trim() || '',
}))
console.log('AR via storage', ar)
await page.setViewportSize({ width: 1440, height: 900 })
await page.screenshot({ path: path.join(OUT, 'home-ar-1440.png'), fullPage: false })

await page.evaluate(() => localStorage.setItem('fi2t_lang', 'fr'))
await page.reload({ waitUntil: 'networkidle' })
await page.setViewportSize({ width: 1440, height: 900 })
await page.click('.fi2t-header__lang-btn')
await page.waitForTimeout(200)
await page.click('.fi2t-header__lang-option:has-text("العربية"), .fi2t-header__lang-option:has-text("AR")')
await page.waitForTimeout(1000)
const arUi = await page.evaluate(() => ({
  dir: document.documentElement.dir,
  lang: document.documentElement.lang,
  hero: document.querySelector('.fi2t-hero__title')?.textContent?.trim()?.slice(0, 120) || '',
}))
console.log('AR via UI', arUi)
await page.screenshot({ path: path.join(OUT, 'home-ar-ui.png'), fullPage: false })

// Badge overlap with full about in view
await page.evaluate(() => localStorage.setItem('fi2t_lang', 'fr'))
await page.reload({ waitUntil: 'networkidle' })
await page.setViewportSize({ width: 390, height: 900 })
await page.evaluate(() => {
  const media = document.querySelector('.fi2t-about__media')
  media?.scrollIntoView({ block: 'center' })
})
await page.waitForTimeout(400)
const badge = await page.evaluate(() => {
  const b = document.querySelector('.fi2t-about__badge')
  const i = document.querySelector('.fi2t-about__image')
  const rb = b.getBoundingClientRect()
  const ri = i.getBoundingClientRect()
  return {
    overlapPx: Math.round(ri.bottom - rb.top),
    badgeH: Math.round(rb.height),
    imgBottom: Math.round(ri.bottom),
    badgeTop: Math.round(rb.top),
    badgeBottom: Math.round(rb.bottom),
  }
})
console.log('badge metrics', badge)
await page.screenshot({ path: path.join(OUT, 'home-about-badge-390.png'), fullPage: false })

fs.writeFileSync(path.join(OUT, 'ar-badge.json'), JSON.stringify({ ar, arUi, badge }, null, 2))
await browser.close()
