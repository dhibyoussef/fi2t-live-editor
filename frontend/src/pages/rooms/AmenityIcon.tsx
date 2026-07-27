import { Sparkles } from 'lucide-react'

export function isImageIcon(icon?: string | null): boolean {
  if (!icon) return false
  return icon.startsWith('http') || icon.startsWith('/') || icon.includes('/storage/')
}

interface Props {
  icon?: string | null
  size?: number
  className?: string
}

export function AmenityIcon({ icon, size = 16, className = '' }: Props) {
  if (!icon) {
    return <Sparkles size={size} className={`text-[#D4A017] ${className}`} />
  }
  if (isImageIcon(icon)) {
    return (
      <img
        src={icon}
        alt=""
        className={`amenity-icon-img ${className}`}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    )
  }
  return <span className={`amenity-icon-emoji ${className}`} style={{ fontSize: size }}>{icon}</span>
}
