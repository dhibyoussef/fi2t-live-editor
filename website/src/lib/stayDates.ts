export function nightsBetween(checkin: string, checkout: string): number {
  if (!checkin || !checkout) return 1
  const start = new Date(`${checkin}T12:00:00`)
  const end = new Date(`${checkout}T12:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 1
  const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(1, diff)
}
