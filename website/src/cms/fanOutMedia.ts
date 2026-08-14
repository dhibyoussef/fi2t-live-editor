import api from '../api/client'
import { isMediaKey, patchListItemMedia } from './mediaSync'
import { invalidateCache } from '../lib/dataCache'

const LOCALES = ['fr', 'en', 'ar'] as const

function compoundKey(section: string, key: string) {
  return `${section}.${key}`
}

/**
 * After an image/icon change inside a JSON list, copy only those media fields
 * into FR/EN/AR so layout stays identical while text stays translated.
 */
export async function fanOutListItemMedia(opts: {
  page: string
  section: string
  key: string
  match: { slug?: string; index?: number }
  mediaPatch: Record<string, string>
  /** Full JSON for the locale the editor is currently on (already patched). */
  currentLocale: string
  currentValue: string
  label?: string
}): Promise<void> {
  const {
    page,
    section,
    key,
    match,
    mediaPatch,
    currentLocale,
    currentValue,
    label,
  } = opts

  const blocks: Array<{
    page: string
    section: string
    key: string
    locale: string
    type: 'json'
    value: string
    label?: string
  }> = []

  for (const locale of LOCALES) {
    let raw = currentValue
    if (locale !== currentLocale) {
      try {
        const { data } = await api.get(`/content/${page}`, { params: { locale } })
        const blockMap = (data.blocks || {}) as Record<string, string>
        raw = blockMap[compoundKey(section, key)] || blockMap[key] || '[]'
      } catch {
        raw = '[]'
      }
    }
    blocks.push({
      page,
      section,
      key,
      locale,
      type: 'json',
      value: patchListItemMedia(raw, match, mediaPatch),
      label,
    })
  }

  await api.post('/admin/content/bulk', {
    blocks,
    source_locale: blocks[0]?.locale,
    translate: false,
  })
  for (const locale of LOCALES) {
    invalidateCache(`content:${page}:${locale}`)
  }
}

export function mediaFieldsFromItem(
  item: Record<string, unknown>,
  fieldKeys?: string[],
): Record<string, string> {
  const out: Record<string, string> = {}
  const keys = fieldKeys?.length
    ? fieldKeys
    : Object.keys(item).filter((k) => isMediaKey(k))
  for (const k of keys) {
    const v = item[k]
    if (typeof v === 'string' && v.trim()) out[k] = v
  }
  return out
}
