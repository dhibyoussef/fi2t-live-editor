import { useTranslation } from 'react-i18next'
import PageHero from '../components/layout/PageHero'
import RoomCategoryCard from '../components/rooms/RoomCategoryCard'
import { useRoomCategories } from '../hooks/useRoomCategories'
import { IMG } from '../lib/localImages'
import '../styles/chambres.css'

export default function ChambresPage() {
  const { t } = useTranslation()
  const { categories, loading, error } = useRoomCategories('ROOM')

  const heroImage = categories[0]?.media?.find(m => m.is_cover)?.url
    ?? categories[0]?.media?.[0]?.url
    ?? IMG.landingRoom

  return (
    <>
      <PageHero
        eyebrow={t('home.roomsEyebrow')}
        title={t('home.roomsTitle')}
        subtitle={t('chambres.subtitle')}
        image={heroImage}
      />
      <section className="section section--navy chambres-page">
        <div className="container">
          <div className="chambres-intro">
            <div className="eyebrow" style={{ justifyContent: 'center' }}>
              <span>{t('home.roomsEyebrow')}</span>
            </div>
            <h2 className="section-title section-title--gold">{t('chambres.gridTitle')}</h2>
            <p>{t('chambres.gridDesc')}</p>
          </div>

          {loading ? (
            <div className="chambres-loading">
              <div className="chambres-spinner" />
            </div>
          ) : error ? (
            <p className="section-desc">{t('chambres.error')}</p>
          ) : categories.length === 0 ? (
            <p className="section-desc">{t('chambres.empty')}</p>
          ) : (
            <div className="chambres-grid">
              {categories.map(cat => (
                <RoomCategoryCard key={cat.id} category={cat} variant="grid" />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
