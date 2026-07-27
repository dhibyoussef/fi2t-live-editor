import type { RoomCategory } from '../types/api'
import { accommodationKindOf, type AccommodationDisplayKind } from './accommodationKind'

export type AccommodationSearchType = 'ALL' | 'CHAMBRE' | 'SUITE' | 'APARTMENT'

export const ACCOMMODATION_PARAM = 'accommodation'

export const ACCOMMODATION_FILTERS: { id: AccommodationSearchType; labelKey: string }[] = [
  { id: 'ALL', labelKey: 'booking.accommodationAll' },
  { id: 'CHAMBRE', labelKey: 'booking.accommodationChambre' },
  { id: 'SUITE', labelKey: 'booking.accommodationSuite' },
  { id: 'APARTMENT', labelKey: 'booking.accommodationApartment' },
]

export function parseAccommodationType(value: string | null | undefined): AccommodationSearchType {
  if (value === 'APARTMENT') return 'APARTMENT'
  if (value === 'SUITE') return 'SUITE'
  if (value === 'CHAMBRE') return 'CHAMBRE'
  // Ancien paramètre ?accommodation=ROOM (chambres + suites fusionnés)
  if (value === 'ROOM') return 'ALL'
  return 'ALL'
}

export function accommodationIndexFromType(type: AccommodationSearchType): number {
  const i = ACCOMMODATION_FILTERS.findIndex(f => f.id === type)
  return i === -1 ? 0 : i
}

export function accommodationTypeFromIndex(index: number): AccommodationSearchType {
  return ACCOMMODATION_FILTERS[index]?.id ?? 'ALL'
}

export function accommodationFicheBase(type: 'ROOM' | 'APARTMENT'): string {
  return type === 'APARTMENT' ? '/appartements' : '/chambres'
}

export function categoryAccommodationType(
  accommodationType?: 'ROOM' | 'APARTMENT' | null,
): 'ROOM' | 'APARTMENT' {
  return accommodationType === 'APARTMENT' ? 'APARTMENT' : 'ROOM'
}

function searchTypeToKind(filter: AccommodationSearchType): AccommodationDisplayKind | null {
  if (filter === 'CHAMBRE') return 'chambre'
  if (filter === 'SUITE') return 'suite'
  if (filter === 'APARTMENT') return 'apartment'
  return null
}

export function filterCategoriesByAccommodation(
  categories: RoomCategory[],
  filter: AccommodationSearchType,
): RoomCategory[] {
  const kind = searchTypeToKind(filter)
  if (!kind) return categories
  return categories.filter(c => accommodationKindOf(c) === kind)
}
