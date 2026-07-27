import type { RoomCategory } from '../types/api'

export type AccommodationDisplayKind = 'chambre' | 'suite' | 'apartment'

const SUITE_CLASSIFICATIONS = new Set(['SUITE_JUNIOR', 'SUITE', 'PRESIDENTIAL'])

export function enumVal(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'object' && v !== null && 'value' in v) return String((v as { value?: string }).value ?? '')
  return String(v)
}

export function accommodationTypeOf(c: Pick<RoomCategory, 'accommodation_type'>): 'ROOM' | 'APARTMENT' {
  return c.accommodation_type === 'APARTMENT' ? 'APARTMENT' : 'ROOM'
}

export function isApartmentType(c: Pick<RoomCategory, 'accommodation_type'>): boolean {
  return accommodationTypeOf(c) === 'APARTMENT'
}

export function isSuiteType(c: Pick<RoomCategory, 'category' | 'room_count' | 'suite_count' | 'accommodation_type'>): boolean {
  if (accommodationTypeOf(c) !== 'ROOM') return false
  const cat = enumVal(c.category)
  if (SUITE_CLASSIFICATIONS.has(cat)) return true
  return (c.suite_count ?? 0) > 0 && (c.room_count ?? 0) === 0
}

export function isChambreType(c: Pick<RoomCategory, 'category' | 'room_count' | 'suite_count' | 'accommodation_type'>): boolean {
  if (accommodationTypeOf(c) !== 'ROOM') return false
  if (isSuiteType(c) && (c.room_count ?? 0) === 0) return false
  return (c.room_count ?? 0) > 0 || !SUITE_CLASSIFICATIONS.has(enumVal(c.category))
}

export function accommodationKindOf(c: RoomCategory): AccommodationDisplayKind {
  if (isApartmentType(c)) return 'apartment'
  if (isSuiteType(c)) return 'suite'
  return 'chambre'
}

export function filterByAccommodationKind(
  categories: RoomCategory[],
  kind: AccommodationDisplayKind,
): RoomCategory[] {
  return categories.filter(c => accommodationKindOf(c) === kind)
}
