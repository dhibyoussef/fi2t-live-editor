import { useCallback, useMemo } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import SiteHeader from '../components/layout/SiteHeader'
import { useRestaurants } from '../hooks/useRestaurants'
import {
  BAR_SECTION,
  adjacentSlug,
  buildRestaurantDetail,
  chefImage,
  heroImage,
  orderedRestaurantSlugs,
  resolveRestaurantSlug,
} from '../lib/restaurantDetail'
import { restaurantSlug } from '../lib/restaurant'
import '../styles/restaurant-page.css'

export default function RestaurantPage() {
  const { slug: slugParam } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { restaurants, loading } = useRestaurants()

  const slugs = useMemo(() => orderedRestaurantSlugs(restaurants), [restaurants])

  const resolvedSlug = useMemo(() => {
    if (slugParam) {
      const fromApi = resolveRestaurantSlug(restaurants, slugParam)
      if (fromApi) return fromApi
      if (resolveRestaurantSlug([], slugParam)) return slugParam.toLowerCase()
    }
    return slugs[0] ?? null
  }, [restaurants, slugParam, slugs])

  const outlet = useMemo(
    () => restaurants.find(o => restaurantSlug(o.name) === resolvedSlug) ?? null,
    [restaurants, resolvedSlug],
  )

  const detail = useMemo(
    () => buildRestaurantDetail(outlet, resolvedSlug ?? 'la-stalla'),
    [outlet, resolvedSlug],
  )

  const goTo = useCallback(
    (direction: 'prev' | 'next') => {
      if (!resolvedSlug || !slugs.length) return
      const next = adjacentSlug(slugs, resolvedSlug, direction)
      navigate(`/restaurants/${next}`)
    },
    [navigate, resolvedSlug, slugs],
  )

  if (!loading && !resolvedSlug) {
    return <Navigate to="/restaurants" replace />
  }

  if (loading && !resolvedSlug) {
    return (
      <>
        <SiteHeader variant="ivory" />
        <p className="resto-page-loading">Chargement...</p>
      </>
    )
  }

  if (!loading && slugParam && resolvedSlug !== slugParam.toLowerCase()) {
    return <Navigate to={`/restaurants/${resolvedSlug}`} replace />
  }

  const canSwitch = slugs.length > 1

  return (
    <>
      <SiteHeader variant="ivory" />

      <section className="resto-page-hero" aria-label={detail.name}>
        <img
          src={heroImage(detail.heroImage)}
          alt=""
          className="resto-page-hero__bg"
          loading="eager"
        />

        <div className="resto-page-hero__stage">
          <div className="container resto-page-hero__inner">
            <div className="resto-page-hero__panel-wrap">
              {canSwitch && (
                <div className="resto-page-hero__switch" aria-label="Changer de restaurant">
                  <button
                    type="button"
                    className="resto-page-hero__switch-btn"
                    onClick={() => goTo('prev')}
                    aria-label="Restaurant précédent"
                  >
                    <i className="fa-solid fa-chevron-left" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className="resto-page-hero__switch-btn"
                    onClick={() => goTo('next')}
                    aria-label="Restaurant suivant"
                  >
                    <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              )}

              <div className="resto-page-hero__panel">
              <div className="resto-page-hero__brand">
                <img
                  src="/logo-figma.svg"
                  alt=""
                  className="resto-page-hero__logo"
                  aria-hidden="true"
                />
                <div className="resto-page-hero__titles">
                  <p className="resto-page-hero__label">Restaurant</p>
                  <h1 className="resto-page-hero__name">{detail.name}</h1>
                </div>
              </div>

              <p className="resto-page-hero__desc">{detail.longDescription}</p>

              <div className="resto-page-hero__actions">
                <Link
                  to={`/reservation?restaurant=${detail.slug}`}
                  className="resto-page-hero__reserve"
                >
                  Réserver une table
                </Link>
                <Link
                  to={`/reservation?restaurant=${detail.slug}`}
                  className="resto-page-hero__book"
                  aria-label="Voir le menu"
                >
                  <i className="fa-solid fa-book-open" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {!loading && detail.chef && (
      <section className="resto-page-chef" aria-labelledby="resto-chef-title">
        <div className="container resto-page-chef__inner">
          <div className="resto-page-chef__media">
            <img
              src={chefImage(detail.chef.image)}
              alt={detail.chef.name}
              loading="lazy"
            />
          </div>

          <div className="resto-page-chef__content">
            <h2 id="resto-chef-title" className="resto-page-chef__title">
              Notre chef
            </h2>
            {detail.chef.slogan && (
              <p className="resto-page-chef__slogan">{detail.chef.slogan}</p>
            )}
            {detail.chef.description && (
              <p className="resto-page-chef__desc">{detail.chef.description}</p>
            )}
            <p className="resto-page-chef__name">{detail.chef.name}</p>
          </div>
        </div>
      </section>
      )}

      <section className="resto-page-bar" aria-labelledby="resto-bar-title">
        <div className="container resto-page-bar__inner">
          <div className="resto-page-bar__content">
            <div className="resto-page-bar__brand">
              <img
                src="/logo-figma.svg"
                alt=""
                className="resto-page-bar__logo"
                aria-hidden="true"
              />
              <div className="resto-page-bar__titles">
                <p className="resto-page-bar__eyebrow">{BAR_SECTION.eyebrow}</p>
                <h2 id="resto-bar-title" className="resto-page-bar__title">
                  {BAR_SECTION.title}
                </h2>
              </div>
            </div>

            <p className="resto-page-bar__desc">{BAR_SECTION.description}</p>

            <div className="resto-page-bar__actions">
              <Link to="/restaurants" className="resto-page-bar__cta resto-page-bar__cta--navy">
                Découvrez nos boissons
              </Link>
              <button type="button" className="resto-page-bar__cta resto-page-bar__cta--book" aria-label="Carte des boissons">
                <i className="fa-solid fa-book-open" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="resto-page-bar__media">
            <img src={BAR_SECTION.image} alt="Le bar Golden Carthage" loading="lazy" />
          </div>
        </div>
      </section>
    </>
  )
}
