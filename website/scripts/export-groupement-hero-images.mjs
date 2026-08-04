/**
 * Export the banner each groupement page renders, so the CMS value can be
 * realigned with it.
 *
 *   node scripts/export-groupement-hero-images.mjs
 */

import { build } from 'esbuild'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const outFile = resolve(here, '../../backend/scripts/data/groupement-hero-images.json')
const p = (rel) => resolve(root, rel).replace(/\\/g, '/')

const entry = `
import { GROUPEMENT_SLUGS, getGroupementDefaults } from '${p('src/cms/defaults/groupements-index.ts')}'
const out = {}
for (const slug of GROUPEMENT_SLUGS) {
  const image = getGroupementDefaults(slug)['hero.image']
  if (image) out[slug] = image
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

const dataUrl =
  'data:text/javascript;base64,' + Buffer.from(result.outputFiles[0].text).toString('base64')

let captured = ''
const write = process.stdout.write.bind(process.stdout)
process.stdout.write = (chunk) => {
  captured += typeof chunk === 'string' ? chunk : chunk.toString()
  return true
}
await import(dataUrl)
process.stdout.write = write

const parsed = JSON.parse(captured)
mkdirSync(dirname(outFile), { recursive: true })
writeFileSync(outFile, JSON.stringify(parsed, null, 2) + '\n', 'utf8')

console.log(`wrote ${outFile}`)
for (const [slug, image] of Object.entries(parsed)) {
  console.log(`  ${slug.padEnd(30)} ${image}`)
}
