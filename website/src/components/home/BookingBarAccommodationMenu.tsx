import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ACCOMMODATION_FILTERS, type AccommodationSearchType } from '../../lib/accommodationSearch'

const SETTINGS_ICON = '/imgs/settings.svg'

interface Props {
  value: AccommodationSearchType
  onChange: (value: AccommodationSearchType) => void
}

export default function BookingBarAccommodationMenu({ value, onChange }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent) {
        if (event.key === 'Escape') setOpen(false)
        return
      }
      if (rootRef.current?.contains(event.target as Node)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', close)
    }
  }, [open])

  const select = (type: AccommodationSearchType) => {
    onChange(type)
    setOpen(false)
  }

  return (
    <div
      ref={rootRef}
      className={`bookingbar__settings-wrap${open ? ' is-open' : ''}${value !== 'ALL' ? ' is-filtered' : ''}`}
    >
      <button
        type="button"
        className="bookingbar__settings"
        aria-label={t('booking.filters')}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen(o => !o)}
      >
        <img src={SETTINGS_ICON} alt="" aria-hidden="true" />
      </button>

      {open && (
        <ul className="bookingbar__settings-menu" role="listbox" aria-label={t('booking.filters')}>
          {ACCOMMODATION_FILTERS.map(option => (
            <li key={option.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={value === option.id}
                className={`bookingbar__settings-option${value === option.id ? ' is-selected' : ''}`}
                onClick={() => select(option.id)}
              >
                {t(option.labelKey)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
