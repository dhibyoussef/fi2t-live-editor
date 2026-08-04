/**
 * Export the Figma-custom groupement page content (FR/EN/AR) to JSON so the
 * Laravel seeder can push it into `content_blocks`.
 *
 * Each page is exported as one block per band (`atouts.data`, `plan.data`, …)
 * plus `hero.title` / `intro.body`, which is what gives the back-office a real
 * page structure instead of a single opaque document.
 *
 * The website TS defaults stay the single source of truth: re-run this after
 * editing `groupement-custom-pages.ts` or its locale overlays, then re-seed.
 *
 *   node scripts/export-custom-groupement-pages.mjs
 */

import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const outFile = resolve(root, '../backend/database/seeders/data/custom-groupement-pages.json')

const p = (rel) => resolve(root, rel).replace(/\\/g, '/')

const entry = `
import { CUSTOM_GROUPEMENT_PAGES, getCustomGroupementPage } from '${p('src/cms/defaults/groupement-custom-pages.ts')}'
import { getLayoutSchema, pageToBlocks } from '${p('src/cms/defaults/groupement-page-schema.ts')}'
import { GROUPEMENT_PHOTO_HERO_BY_SLUG } from '${p('src/lib/groupement-tree.ts')}'
import { GROUPEMENT_HERO_BY_SLUG } from '${p('src/cms/defaults/groupements-index.ts')}'

const out = {}
for (const slug of Object.keys(CUSTOM_GROUPEMENT_PAGES)) {
  const fr = getCustomGroupementPage(slug, 'fr')
  const frBlocks = pageToBlocks(fr)
  const heroImage =
    GROUPEMENT_PHOTO_HERO_BY_SLUG[slug] ||
    GROUPEMENT_HERO_BY_SLUG[slug]?.split('?')[0] ||
    ''
  const withHero = (blocks) =>
    heroImage ? { 'hero.image': heroImage, ...blocks } : blocks
  const sectionLabel = (section) => {
    const raw = frBlocks[\`\${section.id}.data\`] || frBlocks[\`\${section.id}.title\`]
    if (!raw) return section.label
    if (typeof raw === 'string' && !raw.trim().startsWith('{') && !raw.trim().startsWith('[')) {
      return raw.replace(/\\s+/g, ' ').trim() || section.label
    }
    try {
      const title = JSON.parse(raw)?.title
      return typeof title === 'string' && title.trim()
        ? title.replace(/\\s+/g, ' ').trim()
        : section.label
    } catch {
      return section.label
    }
  }
  out[slug] = {
    layout: fr.layout,
    sections: getLayoutSchema(fr.layout).map((s) => ({ id: s.id, label: sectionLabel(s) })),
    locales: {},
  }
  for (const locale of ['fr', 'en', 'ar']) {
    const page = getCustomGroupementPage(slug, locale)
    if (page) out[slug].locales[locale] = withHero(pageToBlocks(page))
  }
}
process.stdout.write(JSON.stringify(out))
`

const result = await build({
  stdin: { contents: entry, resolveDir: root, loader: 'ts' },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
  logLevel: 'warning',
})

const code = result.outputFiles[0].text
const dataUrl = 'data:text/javascript;base64,' + Buffer.from(code).toString('base64')

let captured = ''
const originalWrite = process.stdout.write.bind(process.stdout)
process.stdout.write = (chunk) => {
  captured += typeof chunk === 'string' ? chunk : chunk.toString()
  return true
}
await import(dataUrl)
process.stdout.write = originalWrite

const parsed = JSON.parse(captured)
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(parsed, null, 2) + '\n', 'utf8')

const slugs = Object.keys(parsed)
console.log(`wrote ${outFile}`)
console.log(`${slugs.length} pages`)
for (const slug of slugs) {
  const entryOut = parsed[slug]
  const blocks = Object.keys(entryOut.locales.fr ?? {}).length
  const locales = Object.keys(entryOut.locales).join('/')
  console.log(
    `  ${slug.padEnd(28)} ${entryOut.layout.padEnd(13)} ${String(entryOut.sections.length).padStart(2)} sections  ${String(blocks).padStart(2)} blocks  [${locales}]`,
  )
}
