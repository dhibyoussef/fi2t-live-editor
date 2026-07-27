export const OUTLET_TYPE_LABELS: Record<string, string> = {
  RESTAURANT: 'Restaurant',
  BAR: 'Bar',
  LOUNGE: 'Lounge',
  TERRACE: 'Terrasse',
  POOL_BAR: 'Bar piscine',
  ROOM_SERVICE: 'Room service',
}

export const MEETING_ROOM_TYPE_LABELS: Record<string, string> = {
  CONFERENCE: 'Salle de conférence',
  BOARDROOM: 'Salle de conseil',
  BANQUET: 'Salle de banquet',
  CEREMONY: 'Salle de cérémonie',
  WORKSHOP: 'Atelier',
  OUTDOOR: 'Espace extérieur',
}

export const MEETING_TYPES = ['CONFERENCE', 'BOARDROOM', 'WORKSHOP'] as const
export const EVENT_TYPES = ['BANQUET', 'CEREMONY', 'OUTDOOR'] as const
