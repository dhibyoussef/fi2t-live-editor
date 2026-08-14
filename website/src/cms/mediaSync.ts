/**
 * Keep layout media identical across FR/EN/AR.
 * Text (title/desc/…) stays per-locale; images/icons/slugs/order follow FR.
 */

export const MEDIA_KEYS = new Set([
  'img',
  'icon',
  'image',
  'bg',
  'photo',
  'logo',
  'map_image',
  'src',
  'banner',
  'hero_image',
])

const MEDIA_PATH =
  /^(\/images\/|\/storage\/|\/logo|https?:\/\/|data:image\/)/i

export function isMediaPath(value: unknown): boolean {
  return typeof value === 'string' && MEDIA_PATH.test(value.trim())
}

export function isMediaKey(key: string): boolean {
  if (MEDIA_KEYS.has(key)) return true
  return /(_img|_image|_icon|_bg|_photo|_logo)$/i.test(key) || key.endsWith('_pos')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/**
 * Copy media/layout fields from `from` onto `onto` (keep onto text).
 */
export function applyMediaFrom(
  onto: Record<string, unknown>,
  from: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...onto }
  for (const [key, frVal] of Object.entries(from)) {
    if (isMediaKey(key) || isMediaPath(frVal)) {
      if (frVal !== undefined && frVal !== null && frVal !== '') {
        out[key] = frVal
      }
      continue
    }
    if (Array.isArray(frVal) && Array.isArray(out[key])) {
      out[key] = mergeJsonListMedia(out[key] as unknown[], frVal)
      continue
    }
    if (isPlainObject(frVal) && isPlainObject(out[key])) {
      out[key] = applyMediaFrom(out[key] as Record<string, unknown>, frVal)
    }
  }
  return out
}

/**
 * Merge list JSON: same length/order as FR when possible; media from FR; text from locale.
 */
export function mergeJsonListMedia(localeList: unknown[], frList: unknown[]): unknown[] {
  if (!frList.length) return localeList
  if (!localeList.length) return frList

  // String/number lists are copy, not media — keep the active locale (EN/AR).
  const frAllPrimitive = frList.every((item) => !isPlainObject(item))
  const localeAllPrimitive = localeList.every((item) => !isPlainObject(item))
  if (frAllPrimitive || localeAllPrimitive) {
    return localeList
  }

  const bySlug = new Map<string, Record<string, unknown>>()
  for (const item of localeList) {
    if (!isPlainObject(item)) continue
    const slug = typeof item.slug === 'string' ? item.slug : ''
    if (slug) bySlug.set(slug, item)
  }

  return frList.map((frItem, index) => {
    if (!isPlainObject(frItem)) return frItem
    const slug = typeof frItem.slug === 'string' ? frItem.slug : ''
    const localeItem =
      (slug && bySlug.get(slug))
      || (isPlainObject(localeList[index]) ? (localeList[index] as Record<string, unknown>) : null)

    if (!localeItem) return frItem
    return applyMediaFrom(localeItem, frItem)
  })
}

export function mergeJsonMediaString(localeRaw: string, frRaw: string): string {
  if (!frRaw?.trim()) return localeRaw
  if (!localeRaw?.trim()) return frRaw
  try {
    const localeParsed = JSON.parse(localeRaw)
    const frParsed = JSON.parse(frRaw)
    if (Array.isArray(localeParsed) && Array.isArray(frParsed)) {
      return JSON.stringify(mergeJsonListMedia(localeParsed, frParsed))
    }
    if (isPlainObject(localeParsed) && isPlainObject(frParsed)) {
      return JSON.stringify(applyMediaFrom(localeParsed, frParsed))
    }
  } catch {
    /* keep locale */
  }
  return localeRaw
}

/** Top-level block keys that are structural media (never translate). */
export function isSharedMediaBlockKey(compoundKey: string): boolean {
  const key = compoundKey.includes('.') ? compoundKey.split('.').pop()! : compoundKey
  return (
    key === 'image'
    || key === 'bg'
    || key === 'logo'
    || key === 'banner'
    || key === 'map_image'
    || key === 'badge_pos'
    || key.endsWith('_pos')
    || key.endsWith('_alt')
    || key.endsWith('_image')
  )
}

/**
 * After locale merge, force FR media into every JSON list / media path block.
 */
export function applyFrMediaToBlocks(
  localeBlocks: Record<string, string>,
  frBlocks: Record<string, string>,
): Record<string, string> {
  const out = { ...localeBlocks }
  for (const [key, frValue] of Object.entries(frBlocks)) {
    if (!frValue?.trim()) continue
    const localeValue = out[key]
    if (isSharedMediaBlockKey(key) && isMediaPath(frValue)) {
      out[key] = frValue
      continue
    }
    if (
      localeValue
      && (localeValue.trim().startsWith('[') || localeValue.trim().startsWith('{'))
      && (frValue.trim().startsWith('[') || frValue.trim().startsWith('{'))
    ) {
      out[key] = mergeJsonMediaString(localeValue, frValue)
    }
  }
  return out
}

/**
 * Patch media fields on one list item by slug (or index), return new JSON string.
 */
export function patchListItemMedia(
  raw: string,
  match: { slug?: string; index?: number },
  mediaPatch: Record<string, string>,
): string {
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return raw
    const next = parsed.map((item, i) => {
      if (!item || typeof item !== 'object') return item
      const hit =
        (match.slug && (item as { slug?: string }).slug === match.slug)
        || (match.index !== undefined && i === match.index)
      if (!hit) return item
      return { ...item, ...mediaPatch }
    })
    return JSON.stringify(next)
  } catch {
    return raw
  }
}
