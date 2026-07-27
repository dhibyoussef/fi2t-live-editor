import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SiteHeader from '../components/layout/SiteHeader'
import CountryPicker from '../components/reservation/CountryPicker'
import ReservationModal from '../components/reservation/ReservationModal'
import { useSpaServices } from '../hooks/useSpaServices'
import { useCarousel } from '../hooks/useCarousel'
import { findPhoneCountry } from '../lib/phoneCountries'
import api from '../api/client'
import '../styles/restaurant-reservation.css'
import '../styles/spa-reservation.css'

const SPA_IMAGE = '/imgs/spa.png'
const SPA_RESERVATION_CAROUSEL = 'spa-reservation'

const DEFAULT_EXPERIENCES = [
  'Massage relaxant',
  'Hammam traditionnel',
  'Soin du visage',
  'Rituel corps & esprit',
  'Réflexologie plantaire',
]

const OBJECTIVES = ['Détente', 'Récupération sportive', 'Anti-stress', 'Bien-être général', 'Soin ciblé']
const FITNESS_LEVELS = ['Débutant', 'Intermédiaire', 'Avancé', 'Professionnel']
const THERAPIST_PREFS = ['Sans préférence', 'Femme', 'Homme']
const DURATIONS = ['30 minutes', '60 minutes', '90 minutes', '120 minutes']
const RESIDENT_OPTS = ['Oui', 'Non']

const HOURS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00', '17:30', '18:00',
  '18:30', '19:00', '19:30', '20:00',
]

const NONE_EXTRA = 'Aucune option'

