import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open:      boolean
  onClose:   () => void
  title:     string
  subtitle?: string
  children:  ReactNode
  footer?:   ReactNode
  size?:     'sm' | 'md' | 'lg' | 'xl' | '2xl'
  bodyClassName?: string
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md', bodyClassName }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!open) return null

  return createPortal(
    <div
      className="gc-modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="gc-modal-backdrop" />
      <div className={`gc-modal gc-modal-${size}`}>
        {/* Header */}
        <div className="gc-modal-header">
          <div className="gc-modal-header-text">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button className="gc-modal-close" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className={['gc-modal-body', bodyClassName].filter(Boolean).join(' ')}>{children}</div>

        {/* Footer */}
        {footer && <div className="gc-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}

export default Modal
