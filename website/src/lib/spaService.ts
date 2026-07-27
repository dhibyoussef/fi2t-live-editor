import type { SpaService } from '../types/api'

const CATEGORY_LABELS: Record<string, string> = {
  MASSAGE: 'Massages',
  FACIAL: 'Soins du visage',
  BODY_WRAP: 'Enveloppements',
  HAMMAM: 'Hammam',
  HYDROTHERAPY: 'Hydrothérapie',
  MANICURE: 'Manucure',
  PEDICURE: 'Pédicure',
  PACKAGE: 'Forfaits',
}

const CATEGORY_ORDER = [
  'PACKAGE',
  'MASSAGE',
  'HAMMAM',
  'FACIAL',
  'BODY_WRAP',
  'HYDROTHERAPY',
  'MANICURE',
  'PEDICURE',
]

export function spaCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category
}

export function formatSpaPrice(price: string | number): string {
  const n = typeof price === 'string' ? parseFloat(price) : price
  if (Number.isNaN(n)) return ''
  return `${n.toLocaleString('fr-TN', { minimumFractionDigits: 0, maximumFractionDigits: 3 })} TND`
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

export function groupSpaServices(services: SpaService[]): { category: string; label: string; items: SpaService[] }[] {
  const map = new Map<string, SpaService[]>()
  for (const s of services) {
    const list = map.get(s.category) ?? []
    list.push(s)
    map.set(s.category, list)
  }
  return CATEGORY_ORDER
    .filter(cat => map.has(cat))
    .map(cat => ({
      category: cat,
      label: spaCategoryLabel(cat),
      items: map.get(cat)!,
    }))
}
