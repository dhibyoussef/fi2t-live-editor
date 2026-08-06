/**
 * Dump all EN/AR page overlays to JSON for DB import.
 * Run from website/: npx tsx scripts/dump-locale-overlays.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { HOME_AR, HOME_EN } from '../src/cms/defaults/locales/home'
import { PAGE_AR, PAGE_EN } from '../src/cms/defaults/locales/pages'
import { GROUPEMENT_AR, GROUPEMENT_EN } from '../src/cms/defaults/locales/groupements'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../../backend/scripts/data')
mkdirSync(outDir, { recursive: true })

const payload = {
  en: { home: HOME_EN, ...PAGE_EN, ...GROUPEMENT_EN },
  ar: { home: HOME_AR, ...PAGE_AR, ...GROUPEMENT_AR },
}

const out = join(outDir, 'frontend-locale-overlays.json')
writeFileSync(out, JSON.stringify(payload, null, 2), 'utf8')

const arPages = Object.keys(payload.ar)
let keys = 0
for (const p of arPages) keys += Object.keys(payload.ar[p] || {}).length
console.log(`Wrote ${out}`)
console.log(`AR pages: ${arPages.length}, AR keys: ${keys}`)
