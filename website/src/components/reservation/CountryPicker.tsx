import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PHONE_COUNTRIES, countryFlagSrc, findPhoneCountry } from '../../lib/phoneCountries'

export default function CountryPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (iso: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useTranslation()

  const selected = findPhoneCountry(value)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    if (!q) return PHONE_COUNTRIES
    return PHONE_COUNTRIES.filter(
      c => c.label.toLowerCase().includes(q) || c.dial.includes(q),
    )
  }, [search])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  return (
    <div className="phone-picker" ref={ref}>
      <button
        type="button"
        className="phone-picker__trigger"
        onClick={() => { setOpen(o => !o); setSearch('') }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('reservation.country')}
      >
        <img
          src={countryFlagSrc(selected.iso)}
          alt={selected.label}
          className="phone-picker__flag"
          width={24}
          height={18}
        />
        <span className="phone-picker__dial">{selected.dial}</span>
        <span className="phone-picker__chevron" aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="phone-picker__dropdown" role="listbox">
          <div className="phone-picker__search-wrap">
            <input
              ref={inputRef}
              type="text"
              className="phone-picker__search"
              placeholder="Rechercher un pays…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <ul className="phone-picker__list">
            {filtered.map(c => (
              <li key={c.iso}>
                <button
                  type="button"
                  role="option"
                  aria-selected={c.iso === value}
                  className={`phone-picker__option${c.iso === value ? ' phone-picker__option--active' : ''}`}
                  onClick={() => { onChange(c.iso); setOpen(false); setSearch('') }}
                >
                  <img
                    src={countryFlagSrc(c.iso)}
                    alt=""
                    className="phone-picker__flag"
                    width={24}
                    height={18}
                    aria-hidden="true"
                  />
                  <span className="phone-picker__option-label">{c.label}</span>
                  <span className="phone-picker__option-dial">{c.dial}</span>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="phone-picker__empty">Aucun résultat</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
