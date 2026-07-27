import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
type Size    = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?:    Size
  loading?: boolean
  icon?:    ReactNode
  iconRight?: ReactNode
  iconOnly?:  boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, iconOnly, children, className = '', ...props }, ref) => {
    const cls = [
      'gc-btn',
      `gc-btn-${variant}`,
      `gc-btn-${size}`,
      iconOnly ? `gc-btn-icon gc-btn-icon-${size}` : '',
      className,
    ].filter(Boolean).join(' ')

    return (
      <button
        ref={ref}
        className={cls}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading
          ? <Loader2 size={13} style={{ animation: 'spinGold 0.7s linear infinite' }} />
          : icon
            ? <span style={{ display: 'flex', flexShrink: 0 }}>{icon}</span>
            : null
        }
        {children}
        {iconRight && <span style={{ display: 'flex', flexShrink: 0 }}>{iconRight}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
