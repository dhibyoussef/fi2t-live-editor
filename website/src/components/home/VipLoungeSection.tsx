import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import EditableText from '../../cms/EditableText'
import EditableImage from '../../cms/EditableImage'
import { useContent } from '../../cms/ContentProvider'
import { useEditMode } from '../../cms/EditModeProvider'
import { useCarousel } from '../../hooks/useCarousel'
import '../../styles/viplounge.css'

const PAGE = 'home'
const GALLERY_SLUG = 'home-vip-lounge'

const IMAGES = {
  main: '/imgs/w3.jpg',
  top: '/imgs/w2.jpg',
  bottom: '/imgs/w1.jpg',
} as const

type VipSlot = keyof typeof IMAGES

function slotFromLayout(layout: string | null | undefined, index: number): VipSlot | null {
  if (layout === 'main' || layout === 'top' || layout === 'bottom') return layout
  const fromOrder = (['main', 'top', 'bottom'] as const)[index]
  return fromOrder ?? null
}

export default function VipLoungeSection() {
  const { t } = useTranslation()
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const { items: galleryItems } = useCarousel(GALLERY_SLUG)

  const carouselUrls = useMemo(() => {
    const map: Partial<Record<VipSlot, string>> = {}
    galleryItems.forEach((item, i) => {
      const slot = slotFromLayout(item.layout, i)
      if (slot && item.image_url) map[slot] = item.image_url
    })
    return map
  }, [galleryItems])

  const useGallery = !isEditMode && Object.keys(carouselUrls).length > 0

  const imageSrc = (slot: VipSlot, cmsKey: string) => {
    if (useGallery && carouselUrls[slot]) return carouselUrls[slot]!
    return get(cmsKey, IMAGES[slot])
  }

  return (
    <section className="viplounge" aria-label={t('home.vipTitle')} data-cms-section="vip">
      <div className="container viplounge__grid">
        <div className="viplounge__gallery">
          <div className="viplounge__gallery-main">
            {isEditMode ? (
              <EditableImage
                page={PAGE}
                blockKey="vip.image_main"
                className="viplounge__img"
                alt="VIP Lounge — espace principal"
                fallback={IMAGES.main}
                label="VIP — Image principale"
              />
            ) : (
              <img
                src={imageSrc('main', 'vip.image_main')}
                alt="VIP Lounge — espace principal"
                className="viplounge__img"
                loading="lazy"
              />
            )}
          </div>
          <div className="viplounge__gallery-side">
            <div className="viplounge__gallery-side-item">
              {isEditMode ? (
                <EditableImage
                  page={PAGE}
                  blockKey="vip.image_top"
                  className="viplounge__img"
                  alt="VIP Lounge — bar"
                  fallback={IMAGES.top}
                  label="VIP — Image haute"
                />
              ) : (
                <img
                  src={imageSrc('top', 'vip.image_top')}
                  alt="VIP Lounge — bar"
                  className="viplounge__img"
                  loading="lazy"
                />
              )}
            </div>
            <div className="viplounge__gallery-side-item">
              {isEditMode ? (
                <EditableImage
                  page={PAGE}
                  blockKey="vip.image_bottom"
                  className="viplounge__img"
                  alt="VIP Lounge — détail"
                  fallback={IMAGES.bottom}
                  label="VIP — Image basse"
                />
              ) : (
                <img
                  src={imageSrc('bottom', 'vip.image_bottom')}
                  alt="VIP Lounge — détail"
                  className="viplounge__img"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </div>

        <div className="viplounge__content">
          <EditableText
            page={PAGE}
            blockKey="vip.eyebrow"
            as="p"
            className="viplounge__eyebrow"
            fallback={t('home.aboutLabel')}
            label="VIP — Surtitre"
          />
          <EditableText
            page={PAGE}
            blockKey="vip.title"
            as="h2"
            className="viplounge__title"
            multiline
            fallback={t('home.vipTitle')}
            label="VIP — Titre"
          />
          <EditableText
            page={PAGE}
            blockKey="vip.desc"
            as="div"
            className="viplounge__text"
            multiline
            fallback={t('home.vipDesc')}
            label="VIP — Description"
          />
        </div>
      </div>
    </section>
  )
}
