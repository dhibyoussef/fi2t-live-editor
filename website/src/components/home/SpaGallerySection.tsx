import { useMemo, useState } from 'react'
import EditableImage from '../../cms/EditableImage'
import { useContent } from '../../cms/ContentProvider'
import { useEditMode } from '../../cms/EditModeProvider'
import { useCarousel } from '../../hooks/useCarousel'
import '../../styles/spa-gallery.css'

const PAGE = 'home'
const GALLERY_SLUG = 'home-spa-gallery'

const SLOTS = [1, 2, 3, 4, 5, 6, 7] as const
type Slot = (typeof SLOTS)[number]

export type GalleryLayout = 'columns' | 'mosaic'

const LAYOUT_OPTIONS: { id: GalleryLayout; label: string }[] = [
  { id: 'mosaic', label: 'Mosaïque Figma' },
  { id: 'columns', label: '3 + centre + 3' },
]

const SLOT_LABELS: Record<Slot, string> = {
  1: 'Haut gauche (large)',
  2: 'Bas gauche',
  3: 'Bas centre-gauche',
  4: 'Centre vertical',
  5: 'Haut droite',
  6: 'Haut droite 2',
  7: 'Bas droite (large)',
}

const DEFAULT_IMAGES: Record<Slot, string> = {
  1: '/imgs/g1.jpg',
  2: '/imgs/g2.jpg',
  3: '/imgs/g3.jpg',
  4: '/imgs/g4.jpg',
  5: '/imgs/g5.jpg',
  6: '/imgs/g6.jpg',
  7: '/imgs/g7.jpg',
}

function parseSlot(layout: string | null | undefined, index: number): Slot | null {
  if (layout && /^[1-7]$/.test(layout)) return Number(layout) as Slot
  const fromOrder = (index + 1) as Slot
  return fromOrder >= 1 && fromOrder <= 7 ? fromOrder : null
}

interface SlotPhoto {
  src: string
  alt: string
}

