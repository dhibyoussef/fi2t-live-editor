import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import BookingBarAccommodationMenu from './BookingBarAccommodationMenu'
import { ACCOMMODATION_PARAM, parseAccommodationType, type AccommodationSearchType } from '../../lib/accommodationSearch'
import '../../styles/bookingbar.css'

const ICONS = {
  calendar: '/imgs/calendar 5.svg',
  minus: '/imgs/mince.svg',
  plus: '/imgs/plus.svg',
} as const

export interface BookingBarDefaults {
  checkin?: string
  checkout?: string
  adults?: number
  children?: number
  accommodation?: AccommodationSearchType
}

interface Props {
  defaults?: BookingBarDefaults
}

export default function BookingBar({ defaults }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [checkin, setCheckin] = useState(defaults?.checkin ?? '')
  const [checkout, setCheckout] = useState(defaults?.checkout ?? '')
  const [adults, setAdults] = useState(defaults?.adults ?? 2)
  const [children, setChildren] = useState(defaults?.children ?? 0)
  const [accommodation, setAccommodation] = useState<AccommodationSearchType>(
    defaults?.accommodation ?? parseAccommodationType(new URLSearchParams(location.search).get(ACCOMMODATION_PARAM)),
  )
  const [open, setOpen] = useState(true)
  const [collapsible, setCollapsible] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1024px)')
    const sync = () => {
      const mobile = mq.matches
      setCollapsible(mobile)
      setOpen(!mobile)
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  useEffect(() => {
    if (defaults?.checkin !== undefined) setCheckin(defaults.checkin)
    if (defaults?.checkout !== undefined) setCheckout(defaults.checkout)
    if (defaults?.adults !== undefined) setAdults(defaults.adults)
    if (defaults?.children !== undefined) setChildren(defaults.children)
    if (defaults?.accommodation !== undefined) setAccommodation(defaults.accommodation)
  }, [defaults?.checkin, defaults?.checkout, defaults?.adults, defaults?.children, defaults?.accommodation])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (checkin) params.set('checkin', checkin)
    if (checkout) params.set('checkout', checkout)
    params.set('adults', String(adults))
    params.set('children', String(children))
    if (accommodation !== 'ALL') params.set(ACCOMMODATION_PARAM, accommodation)
    const target = `/hebergement-reservation?${params.toString()}`
    navigate(target, { replace: location.pathname === '/hebergement-reservation' })
  }

  const isOpen = collapsible ? open : true

  return (
    <div className={`bookingbar${isOpen ? ' bookingbar--open' : ' bookingbar--closed'}${collapsible ? ' bookingbar--collapsible' : ''}`}>
      {collapsible && (
        <button
          type="button"
          className="bookingbar__toggle"
          aria-expanded={isOpen}
          onClick={() => setOpen(o => !o)}
        >
          <span className="bookingbar__toggle-label">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            {t('booking.toggleLabel')}
          </span>
          <i
            className={`fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'} bookingbar__toggle-icon`}
            aria-hidden="true"
          />
        </button>
      )}

      <div className="bookingbar__panel" aria-hidden={collapsible && !isOpen}>
        <div className="bookingbar__inner">
          <div className="bookingbar__field">
            <label className="bookingbar__label">{t('booking.checkin')}</label>
            <div className="bookingbar__input-wrap">
              <input
                type="date"
                className="bookingbar__input"
                value={checkin}
                onChange={e => setCheckin(e.target.value)}
              />
              <img src={ICONS.calendar} alt="" className="bookingbar__icon" aria-hidden="true" />
            </div>
          </div>

          <div className="bookingbar__sep" />

          <div className="bookingbar__field">
            <label className="bookingbar__label">{t('booking.checkout')}</label>
            <div className="bookingbar__input-wrap">
              <input
                type="date"
                className="bookingbar__input"
                value={checkout}
                onChange={e => setCheckout(e.target.value)}
              />
              <img src={ICONS.calendar} alt="" className="bookingbar__icon" aria-hidden="true" />
            </div>
          </div>

          <div className="bookingbar__sep" />

          <div className="bookingbar__field bookingbar__field--counter">
            <label className="bookingbar__label">{t('booking.adults')}</label>
            <div className="bookingbar__counter">
              <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} aria-label="Decrease adults">
                <img src={ICONS.minus} alt="" aria-hidden="true" />
              </button>
              <span>{adults}</span>
              <button type="button" onClick={() => setAdults(adults + 1)} aria-label="Increase adults">
                <img src={ICONS.plus} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="bookingbar__sep" />

          <div className="bookingbar__field bookingbar__field--counter">
            <label className="bookingbar__label">{t('booking.children')}</label>
            <div className="bookingbar__counter">
              <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} aria-label="Decrease children">
                <img src={ICONS.minus} alt="" aria-hidden="true" />
              </button>
              <span>{children}</span>
              <button type="button" onClick={() => setChildren(children + 1)} aria-label="Increase children">
                <img src={ICONS.plus} alt="" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="bookingbar__actions">
            <BookingBarAccommodationMenu value={accommodation} onChange={setAccommodation} />
            <button type="button" className="bookingbar__search" onClick={handleSearch} aria-label={t('booking.search')}>
              <i className="fa-solid fa-magnifying-glass" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
