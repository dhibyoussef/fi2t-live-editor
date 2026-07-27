import type { MeetingRoom } from '../types/api'

const FALLBACK_HERO =
  '/imgs/cmJScqQXCLHdLVNeTzEUCSHYhGSozaaQou3w97LS.jpg'

export function meetingRoomCover(room: MeetingRoom | null | undefined, fallback = FALLBACK_HERO): string {
  if (!room?.media?.length) return fallback
  const cover = room.media.find(m => m.is_cover) ?? room.media[0]
  return cover?.url ?? fallback
}

export function meetingRoomCapacity(room: MeetingRoom): string {
  const values = [
    room.capacity_theatre,
    room.capacity_classroom,
    room.capacity_banquet,
    room.capacity_cocktail,
    room.capacity_en_u,
    room.capacity_conference,
    room.capacity_cabaret,
    room.capacity_boardroom,
  ].filter((c): c is number => c != null && c > 0)

  if (!values.length) return '—'
  return String(Math.max(...values))
}

export function formatMeetingSurface(surface: number | string | null | undefined): string {
  if (surface == null || surface === '') return '—'
  const n = typeof surface === 'string' ? parseFloat(surface) : surface
  if (Number.isNaN(n)) return '—'
  return `${n % 1 === 0 ? n : n.toFixed(1)}m²`
}

export function formatMeetingHeight(height: number | string | null | undefined): string {
  if (height == null || height === '') return '—'
  const n = typeof height === 'string' ? parseFloat(height) : height
  if (Number.isNaN(n)) return '—'
  return `${n % 1 === 0 ? n : n.toFixed(1)}m`
}

export const SEMINAIRE_HERO_FALLBACK = FALLBACK_HERO

export function seminaireReservationUrl(
  room: MeetingRoom | null | undefined,
  disposition?: MeetingDisposition | string,
): string {
  const params = new URLSearchParams()
  if (room?.id) params.set('room', String(room.id))
  if (room?.name) params.set('salle', room.name)
  if (disposition) {
    const label = typeof disposition === 'string' ? disposition : disposition.label
    params.set('disposition', label)
  }
  const q = params.toString()
  return `/seminaire/reservation${q ? `?${q}` : ''}`
}

export function meetingRoomGalleryImages(room: MeetingRoom | null | undefined, fallback = SEMINAIRE_HERO_FALLBACK): string[] {
  if (!room?.media?.length) return [fallback]
  const urls = room.media.map(m => m.url).filter(Boolean)
  return urls.length > 0 ? urls : [fallback]
}

export type MeetingDispositionKey =
  | 'theatre'
  | 'classroom'
  | 'banquet'
  | 'cocktail'
  | 'en_u'
  | 'conference'
  | 'cabaret'

export interface MeetingDisposition {
  key: MeetingDispositionKey
  label: string
  icon: string
  capacityField?: keyof Pick<
    MeetingRoom,
    | 'capacity_theatre'
    | 'capacity_classroom'
    | 'capacity_banquet'
    | 'capacity_cocktail'
    | 'capacity_en_u'
    | 'capacity_conference'
    | 'capacity_cabaret'
    | 'capacity_boardroom'
  >
  fallbackField?: keyof Pick<MeetingRoom, 'capacity_boardroom'>
}

export const MEETING_DISPOSITIONS: MeetingDisposition[] = [
  { key: 'theatre', label: 'Théâtre', icon: '/imgs/theatre.svg', capacityField: 'capacity_theatre' },
  { key: 'classroom', label: 'Salle de classe', icon: '/imgs/salledeclass.svg', capacityField: 'capacity_classroom' },
  { key: 'banquet', label: 'Banquet', icon: '/imgs/banquett.svg', capacityField: 'capacity_banquet' },
  { key: 'cocktail', label: 'Cocktail', icon: '/imgs/cocktail.svg', capacityField: 'capacity_cocktail' },
  { key: 'en_u', label: 'En U', icon: '/imgs/u.svg', capacityField: 'capacity_en_u', fallbackField: 'capacity_boardroom' },
  { key: 'conference', label: 'Conférence', icon: '/imgs/conference.svg', capacityField: 'capacity_conference', fallbackField: 'capacity_boardroom' },
  { key: 'cabaret', label: 'Cabaret', icon: '/imgs/cabaret.svg', capacityField: 'capacity_cabaret' },
]

function formatCapacityValue(value: number | null | undefined): string | null {
  if (value == null || value <= 0) return null
  return String(value)
}

export function meetingDispositionCapacity(
  room: MeetingRoom | null | undefined,
  disposition: MeetingDisposition,
): string {
  if (!room) return '—'

  if (disposition.capacityField) {
    const value = formatCapacityValue(room[disposition.capacityField])
    if (value) return value
  }

  if (disposition.fallbackField) {
    const fallback = formatCapacityValue(room[disposition.fallbackField])
    if (fallback) return fallback
  }

  return '—'
}
