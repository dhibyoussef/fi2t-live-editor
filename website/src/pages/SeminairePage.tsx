import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import SeminaireFicheSection from '../components/seminaire/SeminaireFicheSection'
import PartnersTrustSection from '../components/seminaire/PartnersTrustSection'
import SeminaireServicesSection from '../components/seminaire/SeminaireServicesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditToolbar from '../cms/EditToolbar'
import { useMeetingRooms } from '../hooks/useMeetingRooms'
import {
  formatMeetingHeight,
  formatMeetingSurface,
  meetingRoomCapacity,
  meetingRoomCover,
  seminaireReservationUrl,
  SEMINAIRE_HERO_FALLBACK,
} from '../lib/meetingRoom'
import '../styles/seminaire-landing.css'

const PAGE = 'seminaire'

export default function SeminairePage() {
  const { rooms, loading } = useMeetingRooms()
  const [index, setIndex] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const room = rooms[index] ?? null
  const canSwitch = rooms.length > 1

  useEffect(() => {
    if (rooms.length > 0 && index >= rooms.length) setIndex(0)
  }, [index, rooms.length])

  useEffect(() => {
    if (!pickerOpen) return
    const onClick = (event: MouseEvent) => {
      if (pickerRef.current?.contains(event.target as Node)) return
      setPickerOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPickerOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [pickerOpen])

  useEffect(() => {
    setPickerOpen(false)
  }, [index])

  const heroImage = useMemo(
    () => meetingRoomCover(room, SEMINAIRE_HERO_FALLBACK),
    [room],
  )

  const go = useCallback(
    (direction: 'prev' | 'next') => {
      if (!rooms.length) return
      setIndex(i => {
        const delta = direction === 'next' ? 1 : -1
        return (i + delta + rooms.length) % rooms.length
      })
    },
    [rooms.length],
  )

  return (
    <ContentProvider page={PAGE}>
    <>
      <SiteHeader variant="ivory" />

      <section className="sem-landing-intro" aria-labelledby="sem-landing-title">
        <div className="container sem-landing-intro__inner">
          <EditableText
            page={PAGE}
            blockKey="intro.eyebrow"
            as="p"
            className="sem-landing-intro__eyebrow"
            label="Intro — Surtitre"
          />
          <h1 id="sem-landing-title" className="sem-landing-intro__title">
            <EditableText
              page={PAGE}
              blockKey="intro.title"
              as="span"
              label="Intro — Titre"
            />
          </h1>
          <EditableText
            page={PAGE}
            blockKey="intro.desc"
            as="p"
            className="sem-landing-intro__desc"
            multiline
            label="Intro — Description"
          />
        </div>
      </section>

      <section className="sem-landing-hero" aria-label={room?.name ?? 'Salles de réunion'}>
        <img
          src={heroImage}
          alt=""
          className="sem-landing-hero__bg"
          loading="eager"
        />
        <div className="sem-landing-hero__overlay" aria-hidden="true" />

        <div className="sem-landing-hero__stage">
          {loading && !room ? (
            <p className="sem-landing-hero__loading">Chargement...</p>
          ) : (
            <div className="sem-landing-hero__panel-wrap">
              {room && (
                <div className="sem-hero-toolbar">
                  <a href="#sem-landing-title" className="sem-hero-toolbar__back">
                    Retour
                  </a>

                  <div
                    ref={pickerRef}
                    className={`sem-hero-toolbar__picker${pickerOpen ? ' is-open' : ''}${canSwitch ? ' is-interactive' : ''}`}
                  >
                    <button
                      type="button"
                      className="sem-hero-toolbar__picker-btn"
                      onClick={() => canSwitch && setPickerOpen(open => !open)}
                      aria-expanded={pickerOpen}
                      aria-haspopup="listbox"
                      aria-label="Choisir une salle"
                      disabled={!canSwitch}
                    >
                      <span className="sem-hero-toolbar__picker-label">
                        {room.name}
                      </span>
                      {canSwitch && (
                        <span className="sem-hero-toolbar__picker-chevron" aria-hidden="true">
                          <i className="fa-solid fa-chevron-up" />
                          <i className="fa-solid fa-chevron-down" />
                        </span>
                      )}
                    </button>

                    {pickerOpen && (
                      <ul className="sem-hero-toolbar__dropdown" role="listbox" aria-label="Salles de réunion">
                        {rooms.map((r, i) => (
                          <li key={r.id} role="none">
                            <button
                              type="button"
                              role="option"
                              aria-selected={i === index}
                              className={`sem-hero-toolbar__option${i === index ? ' is-active' : ''}`}
                              onClick={() => setIndex(i)}
                            >
                              {r.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="sem-hero-toolbar__nav">
                    <button
                      type="button"
                      className="sem-hero-toolbar__nav-btn"
                      onClick={() => go('prev')}
                      disabled={!canSwitch}
                      aria-label="Salle précédente"
                    >
                      <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      className="sem-hero-toolbar__nav-btn"
                      onClick={() => go('next')}
                      disabled={!canSwitch}
                      aria-label="Salle suivante"
                    >
                      <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              )}

              <div className="sem-landing-hero__panel">
                <img
                  src="/imgs/bgvictor.svg"
                  alt=""
                  className="sem-landing-hero__panel-bg"
                  aria-hidden="true"
                />

                <div className="sem-landing-hero__brand">
                  <img
                    src="/logo-figma.svg"
                    alt=""
                    className="sem-landing-hero__logo"
                    aria-hidden="true"
                  />
                  <div className="sem-landing-hero__titles">
                    <p className="sem-landing-hero__label">Salle</p>
                    <h2 className="sem-landing-hero__name">{room?.name ?? '—'}</h2>
                  </div>
                </div>

                <dl className="sem-landing-hero__specs">
                  <div className="sem-landing-hero__spec">
                    <img
                      src="/imgs/people.svg"
                      alt=""
                      className="sem-landing-hero__spec-icon"
                      aria-hidden="true"
                    />
                    <div className="sem-landing-hero__spec-body">
                      <dt>Capacité</dt>
                      <dd>{room ? meetingRoomCapacity(room) : '—'}</dd>
                    </div>
                  </div>
                  <div className="sem-landing-hero__spec">
                    <img
                      src="/imgs/superficie.svg"
                      alt=""
                      className="sem-landing-hero__spec-icon"
                      aria-hidden="true"
                    />
                    <div className="sem-landing-hero__spec-body">
                      <dt>Superficie</dt>
                      <dd>{room ? formatMeetingSurface(room.surface_m2) : '—'}</dd>
                    </div>
                  </div>
                  <div className="sem-landing-hero__spec">
                    <img
                      src="/imgs/hauteur.svg"
                      alt=""
                      className="sem-landing-hero__spec-icon"
                      aria-hidden="true"
                    />
                    <div className="sem-landing-hero__spec-body">
                      <dt>Hauteur sous plafond</dt>
                      <dd>{room ? formatMeetingHeight(room.height_m) : '—'}</dd>
                    </div>
                  </div>
                </dl>

                <div className="sem-landing-hero__actions">
                  <Link
                    to={seminaireReservationUrl(room)}
                    className="sem-landing-hero__reserve"
                  >
                    Réserver la salle
                  </Link>
                  <a href="#sem-fiche-technique" className="sem-landing-hero__fiche">
                    Fiche technique
                    <i className="fa-solid fa-chevron-down sem-landing-hero__fiche-icon" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SeminaireFicheSection room={room} />

      <PartnersTrustSection />

      <SeminaireServicesSection />

      <ContentProvider page="home">
        <TestimonialsSection variant="maroon" />
      </ContentProvider>
      <EditToolbar />
    </>
    </ContentProvider>
  )
}
