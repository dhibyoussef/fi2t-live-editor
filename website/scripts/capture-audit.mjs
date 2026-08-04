import { chromium } from 'playwright'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(__dirname, 'audit-out')
fs.mkdirSync(out, { recursive: true })

const pages = [
  { name: 'home', url: 'http://localhost:3002/' },
  { name: 'about', url: 'http://localhost:3002/qui-sommes-nous' },
  { name: 'org', url: 'http://localhost:3002/organisation' },
]

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
})
const page = await context.newPage()

for (const p of pages) {
  console.log('capturing', p.name)
  await page.goto(p.url, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(1800)
  await page.addStyleTag({
    content: '.cms-edit-toolbar, .edit-toolbar, [class*="EditToolbar"] { display:none !important; }',
  })
  const full = path.join(out, `${p.name}-full.png`)
  await page.screenshot({ path: full, fullPage: true })
  const h = await page.evaluate(() => document.documentElement.scrollHeight)
  console.log('saved', p.name, 'height', h)
}

await browser.close()
console.log('done')
