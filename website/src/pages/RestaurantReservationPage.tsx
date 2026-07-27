import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteHeader from '../components/layout/SiteHeader'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import { useRestaurants } from '../hooks/useRestaurants'
import { outletToCard, restaurantSlug, type RestaurantCard } from '../lib/restaurant'
import { PHONE_COUNTRIES, countryFlagSrc, findPhoneCountry } from '../lib/phoneCountries'
import api from '../api/client'
import { IMG } from '../lib/localImages'
import '../styles/restaurant-reservation.css'

const DEFAULT_RESTAURANTS: RestaurantCard[] = [
  {
    name: 'CALCUTA',
    image: IMG.restaurantCalcutta,
    images: [IMG.restaurantCalcutta, IMG.g7, IMG.g6],
  },
  {
    name: 'EL MONTAZAH',
    image: IMG.restaurantMontazah,
    images: [IMG.restaurantMontazah, IMG.g4, IMG.misc],
  },
  {
    name: 'LA STALLA',
    image: IMG.restaurantStalla,
    images: [IMG.restaurantStalla, IMG.g1, IMG.g2],
  },
]

function getRestaurantImages(restaurant: RestaurantCard): string[] {
  if (Array.isArray(restaurant.images) && restaurant.images.length > 0) {
    return restaurant.images.filter(Boolean)
  }
  if (restaurant.image) return [restaurant.image]
  return []
}

const TABLE_TYPES = ['Intérieur', 'Terrasse', 'Salon privé']
const OCCASIONS = ['Anniversaire', 'Repas d\'affaires', 'Célébration', 'Autre']
const DIETARY = ['Aucune', 'Végétarien', 'Végétalien', 'Sans gluten', 'Halal']

const HOURS = [
  '12:00', '12:30', '13:00', '13:30', '14:00',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
]