export default function SpaReservationPage() {
  const { t } = useTranslation()
  const { services } = useSpaServices()
  const { items: carouselItems } = useCarousel(SPA_RESERVATION_CAROUSEL)
  const [params] = useSearchParams()

  const experiences = useMemo(() => {
    if (services.length > 0) {
      return services.map(s => ({ id: s.id, name: s.name, duration: s.duration_min }))
    }
    return DEFAULT_EXPERIENCES.map((name, i) => ({ id: undefined as number | undefined, name, duration: 60 + i * 15 }))
  }, [services])

  const initialExperience = useMemo(() => {
    const slug = params.get('experience')?.toLowerCase()
    if (!slug) return ''
    const match = experiences.find(e => e.name.toLowerCase() === slug || e.name.toLowerCase().replace(/\s+/g, '-') === slug)
    return match ? String(match.id ?? match.name) : ''
  }, [params, experiences])

  const [experience, setExperience] = useState(initialExperience)
  const [imageIndex, setImageIndex] = useState(0)
  const [guests, setGuests] = useState(2)
  const [countryIso, setCountryIso] = useState('tn')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedCountry = findPhoneCountry(countryIso)

  const selectedExperience = experiences.find(
    e => String(e.id ?? e.name) === experience,
  )

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const extraOptions = useMemo(
    () => [{ id: '', name: NONE_EXTRA }, ...experiences.filter(e => String(e.id ?? e.name) !== experience)],
    [experiences, experience],
  )

  const galleryImages = useMemo(() => {
    const urls = carouselItems.map(item => item.image_url).filter(Boolean)
    return urls.length > 0 ? urls : [SPA_IMAGE]
  }, [carouselItems])

  const currentImage = galleryImages[imageIndex] ?? galleryImages[0] ?? SPA_IMAGE

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
    const experienceVal = String(fd.get('experience') ?? '').trim()

    if (!fullName || !email || !phone || !date || !time || !experienceVal) {
      setShowSuccess(false)
      setErrorMessage(t('spaReservation.errorRequired'))
      setShowError(true)
      return
    }

    const exp = experiences.find(x => String(x.id ?? x.name) === experienceVal)
    const extraVal = String(fd.get('extra_experience') ?? '').trim()
    const extra = extraOptions.find(x => String(x.id ?? x.name) === extraVal)

    setShowError(false)
    setShowSuccess(false)
    setSubmitting(true)

    try {
      await api.post('/spa-bookings/public', {
        service_id: exp?.id ? Number(exp.id) : null,
        experience_name: exp?.name ?? experienceVal,
        full_name: fullName,
        email,
        phone,
        country_code: selectedCountry.dial,
        appointment_date: date,
        appointment_time: time,
        objective: String(fd.get('objective') ?? '').trim() || null,
        fitness_level: String(fd.get('fitness_level') ?? '').trim() || null,
        therapist_preference: String(fd.get('therapist_preference') ?? '').trim() || null,
        duration: String(fd.get('duration') ?? '').trim() || null,
        persons: guests,
        is_hotel_resident: String(fd.get('is_hotel_resident') ?? '').trim() || null,
        extra_service_id: extra?.id ? Number(extra.id) : null,
        extra_experience_name: extra && extra.name !== NONE_EXTRA ? extra.name : null,
        comments: String(fd.get('comments') ?? '').trim() || null,
      })
      form.reset()
      setGuests(2)
      setCountryIso('tn')
      setExperience('')
      setShowSuccess(true)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
      const errors = axiosErr.response?.data?.errors
      const first = errors ? Object.values(errors).flat().find((m): m is string => typeof m === 'string') : undefined
      setShowSuccess(false)
      setErrorMessage(
        first
          ?? (typeof axiosErr.response?.data?.message === 'string' ? axiosErr.response.data.message : null)
          ?? t('spaReservation.errorGeneric'),
      )
      setShowError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="resto-reservation spa-reservation">
        <div className="container resto-reservation__inner">
          <div className="resto-reservation__visual">
            <div className="resto-reservation__img-wrap">
              <img
                src={currentImage}
                alt="Antonin Spa"
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
                <span className="resto-reservation__eyebrow">{t('spaReservation.eyebrow')}</span>
                <h1 className="resto-reservation__title">{t('spaReservation.title')}</h1>
              </div>
              {selectedExperience && (
                <div className="resto-reservation__picker">
                  <span className="resto-reservation__picker-name">{selectedExperience.name}</span>
                </div>
              )}
            </header>

            <form className="resto-reservation__form" onSubmit={handleSubmit}>
              {/* Row 1 */}
              <div className="resto-reservation__row resto-reservation__row--2">
                <input
                  id="spa-nom"
                  name="nom_complet"
                  type="text"
                  autoComplete="name"
                  className="resto-reservation__input"
                  placeholder={t('spaReservation.placeholderFullName')}
                />
                <div className="resto-reservation__phone">
                  <CountryPicker value={countryIso} onChange={setCountryIso} />
                  <span className="resto-reservation__phone-divider" aria-hidden="true">|</span>
                  <input
                    id="spa-tel"
                    name="telephone"
                    type="tel"
                    autoComplete="tel-national"
                    className="resto-reservation__phone-input"
                    placeholder={t('spaReservation.placeholderPhone')}
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="resto-reservation__row resto-reservation__row--2">
                <input
                  id="spa-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="resto-reservation__input"
                  placeholder={t('spaReservation.placeholderEmail')}
                />
                <select
                  id="spa-experience"
                  name="experience"
                  className="resto-reservation__input resto-reservation__select"
                  value={experience}
                  onChange={e => setExperience(e.target.value)}
                >
                  <option value="">{t('spaReservation.desiredExperience')}</option>
                  {experiences.map(exp => (
                    <option key={String(exp.id ?? exp.name)} value={String(exp.id ?? exp.name)}>
                      {exp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Row 3 */}
              <div className="resto-reservation__row resto-reservation__row--3">
                <div className="resto-reservation__input-icon resto-reservation__input-icon--right">
                  <input
                    id="spa-date"
                    name="date"
                    type="date"
                    min={minDate}
                    className="resto-reservation__input"
                  />
                  <img src="/imgs/calendar 5.svg" alt="" className="resto-reservation__icon" aria-hidden="true" />
                </div>
                <div className="resto-reservation__input-icon resto-reservation__input-icon--right">
                  <select id="spa-heure" name="heure" className="resto-reservation__input resto-reservation__select" defaultValue="">
                    <option value="">{t('spaReservation.time')}</option>
                    {HOURS.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <img src="/imgs/hour.svg" alt="" className="resto-reservation__icon" aria-hidden="true" />
                </div>
                <select id="spa-objective" name="objective" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('spaReservation.objective')}</option>
                  {OBJECTIVES.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Row 4 */}
              <div className="resto-reservation__row resto-reservation__row--3">
                <select id="spa-fitness" name="fitness_level" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('spaReservation.fitnessLevel')}</option>
                  {FITNESS_LEVELS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <select id="spa-therapist" name="therapist_preference" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('spaReservation.therapistPreference')}</option>
                  {THERAPIST_PREFS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <select id="spa-duration" name="duration" className="resto-reservation__input resto-reservation__select" defaultValue="30 minutes">
                  {DURATIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Row 5 */}
              <div className="resto-reservation__row resto-reservation__row--2">
                <div className="resto-reservation__stepper">
                  <span className="resto-reservation__stepper-label">
                    {t('spaReservation.guestsCount', { count: guests })}
                  </span>
                  <div className="resto-reservation__stepper-actions">
                    <button type="button" onClick={decGuests} aria-label={t('spaReservation.decreaseGuests')}>
                      <img src="/imgs/mince.svg" alt="" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={incGuests} aria-label={t('spaReservation.increaseGuests')}>
                      <img src="/imgs/plus.svg" alt="" aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <select id="spa-resident" name="is_hotel_resident" className="resto-reservation__input resto-reservation__select" defaultValue="">
                  <option value="">{t('spaReservation.hotelResident')}</option>
                  {RESIDENT_OPTS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Row 6 */}
              <div className="resto-reservation__row">
                <textarea
                  id="spa-comments"
                  name="comments"
                  rows={3}
                  className="resto-reservation__input resto-reservation__textarea"
                  placeholder={t('spaReservation.comments')}
                />
              </div>

              {/* Row 7 */}
              <div className="resto-reservation__row resto-reservation__row--experience">
                <span className="spa-reservation__add-label">{t('spaReservation.addExperience')}</span>
                <select
                  id="spa-extra"
                  name="extra_experience"
                  className="resto-reservation__input resto-reservation__select"
                  defaultValue=""
                >
                  {extraOptions.map(opt => (
                    <option key={String(opt.id ?? opt.name)} value={String(opt.id ?? opt.name)}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="resto-reservation__submit resto-reservation__submit--spa"
                  disabled={submitting}
                >
                  {submitting ? t('spaReservation.submitting') : t('spaReservation.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ReservationModal
        showSuccess={showSuccess}
        showError={showError}
        errorMessage={errorMessage}
        onClose={() => { setShowSuccess(false); setShowError(false) }}
        successKey="spaReservation.successTitle"
        successMessageKey="spaReservation.successMessage"
      />
    </>
  )
}
