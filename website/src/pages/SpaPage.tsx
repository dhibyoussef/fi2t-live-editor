import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageHero from '../components/layout/PageHero'
import SpaServiceCard from '../components/spa/SpaServiceCard'
import { useSpaServices } from '../hooks/useSpaServices'
import { groupSpaServices, spaCategoryLabel } from '../lib/spaService'
import { IMG } from '../lib/localImages'
import '../styles/spa-page.css'

export default function SpaPage() {
  const { t } = useTranslation()
  const { services, loading, error } = useSpaServices()
  const [filter, setFilter] = useState<string>('ALL')

  const groups = useMemo(() => groupSpaServices(services), [services])

  const categories = useMemo(
    () => ['ALL', ...groups.map(g => g.category)],
    [groups],
  )

  const filtered = useMemo(() => {
    if (filter === 'ALL') return services
    return services.filter(s => s.category === filter)
  }, [services, filter])

  const filteredGroups = useMemo(
    () => (filter === 'ALL' ? groups : groups.filter(g => g.category === filter)),
    [groups, filter],
  )

  return (
    <>
      <PageHero
        eyebrow={t('home.spaEyebrow')}
        title="Spa & Bien-être à La Marsa"
        subtitle="Catalogue des soins géré depuis votre dashboard admin"
        image={IMG.spaHero}
      />
      <section className="section section--navy spa-page">
        <div className="container">
          <div className="spa-page__intro">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>
              <span>ANTONIN SPA</span>
            </div>
            <h2 className="section-title section-title--gold">Nos soins & forfaits</h2>
            <p>
              Tarifs, durées et descriptions synchronisés avec le backoffice
              (Venues → Spa).{' '}
              <a href="/spa/reservation" style={{ color: 'var(--color-gold)', textDecoration: 'underline' }}>
                Réservez votre soin en ligne
              </a>.
            </p>
          </div>

          {!loading && services.length > 0 && (
            <div className="spa-page__filters">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`spa-page__filter${filter === cat ? ' active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat === 'ALL' ? 'Tous' : spaCategoryLabel(cat)}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="spa-page__loading">
              <div className="chambres-spinner" />
            </div>
          ) : error ? (
            <p className="section-desc">Impossible de charger les soins. Vérifiez que l&apos;API est démarrée.</p>
          ) : filtered.length === 0 ? (
            <p className="section-desc">Aucun soin actif pour le moment. Ajoutez-en depuis le dashboard admin.</p>
          ) : (
            filteredGroups.map(group => (
              <div key={group.category} className="spa-page__group">
                {filter === 'ALL' && (
                  <h3 className="spa-page__group-title">{group.label}</h3>
                )}
                <div className="spa-page__grid">
                  {group.items.map(service => (
                    <SpaServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  )
}