function SpaGallerySlot({
  slot,
  photo,
  layout,
  onSwap,
}: {
  slot: Slot
  photo: SlotPhoto
  layout: GalleryLayout
  onSwap: (target: Slot) => void
}) {
  const { isEditMode } = useEditMode()
  const [swapOpen, setSwapOpen] = useState(false)

  const extraClass =
    slot === 4 && layout === 'mosaic' ? ' spa-gallery__item--tall'
    : (slot === 1 || slot === 7) && layout === 'mosaic' ? ' spa-gallery__item--wide'
    : slot === 4 && layout === 'columns' ? ' spa-gallery__item--hero'
    : ''

  return (
    <div
      className={`spa-gallery__item spa-gallery__item--s${slot}${extraClass}`}
      data-slot={slot}
    >
      {isEditMode ? (
        <>
          <EditableImage
            page={PAGE}
            blockKey={`spa-gallery.image_${slot}`}
            className="spa-gallery__img spa-gallery__img--editable"
            alt={photo.alt}
            fallback={DEFAULT_IMAGES[slot]}
            label={`Galerie Spa — ${SLOT_LABELS[slot]}`}
          />
          <div className="spa-gallery__slot-tools">
            <span className="spa-gallery__slot-num" title={SLOT_LABELS[slot]}>
              {slot}
            </span>
            <div className="spa-gallery__swap">
              <button
                type="button"
                className="spa-gallery__swap-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  setSwapOpen(o => !o)
                }}
                title="Déplacer vers un autre emplacement"
              >
                <i className="fa-solid fa-arrows-up-down-left-right" />
                Déplacer
              </button>
              {swapOpen && (
                <div className="spa-gallery__swap-menu" onClick={(e) => e.stopPropagation()}>
                  <p className="spa-gallery__swap-label">Échanger avec</p>
                  {SLOTS.filter(s => s !== slot).map(s => (
                    <button
                      key={s}
                      type="button"
                      className="spa-gallery__swap-option"
                      onClick={() => {
                        onSwap(s)
                        setSwapOpen(false)
                      }}
                    >
                      {SLOT_LABELS[s]}
                      {layout === 'columns' && s === 4 ? ' (grand format)' : ''}
                      {layout === 'mosaic' && s === 4 ? ' (vertical)' : ''}
                      {layout === 'mosaic' && (s === 1 || s === 7) ? ' (large)' : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <img
          src={photo.src}
          alt={photo.alt}
          className="spa-gallery__img"
          loading="lazy"
        />
      )}
    </div>
  )
}

export default function SpaGallerySection() {
  const { get, queueChange } = useContent()
  const { isEditMode } = useEditMode()
  const { items: galleryItems } = useCarousel(GALLERY_SLUG)

  const layout = (get('spa-gallery.layout', 'mosaic') as GalleryLayout) || 'mosaic'
  const activeLayout: GalleryLayout = layout === 'columns' ? 'columns' : 'mosaic'

  const carouselBySlot = useMemo(() => {
    const map = new Map<Slot, SlotPhoto>()
    galleryItems.forEach((item, i) => {
      const slot = parseSlot(item.layout, i)
      if (!slot || !item.image_url) return
      map.set(slot, {
        src: item.image_url,
        alt: item.image_alt ?? item.title ?? `Golden Carthage — photo ${slot}`,
      })
    })
    return map
  }, [galleryItems])

  const carouselActive = !isEditMode && carouselBySlot.size > 0

  const photos = useMemo(() => {
    const result: Record<Slot, SlotPhoto> = {} as Record<Slot, SlotPhoto>
    for (const slot of SLOTS) {
      if (carouselActive && carouselBySlot.has(slot)) {
        result[slot] = carouselBySlot.get(slot)!
      } else {
        const cms = get(`spa-gallery.image_${slot}`, '')
        result[slot] = {
          src: cms || DEFAULT_IMAGES[slot],
          alt: `Golden Carthage — photo ${slot}`,
        }
      }
    }
    return result
  }, [carouselBySlot, get, carouselActive])

  const swapSlots = (slotA: Slot, slotB: Slot) => {
    const keyA = `spa-gallery.image_${slotA}`
    const keyB = `spa-gallery.image_${slotB}`
    const valA = get(keyA, DEFAULT_IMAGES[slotA])
    const valB = get(keyB, DEFAULT_IMAGES[slotB])

    const mk = (section: string, key: string, value: string) => ({
      page: PAGE,
      section,
      key,
      locale: '_all' as const,
      type: 'image' as const,
      value,
      label: `Galerie Spa — Photo ${key.replace('image_', '')}`,
    })

    queueChange(mk('spa-gallery', `image_${slotA}`, valB))
    queueChange(mk('spa-gallery', `image_${slotB}`, valA))
  }

  const setLayout = (next: GalleryLayout) => {
    queueChange({
      page: PAGE,
      section: 'spa-gallery',
      key: 'layout',
      locale: '_all',
      type: 'text',
      value: next,
      label: 'Galerie Spa — Disposition',
    })
  }

  return (
    <section className="spa-gallery" aria-label="Galerie Golden Carthage" data-cms-section="spa-gallery">
      {isEditMode && (
        <div className="spa-gallery__layout-bar">
          <span className="spa-gallery__layout-label">Disposition :</span>
          {LAYOUT_OPTIONS.map(opt => (
            <button
              key={opt.id}
              type="button"
              className={`spa-gallery__layout-btn${activeLayout === opt.id ? ' spa-gallery__layout-btn--active' : ''}`}
              onClick={() => setLayout(opt.id)}
            >
              {opt.label}
            </button>
          ))}
          <span className="spa-gallery__layout-hint">
            Utilisez « Déplacer » sur une photo pour changer sa place dans la grille
          </span>
        </div>
      )}
      <div className="spa-gallery__grid" data-layout={activeLayout}>
        {SLOTS.map(slot => (
          <SpaGallerySlot
            key={slot}
            slot={slot}
            photo={photos[slot]}
            layout={activeLayout}
            onSwap={(target) => swapSlots(slot, target)}
          />
        ))}
      </div>
      
    </section>
  )
}
