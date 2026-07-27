import { ReactNode, CSSProperties } from 'react'

type CardVariant = 'default' | 'gold' | 'dark' | 'sand'
type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps {
  children:   ReactNode
  className?: string
  style?:     CSSProperties
  padding?:   CardPadding
  variant?:   CardVariant
  hover?:     boolean
}

export function Card({ children, className = '', style, padding = 'md', variant = 'default', hover }: CardProps) {
  const cls = [
    'gc-card',
    variant !== 'default' ? `gc-card-${variant}` : '',
    padding !== 'md'      ? `gc-card-${padding}`  : '',
    hover                 ? 'gc-card-hover'        : '',
    className,
  ].filter(Boolean).join(' ')

  return <div className={cls} style={style}>{children}</div>
}

interface CardHeaderProps {
  children?: ReactNode
  className?: string
  style?: CSSProperties
  title?: string
  subtitle?: string
  action?: ReactNode
  icon?: ReactNode
}

export function CardHeader({ children, className = '', style, title, subtitle, action, icon }: CardHeaderProps) {
  if (children) {
    return (
      <div className={`gc-card-header ${className}`} style={style}>
        {children}
      </div>
    )
  }
  return (
    <div className={`gc-card-header ${className}`} style={style}>
      <div className="gc-card-header-left">
        {icon && <div className="gc-card-icon">{icon}</div>}
        <div>
          {title    && <p className="gc-card-title">{title}</p>}
          {subtitle && <p className="gc-card-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

export function CardContent({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return <div className={className} style={style}>{children}</div>
}

export default Card