// ── Country phone picker ──────────────────────────────────────────────────────
function CountryPicker({
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
      c => c.label.toLowerCase().includes(q) || c.dial.includes(q)
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

interface SpinnerSelectProps {
  id: string
  name: string
  value: string
  options: string[]
  placeholder: string
  onChange: (value: string) => void
}

function SpinnerSelect({
  id,
  name,
  value,
  options,
  placeholder,
  onChange,
}: SpinnerSelectProps) {
  const allOptions = ['', ...options]
  const currentIndex = allOptions.indexOf(value)

  const step = (dir: 1 | -1) => {
    const next = currentIndex < 0
      ? (dir === 1 ? 1 : allOptions.length - 1)
      : (currentIndex + dir + allOptions.length) % allOptions.length
    onChange(allOptions[next])
  }

  const display = value || placeholder

  return (
    <div className="resto-reservation__spinner">
      <span
        id={id}
        className={`resto-reservation__spinner-value${!value ? ' resto-reservation__spinner-value--placeholder' : ''}`}
      >
        {display}
      </span>
      <input type="hidden" name={name} value={value} />
      <div className="resto-reservation__spinner-arrows">
        <button type="button" onClick={() => step(-1)} aria-label="Option précédente">
          <img src="/imgs/toparrow.svg" alt="" aria-hidden="true" />
        </button>
        <button type="button" onClick={() => step(1)} aria-label="Option suivante">
          <img src="/imgs/bottomarrow.svg" alt="" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default function RestaurantReservationPage() {
  return (
    <ContentProvider page="home">
      <RestaurantReservationContent />
    </ContentProvider>
  )
}

function RestaurantReservationContent() {
  const { t } = useTranslation()
  const { getJson } = useContent()
  const { restaurants: fromApi } = useRestaurants()
  const [params] = useSearchParams()
  const cmsCards = getJson<RestaurantCard[]>('restaurants.cards', DEFAULT_RESTAURANTS)
  const restaurants = fromApi.length > 0
    ? fromApi.map(outletToCard)
    : (Array.isArray(cmsCards) && cmsCards.length > 0 ? cmsCards : DEFAULT_RESTAURANTS)

  const initialIndex = useMemo(() => {
    const slug = params.get('restaurant')?.toLowerCase()
    if (!slug) return 0
    const idx = restaurants.findIndex(r =>
      restaurantSlug(r.name) === slug || r.name.toLowerCase() === slug)
    return idx >= 0 ? idx : 0
  }, [params, restaurants])

  const [restaurantIndex, setRestaurantIndex] = useState(initialIndex)
  const [imageIndex, setImageIndex] = useState(0)
  const [guests, setGuests] = useState(2)
  const [occasion, setOccasion] = useState('')
  const [dietary, setDietary] = useState('')
  const [countryIso, setCountryIso] = useState('tn')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedCountry = findPhoneCountry(countryIso)

  const current = restaurants[restaurantIndex] ?? restaurants[0]
  const galleryImages = useMemo(() => getRestaurantImages(current), [current])
  const currentImage = galleryImages[imageIndex] ?? galleryImages[0] ?? current?.image

  useEffect(() => {
    setImageIndex(0)
  }, [restaurantIndex])

  const prevRestaurant = () => {
    setRestaurantIndex(i => (i - 1 + restaurants.length) % restaurants.length)
  }

  const nextRestaurant = () => {
    setRestaurantIndex(i => (i + 1) % restaurants.length)
  }

  const prevImage = () => {
    if (galleryImages.length <= 1) return
    setImageIndex(i => (i - 1 + galleryImages.length) % galleryImages.length)
  }

  const nextImage = () => {
    if (galleryImages.length <= 1) return
    setImageIndex(i => (i + 1) % galleryImages.length)
  }

  const decGuests = () => setGuests(g => Math.max(1, g - 1))
  const incGuests = () => setGuests(g => Math.min(20, g + 1))

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)

    const fullName = String(fd.get('nom_complet') ?? '').trim()
    const email = String(fd.get('email') ?? '').trim()
    const phone = String(fd.get('telephone') ?? '').trim()
    const date = String(fd.get('date') ?? '').trim()
    const time = String(fd.get('heure') ?? '').trim()

    if (!fullName || !email || !phone || !date || !time) {
      setShowSuccess(false)
      setErrorMessage(t('reservation.errorRequired'))
      setShowError(true)
      return
    }

    setShowError(false)
    setShowSuccess(false)
    setSubmitting(true)
    try {
      await api.post('/restaurant-reservations/public', {
        outlet_id: current?.id ?? null,
        restaurant_name: current?.name ?? '',
        full_name: fullName,
        email,
        phone,
        country_code: selectedCountry.dial,
        guests_count: guests,
        reservation_date: date,
        reservation_time: time,
        table_type: String(fd.get('table_type') ?? '').trim() || null,
        occasion: occasion || null,
        dietary_preferences: dietary || null,
        room_number: String(fd.get('chambre') ?? '').trim() || null,
        message: String(fd.get('message') ?? '').trim() || null,
      })
      form.reset()
      setGuests(2)
      setOccasion('')
      setDietary('')
      setCountryIso('tn')
      setShowSuccess(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const errors = axiosErr.response?.data?.errors
      const first = errors && Object.values(errors).flat()[0]
      setShowSuccess(false)
      setErrorMessage(
        typeof first === 'string'
          ? first
          : (axiosErr.response?.data?.message ?? t('reservation.errorGeneric')),
      )
      setShowError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="resto-reservation">
        <div className="container resto-reservation__inner">
          <div className="resto-reservation__visual">
            <div className="resto-reservation__img-wrap">
              <img
                src={currentImage}
                alt={current?.name}
                className="resto-reservation__img"
                width={370}
                height={485}
              />
              <div className="resto-reservation__img-nav">
                <button
                  type="button"
                  className="resto-reservation__img-nav-btn"
                  onClick={prevImage}
                  aria-label={t('reservation.prevPhoto')}
                  disabled={galleryImages.length <= 1}
                >
                  <i className="fa-solid fa-arrow-left" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="resto-reservation__img-nav-btn"
                  onClick={nextImage}
                  aria-label={t('reservation.nextPhoto')}
                  disabled={galleryImages.length <= 1}
                >
                  <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          <div className="resto-reservation__content">
              <header className="resto-reservation__header">
                <div className="resto-reservation__header-text">
                  <span className="resto-reservation__eyebrow">{t('reservation.restaurantLabel')}</span>
                  <h1 className="resto-reservation__title">{t('nav.reservation')}</h1>
                </div>
                <div className="resto-reservation__picker">
                  <span className="resto-reservation__picker-name">{current?.name}</span>
                  <div className="resto-reservation__picker-chevrons">
                    <button
                      type="button"
                      onClick={prevRestaurant}
                      aria-label={t('reservation.prevRestaurant')}
                    >
                      <img src="/imgs/toparrow.svg" alt="" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={nextRestaurant}
                      aria-label={t('reservation.nextRestaurant')}
                    >
                      <img src="/imgs/bottomarrow.svg" alt="" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </header>

              <form className="resto-reservation__form" onSubmit={handleSubmit}>
                <div className="resto-reservation__row resto-reservation__row--2">
                  <input
                    id="res-nom"
                    name="nom_complet"
                    type="text"
                    autoComplete="name"
                    className="resto-reservation__input"
                    placeholder={t('reservation.placeholderFullName')}
                  />
                  <div className="resto-reservation__phone">
                    <CountryPicker value={countryIso} onChange={setCountryIso} />
                    <span className="resto-reservation__phone-divider" aria-hidden="true">|</span>
                    <input
                      id="res-tel"
                      name="telephone"
                      type="tel"
                      autoComplete="tel-national"
                      className="resto-reservation__phone-input"
                      placeholder={t('reservation.placeholderPhone')}
                    />
                    <input type="hidden" name="country" value={selectedCountry.dial} />
                  </div>
                </div>

                <div className="resto-reservation__row resto-reservation__row--2">
                  <input
                    id="res-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="resto-reservation__input"
                    placeholder={t('reservation.placeholderEmail')}
                  />
                  <div className="resto-reservation__stepper">
                    <span className="resto-reservation__stepper-label">
                      {t('reservation.guestsCount', { count: guests })}
                    </span>
                    <div className="resto-reservation__stepper-actions">
                      <button type="button" onClick={decGuests} aria-label={t('reservation.decreaseGuests')}>
                        <img src="/imgs/mince.svg" alt="" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={incGuests} aria-label={t('reservation.increaseGuests')}>
                        <img src="/imgs/plus.svg" alt="" aria-hidden="true" />
                      </button>
                    </div>
                    <input type="hidden" name="personnes" value={guests} />
                  </div>
                </div>

                <div className="resto-reservation__row resto-reservation__row--3">
                  <div className="resto-reservation__input-icon resto-reservation__input-icon--right">
                    <input
                      id="res-date"
                      name="date"
                      type="date"
                      className="resto-reservation__input"
                      placeholder={t('reservation.date')}
                    />
                    <img src="/imgs/calendar 5.svg" alt="" className="resto-reservation__icon" aria-hidden="true" />
                  </div>
                  <div className="resto-reservation__input-icon resto-reservation__input-icon--right">
                    <select id="res-heure" name="heure" className="resto-reservation__input resto-reservation__select" defaultValue="">
                      <option value="">{t('reservation.time')}</option>
                      {HOURS.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <img src="/imgs/hour.svg" alt="" className="resto-reservation__icon" aria-hidden="true" />
                  </div>
                  <select id="res-table" name="table_type" className="resto-reservation__input resto-reservation__select" defaultValue="">
                    <option value="">{t('reservation.tableType')}</option>
                    {TABLE_TYPES.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className="resto-reservation__row resto-reservation__row--3">
                  <SpinnerSelect
                    id="res-occasion"
                    name="occasion"
                    value={occasion}
                    options={OCCASIONS}
                    placeholder={t('reservation.occasion')}
                    onChange={setOccasion}
                  />
                  <SpinnerSelect
                    id="res-diet"
                    name="preferences"
                    value={dietary}
                    options={DIETARY}
                    placeholder={t('reservation.dietary')}
                    onChange={setDietary}
                  />
                  <input
                    id="res-chambre"
                    name="chambre"
                    type="text"
                    className="resto-reservation__input"
                    placeholder={t('reservation.placeholderRoomNumber')}
                  />
                </div>

                <div className="resto-reservation__row resto-reservation__row--footer">
                  <textarea
                    id="res-message"
                    name="message"
                    rows={3}
                    className="resto-reservation__input resto-reservation__textarea"
                    placeholder={t('reservation.message')}
                  />
                  <button type="submit" className="resto-reservation__submit" disabled={submitting}>
                    {submitting ? t('reservation.submitting') : t('reservation.submit')}
                  </button>
                </div>
              </form>
          </div>
        </div>
      </section>

      {(showSuccess || showError) && (
        <div
          className="resto-reservation__modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => { setShowSuccess(false); setShowError(false) }}
        >
          <div
            className={`resto-reservation__modal${showError ? ' resto-reservation__modal--error' : ''}`}
            onClick={ev => ev.stopPropagation()}
          >
            <div
              className={`resto-reservation__modal-icon${showError ? ' resto-reservation__modal-icon--error' : ''}`}
              aria-hidden="true"
            >
              {showError ? '!' : '✓'}
            </div>
            <h2 className="resto-reservation__modal-title">
              {showError ? t('reservation.errorTitle') : t('reservation.successTitle')}
            </h2>
            <p className="resto-reservation__modal-text">
              {showError ? errorMessage : t('reservation.successMessage')}
            </p>
            <button
              type="button"
              className="resto-reservation__modal-btn"
              onClick={() => { setShowSuccess(false); setShowError(false) }}
            >
              {t('reservation.close')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
