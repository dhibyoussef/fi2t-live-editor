import type { RoomCategory, RoomCategoryAmenity } from '../types/api'

const CATEGORY_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  SUPERIOR: 'Supérieure',
  DELUXE: 'Deluxe',
  SUITE_JUNIOR: 'Suite Junior',
  SUITE: 'Suite',
  PRESIDENTIAL: 'Présidentielle',
}

export function uniqueAmenities(categories: RoomCategory[]): RoomCategoryAmenity[] {
  const seen = new Set<number>()
  const result: RoomCategoryAmenity[] = []
  for (const cat of categories) {
    for (const a of cat.amenities ?? []) {
      if (!seen.has(a.id)) {
        seen.add(a.id)
        result.push(a)
      }
    }
  }
  return result
}

export function surfaceRangeLabel(categories: RoomCategory[]): string | null {
  const surfaces = categories
    .map(c => c.surface_m2)
    .filter((s): s is number => s != null)
  if (surfaces.length === 0) return null
  const min = Math.min(...surfaces)
  const max = Math.max(...surfaces)
  return min === max ? `${min}m² ` : `${min}–${max}m²`
}

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export function categoryCover(cat: RoomCategory, fallback = ''): string {
  const cover = cat.media?.find(m => m.is_cover) ?? cat.media?.[0]
  return cover?.url ?? fallback
}

export function inventoryLabel(roomCount = 0, suiteCount = 0): string {
  const parts: string[] = []
  if (roomCount > 0) parts.push(`${roomCount} chambre${roomCount > 1 ? 's' : ''}`)
  if (suiteCount > 0) parts.push(`${suiteCount} suite${suiteCount > 1 ? 's' : ''}`)
  return parts.join(' · ')
}

export function capacityLabel(maxAdults = 0, maxChildren = 0): string {
  const parts: string[] = []
  if (maxAdults > 0) parts.push(`${maxAdults} adulte${maxAdults > 1 ? 's' : ''}`)
  if (maxChildren > 0) parts.push(`${maxChildren} enfant${maxChildren > 1 ? 's' : ''}`)
  return parts.join(' · ')
}

export function formatPrice(price: string | number | null | undefined): string | null {
  if (price == null || price === '') return null
  const n = typeof price === 'string' ? parseFloat(price) : price
  if (Number.isNaN(n)) return null
  return `${n.toLocaleString('fr-TN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} TND`
}

export function hasRoomDiscount(discountPercent?: number | null): boolean {
  return discountPercent != null && discountPercent > 0
}

/** `price_from` = prix catalogue ; retourne le prix après remise si applicable. */
export function roomSalePrice(
  priceFrom: string | number | null | undefined,
  discountPercent?: number | null,
): number | null {
  const base = Number(priceFrom)
  if (!priceFrom || Number.isNaN(base)) return null
  if (!hasRoomDiscount(discountPercent)) return base
  return base * (1 - Number(discountPercent) / 100)
}
