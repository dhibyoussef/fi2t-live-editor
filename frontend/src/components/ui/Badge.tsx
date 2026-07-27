import { ReactNode } from 'react'

type BadgeVariant = 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'sand'
type BadgeSize    = 'xs' | 'sm' | 'md'

const STATUS_MAP: Record<string, BadgeVariant> = {
  confirmed:   'success',
  pending:     'warning',
  cancelled:   'danger',
  completed:   'info',
  checked_in:  'gold',
  checked_out: 'neutral',
  no_show:     'danger',
  available:   'success',
  occupied:    'gold',
  maintenance: 'warning',
  cleaning:    'info',
  paid:        'success',
  unpaid:      'danger',
  partial:     'warning',
  refunded:    'neutral',
  scheduled:   'info',
  active:      'success',
  inactive:    'neutral',
  true:        'success',
  false:       'neutral',
  super_admin: 'gold',
  admin:       'info',
  receptionist:'sand',
}

interface BadgeProps {
  children:  ReactNode
  variant?:  BadgeVariant
  status?:   string
  size?:     BadgeSize
  dot?:      boolean
  className?: string
}

export function Badge({ children, variant, status, size = 'sm', dot, className = '' }: BadgeProps) {
  const resolved = variant ?? (status ? STATUS_MAP[status] ?? 'neutral' : 'neutral')
  const cls = [
    'gc-badge',
    `gc-badge-${resolved}`,
    size !== 'sm' ? `gc-badge-${size}` : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <span className={cls}>
      {dot && <span className="gc-badge-dot" />}
      {children}
    </span>
  )
}

export default Badge
