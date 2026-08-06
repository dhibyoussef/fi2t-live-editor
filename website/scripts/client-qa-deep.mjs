import { chromium } from '../../frontend/node_modules/playwright/index.mjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, '../audit-out/client-qa')
fs.mkdirSync(OUT, { recursive: true })

const issues = []
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage()

await page.goto('http://127.0.0.1:3002/', { waitUntil: 'networkidle', timeout: 45000 })
await page.setViewportSize({ width: 390, height: 800 })
await page.locator('.fi2t-about').first().scrollIntoViewIfNeeded()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(OUT, 'home-about-390.png'), fullPage: false })

const aboutM = await page.evaluate(() => {
  const badge = document.querySelector('.fi2t-about__badge')
  const img = document.querySelector('.fi2t-about__image')
  if (!badge || !img) return { missing: true }
  const rB = badge.getBoundingClientRect()
  const rI = img.getBoundingClientRect()
  return {
    text: badge.innerText,
    br: badge.querySelectorAll('br').length,
    badgeH: Math.round(rB.height),
    badgeW: Math.round(rB.width),
    overlap: rB.top < rI.bottom && rB.bottom > rI.top,
    pos: getComputedStyle(badge).position,
    whiteSpace: getComputedStyle(badge.querySelector('.fi2t-stat-badge') || badge).whiteSpace,
  }
})
console.log('about mobile', aboutM)
if (aboutM.missing) issues.push('about media/badge missing')
else {
  if (!aboutM.overlap) issues.push('mobile about badge not overlapping image')
  if (aboutM.badgeH < 60) issues.push(`mobile about badge too short (${aboutM.badgeH}px)`)
  if (aboutM.br === 0 && /10\+/.test(aboutM.text) && /ANN/i.test(aboutM.text) && !aboutM.text.includes('\n')) {
    issues.push('badge missing line break between 10+ and label')
  }
}

await page.locator('.fi2t-adherer').first().scrollIntoViewIfNeeded().catch(() => {})
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(OUT, 'home-adherer-390.png'), fullPage: false })

// Switch AR via localStorage / i18n if present
await page.goto('http://127.0.0.1:3002/', { waitUntil: 'networkidle' })
await page.evaluate(() => {
  localStorage.setItem('i18nextLng', 'ar')
})
await page.reload({ waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
const ar = await page.evaluate(() => ({
  dir: document.documentElement.dir,
  lang: document.documentElement.lang,
  hero: document.querySelector('.fi2t-hero__title, [class*="hero"] h1')?.textContent?.trim()?.slice(0, 80) || '',
}))
console.log('ar', ar)
await page.setViewportSize({ width: 1440, height: 900 })
await page.screenshot({ path: path.join(OUT, 'home-ar-1440.png'), fullPage: false })
if (ar.dir !== 'rtl') issues.push(`Arabic dir is "${ar.dir}" expected rtl`)

await page.goto('http://127.0.0.1:3002/contact', { waitUntil: 'networkidle' })
await page.setViewportSize({ width: 1440, height: 900 })
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(OUT, 'contact-form-1440.png'), fullPage: false })
const contact = await page.evaluate(() => ({
  inputs: document.querySelectorAll('form input, form textarea, .fi2t-contact input, .fi2t-contact textarea').length,
  submit: !!document.querySelector('button[type=submit], .fi2t-contact__submit'),
}))
console.log('contact', contact)
if (contact.inputs < 3) issues.push('contact form missing fields')

await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'networkidle' })
await page.fill('input[type="email"]', 'admin@fi2t.tn')
await page.fill('input[type="password"]', '123456')
await Promise.all([
  page.waitForURL(/dashboard|website|home|content/i, { timeout: 15000 }).catch(() => null),
  page.click('button[type="submit"]'),
])
await page.waitForTimeout(2000)
await page.screenshot({ path: path.join(OUT, 'admin-after-login.png'), fullPage: false })

const links = await page.evaluate(() =>
  [...document.querySelectorAll('a')].map((a) => ({ href: a.getAttribute('href'), text: a.textContent?.trim()?.slice(0, 40) }))
    .filter((a) => /content|contenu|website|site/i.test(`${a.href} ${a.text}`)),
)
console.log('cms links', links.slice(0, 8))
const cmsHref = links.find((l) => /website-content|contenu/i.test(l.href || ''))?.href || '/website-content'
await page.goto(new URL(cmsHref, 'http://127.0.0.1:3000').toString(), { waitUntil: 'networkidle', timeout: 45000 })
await page.waitForTimeout(2500)
await page.screenshot({ path: path.join(OUT, 'admin-cms.png'), fullPage: false })
const cms = await page.evaluate(() => ({
  hasApercu: /Aperçu|aperçu/i.test(document.body.innerText),
  hasEnregistrer: /Enregistrer/i.test(document.body.innerText),
  url: location.pathname,
}))
console.log('cms', cms)
if (!cms.hasEnregistrer && !cms.hasApercu) issues.push('admin CMS missing Enregistrer/Aperçu')

// API save roundtrip
const login = await (await fetch('http://127.0.0.1:8000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ email: 'admin@fi2t.tn', password: '123456' }),
})).json()
const token = login.token
const badgeValue = "10+\nANNÉES D'ENGAGEMENT"
const bulkRes = await fetch('http://127.0.0.1:8000/api/admin/content/bulk', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({
    blocks: [{ page: 'home', section: 'about', key: 'badge', locale: 'fr', type: 'text', value: badgeValue }],
  }),
})
const bulkText = await bulkRes.text()
console.log('bulk', bulkRes.status, bulkText.slice(0, 160))
if (!bulkRes.ok) issues.push(`bulk save failed ${bulkRes.status}`)
const read = await (await fetch('http://127.0.0.1:8000/api/content/home?locale=fr')).json()
const badge = read.blocks?.['about.badge']
console.log('badge after save', JSON.stringify(badge))
if (!badge?.includes('10+')) issues.push('about.badge missing after save')

// Horizontal overflow scan key pages
for (const [name, url] of [
  ['org', 'http://127.0.0.1:3002/organisation'],
  ['actu', 'http://127.0.0.1:3002/actualites'],
  ['agences', 'http://127.0.0.1:3002/agences-de-voyages'],
]) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })
  for (const w of [390, 768, 1440]) {
    await page.setViewportSize({ width: w, height: 800 })
    await page.waitForTimeout(350)
    const ox = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2)
    if (ox) issues.push(`${name} horizontal overflow at ${w}px`)
  }
}

fs.writeFileSync(path.join(OUT, 'deep-issues.json'), JSON.stringify({ issues, aboutM, contact, cms, ar }, null, 2))
console.log('\n=== ISSUES (' + issues.length + ') ===')
issues.forEach((i) => console.log(' -', i))
await browser.close()
process.exit(issues.length ? 1 : 0)
