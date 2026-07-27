export const ROOM_TYPE_LABELS: Record<string, string> = {
  SINGLE: 'Simple',
  DOUBLE: 'Double',
  TWIN: 'Lits jumeaux',
  TRIPLE: 'Triple',
  QUAD: 'Quadruple',
  SUITE: 'Suite',
}

export const ROOM_STATUS_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Occupée',
  MAINTENANCE: 'Maintenance',
  OUT_OF_ORDER: 'Hors service',
}

export const ROOM_CATEGORY_ENUM_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  SUPERIOR: 'Supérieure',
  DELUXE: 'Deluxe',
  SUITE_JUNIOR: 'Suite Junior',
  SUITE: 'Suite',
  PRESIDENTIAL: 'Présidentielle',
}

export const ACCOMMODATION_TYPE_LABELS: Record<string, string> = {
  ROOM: 'Chambre / Suite',
  APARTMENT: 'Appartement',
}

export const SUITE_CLASSIFICATIONS = new Set(['SUITE_JUNIOR', 'SUITE', 'PRESIDENTIAL'])

export type AccommodationKind = 'ROOM' | 'APARTMENT'

export function enumVal(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'object' && v !== null && 'value' in v) return String((v as { value?: string }).value ?? '')
  return String(v)
}

export function accommodationTypeOf(c: { accommodation_type?: unknown }): AccommodationKind {
  const v = c.accommodation_type
  if (v == null) return 'ROOM'
  if (typeof v === 'object' && v !== null && 'value' in v) return ((v as { value?: string }).value as AccommodationKind) || 'ROOM'
  return (v as AccommodationKind) || 'ROOM'
}

export function isApartmentType(c: { accommodation_type?: unknown }): boolean {
  return accommodationTypeOf(c) === 'APARTMENT'
}

export function isSuiteType(c: { category?: unknown; room_count?: number; suite_count?: number; accommodation_type?: unknown }): boolean {
  if (accommodationTypeOf(c) !== 'ROOM') return false
  const cat = enumVal(c.category)
  if (SUITE_CLASSIFICATIONS.has(cat)) return true
  return (c.suite_count ?? 0) > 0 && (c.room_count ?? 0) === 0
}

export function isChambreType(c: { category?: unknown; room_count?: number; suite_count?: number; accommodation_type?: unknown }): boolean {
  if (accommodationTypeOf(c) !== 'ROOM') return false
  if (isSuiteType(c) && (c.room_count ?? 0) === 0) return false
  return (c.room_count ?? 0) > 0 || !SUITE_CLASSIFICATIONS.has(enumVal(c.category))
}

export type AccommodationDisplayKind = 'chambre' | 'suite' | 'apartment'

export function accommodationKindOf(c: {
  category?: unknown
  room_count?: number
  suite_count?: number
  accommodation_type?: unknown
}): AccommodationDisplayKind {
  if (isApartmentType(c)) return 'apartment'
  if (isSuiteType(c)) return 'suite'
  return 'chambre'
}

export function filterByAccommodationKind<T extends { category?: unknown; room_count?: number; suite_count?: number; accommodation_type?: unknown }>(
  types: T[],
  kind: AccommodationDisplayKind,
): T[] {
  return types.filter(c => accommodationKindOf(c) === kind)
}

export function sumInventoryUnits(
  types: Array<{ room_count?: number; suite_count?: number; accommodation_type?: unknown; category?: unknown; is_active?: boolean }>,
  kind: AccommodationDisplayKind,
  activeOnly = false,
): number {
  const list = activeOnly ? types.filter(c => c.is_active !== false) : types
  return list.reduce((sum, c) => {
    if (kind === 'apartment') return sum + (c.room_count ?? 0)
    if (kind === 'suite') return sum + (c.suite_count ?? 0)
    return sum + (c.room_count ?? 0)
  }, 0)
}

export function splitAccommodationTypes<T extends { is_active?: boolean }>(types: T[]) {
  const chambres = types.filter(isChambreType)
  const suites = types.filter(isSuiteType)
  const apartments = types.filter(isApartmentType)
  return {
    chambres,
    suites,
    apartments,
    activeChambres: chambres.filter(c => c.is_active !== false),
    activeSuites: suites.filter(c => c.is_active !== false),
    activeApartments: apartments.filter(c => c.is_active !== false),
    chambreUnits: sumInventoryUnits(chambres, 'chambre'),
    suiteUnits: sumInventoryUnits(suites, 'suite'),
    apartmentUnits: sumInventoryUnits(apartments, 'apartment'),
    activeChambreUnits: sumInventoryUnits(chambres, 'chambre', true),
    activeSuiteUnits: sumInventoryUnits(suites, 'suite', true),
    activeApartmentUnits: sumInventoryUnits(apartments, 'apartment', true),
  }
}

export function accommodationInventoryLabel(
  c: { room_count?: number; suite_count?: number; accommodation_type?: unknown },
  kind: 'chambre' | 'suite' | 'apartment',
): string {
  const roomCount = c.room_count ?? 0
  const suiteCount = c.suite_count ?? 0
  if (kind === 'apartment') {
    return roomCount > 0 ? `${roomCount} appartement${roomCount > 1 ? 's' : ''}` : '—'
  }
  if (kind === 'suite') {
    return suiteCount > 0 ? `${suiteCount} suite${suiteCount > 1 ? 's' : ''}` : '—'
  }
  return roomCount > 0 ? `${roomCount} chambre${roomCount > 1 ? 's' : ''}` : '—'
}

export const AMENITY_CATEGORY_LABELS: Record<string, string> = {
  BATHROOM: 'Salle de bain',
  BED: 'Literie',
  TECH: 'Technologie',
  CLIMATE: 'Climatisation',
  VIEW: 'Vue',
  KITCHEN: 'Cuisine',
  ACCESSIBILITY: 'Accessibilité',
}
