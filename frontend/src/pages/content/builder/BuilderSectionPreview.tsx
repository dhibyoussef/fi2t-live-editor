import { Image as ImageIcon } from 'lucide-react'
import { HOME_PREVIEW_DEFAULTS } from './homePreviewDefaults'
import { parseJsonArray, resolvePreviewImageUrl, truncateText } from './previewAssets'

interface BlockRow {
  key: string
  type: string
  label: string | null
  locales: Record<string, { value: string | null }>
}

interface Section {
  name: string
  title?: string
  pattern?: string | null
  blocks: BlockRow[]
}

export interface PreviewCarouselItem {
  image_url: string
  image_alt?: string | null
  title?: string | null
}

interface Props {
  pageSlug: string
  section: Section
  selected: boolean
  carouselBySlug?: Record<string, PreviewCarouselItem[]>
  getValue: (key: string, locale?: string) => string
  onClick: () => void
}

/** Human wording for the raw pattern id shown on each section chip. */
const PATTERN_LABELS: Record<string, string> = {
  custom_band: 'Bande',
  hero: 'Bannière',
  heading: 'Titre',
  text: 'Texte',
  image: 'Image',
  text_image: 'Texte + image',
  gallery: 'Galerie',
  testimonials: 'Avis',
  simple_list: 'Liste',
  cards_grid: 'Grille de cartes',
  cta_banner: 'Bandeau CTA',
  stats: 'Chiffres clés',
}

function PreviewImg({ src, alt = '', className }: { src: string; alt?: string; className?: string }) {
  const url = resolvePreviewImageUrl(src)
  if (!url) {
    return (
      <div className={`pb-preview__placeholder${className ? ` ${className}` : ''}`}>
        <ImageIcon size={24} />
      </div>
    )
  }
  return (
    <img
      src={url}
      alt={alt}
      className={className}
      loading="lazy"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

export default function BuilderSectionPreview({
  pageSlug,
  section,
  selected,
  carouselBySlug = {},
  getValue,
  onClick,
}: Props) {
  const pattern = section.pattern ?? 'text'
  const defaults = pageSlug === 'home' ? HOME_PREVIEW_DEFAULTS : {}

  const val = (key: string, locale = 'fr') => {
    const direct = getValue(key, locale)
    if (direct?.trim()) return direct
    return defaults[`${section.name}.${key}`] ?? ''
  }

  const title = val('title') || val('headline') || val('label') || section.title || 'Section'
  const desc = val('desc') || val('subtitle') || val('intro')

  const heroBg =
    carouselBySlug['home-hero']?.[0]?.image_url
    || val('image')
    || val('bg')
    || val('slide_1')
    || val('slide_2')

  const galleryPhotos =
    carouselBySlug['home-gallery']?.map(i => i.image_url)
    ?? parseJsonArray<{ image: string }>(val('photos')).map(p => p.image)

  const spaPhotos =
    carouselBySlug['home-spa-gallery']?.map(i => i.image_url)
    ?? [1, 2, 3, 4, 5, 6, 7].map(n => val(`image_${n}`)).filter(Boolean)

  const vipPhotos =
    carouselBySlug['home-vip-lounge']?.length
      ? carouselBySlug['home-vip-lounge'].map(i => i.image_url)
      : [val('image_main'), val('image_top'), val('image_bottom')].filter(Boolean)

  const eventPhoto =
    carouselBySlug['reunions-evenements']?.[0]?.image_url || val('image')

  const roomCards = parseJsonArray<{ name?: string; desc?: string; image?: string; badge?: string }>(val('cards'))
  const restaurantCards = parseJsonArray<{ name?: string; image?: string }>(val('cards'))
  const weddingCards = parseJsonArray<{ icon?: string; text?: string }>(val('cards'))
  const serviceItems = parseJsonArray<{ title?: string; icons?: { base?: string } }>(val('items'))
  const reviews = parseJsonArray<{ text?: string; name?: string; avatar?: string }>(val('reviews'))

  /*
   * FI2T bands name their list differently per section (`items`, `members`,
   * `reasons`, `pillars`…). Preview whichever one this band carries so the
   * structure shows the page's real cards instead of an empty strip.
   */
  type PreviewCard = {
    image?: string
    icon?: string
    photo?: string
    title?: string
    label?: string
    name?: string
    text?: string
    body?: string
    desc?: string
    value?: string
  }
  const LIST_KEYS = ['items', 'cards', 'members', 'staff', 'reasons', 'pillars', 'photos']
  const gridCards = LIST_KEYS.reduce<PreviewCard[]>(
    (found, key) => (found.length ? found : parseJsonArray<PreviewCard>(val(key))),
    [],
  )
  const cardImage = (c: PreviewCard) => c.image ?? c.icon ?? c.photo ?? ''
  const cardTitle = (c: PreviewCard) => c.title ?? c.label ?? c.name ?? ''
  const cardBody = (c: PreviewCard) => c.text ?? c.body ?? c.desc ?? c.value ?? ''

  return (
    <div
      className={`pb-section${selected ? ' pb-section--selected' : ''}`}
      onClick={e => { e.stopPropagation(); onClick() }}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick() }}
    >
      <div className="pb-section__toolbar">
        <span className="pb-section__type">{PATTERN_LABELS[section.pattern ?? ''] ?? section.pattern ?? 'texte'}</span>
        <span className="pb-section__name">{section.title ?? section.name}</span>
        <span className="pb-section__edit">Cliquer pour modifier →</span>
      </div>

      {pattern === 'hero' && (
        <div
          className="pb-preview pb-preview--hero pb-preview--hero-img"
          style={heroBg ? { backgroundImage: `url(${resolvePreviewImageUrl(heroBg)})` } : undefined}
        >
          <div className="pb-preview--hero__shade" />
          <div className="pb-preview--hero__body">
            <h2>{truncateText(title.replace(/\n/g, ' '), 80)}</h2>
            <p>{truncateText(desc, 100)}</p>
          </div>
        </div>
      )}

      {pattern === 'heading' && (
        <div className="pb-preview pb-preview--heading">
          <h2>{truncateText(title.replace(/\n/g, ' '), 80)}</h2>
        </div>
      )}

      {pattern === 'text' && (
        <div className="pb-preview pb-preview--text">
          <h3>{truncateText(title.replace(/\n/g, ' '), 60)}</h3>
          <p>{truncateText(desc, 140)}</p>
        </div>
      )}

      {pattern === 'image' && (
        <div className="pb-preview pb-preview--image">
          <PreviewImg src={val('image')} className="pb-preview__fill-img" />
        </div>
      )}

      {pattern === 'text_image' && section.name === 'vip' && (
        <div className="pb-preview pb-preview--vip">
          <h3>{truncateText(title.replace(/\n/g, ' '), 40)}</h3>
          <div className="pb-preview__vip-grid">
            {vipPhotos.slice(0, 3).map((src, i) => (
              <div key={i} className={`pb-preview__vip-slot${i === 0 ? ' pb-preview__vip-slot--main' : ''}`}>
                <PreviewImg src={src} className="pb-preview__fill-img" alt="" />
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern === 'text_image' && section.name !== 'vip' && (
        <div className="pb-preview pb-preview--split">
          <div className="pb-preview__ph-img pb-preview__ph-img--filled">
            <PreviewImg
              src={section.name === 'events' ? eventPhoto : val('image')}
              className="pb-preview__fill-img"
            />
          </div>
          <div>
            <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
            <p>{truncateText(desc, 120)}</p>
          </div>
        </div>
      )}

      {pattern === 'rooms_cards' && (
        <div className="pb-preview pb-preview--cards">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          <p className="pb-preview__sub">{truncateText(desc, 90)}</p>
          <div className="pb-preview__cards">
            {(roomCards.length ? roomCards : [{ name: 'Chambre' }, { name: 'Suite' }, { name: 'Résidence' }]).slice(0, 3).map((c, i) => (
              <div key={i} className="pb-preview__card pb-preview__card--photo">
                {c.image ? <PreviewImg src={c.image} alt={c.name} className="pb-preview__fill-img" /> : null}
                <span>{c.name ?? `Carte ${i + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern === 'restaurants_cards' && (
        <div className="pb-preview pb-preview--cards">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          <div className="pb-preview__cards">
            {(restaurantCards.length ? restaurantCards : [{ name: 'Restaurant' }, { name: 'Bar' }, { name: 'Terrasse' }]).slice(0, 3).map((c, i) => (
              <div key={i} className="pb-preview__card pb-preview__card--photo">
                {c.image ? <PreviewImg src={c.image} alt={c.name} className="pb-preview__fill-img" /> : null}
                <span>{c.name ?? `Restaurant ${i + 1}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern === 'weddings_cards' && (
        <div className="pb-preview pb-preview--cards pb-preview--weddings">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          <div className="pb-preview__cards pb-preview__cards--icons">
            {(weddingCards.length ? weddingCards : [{ icon: '/imgs/wedding1.svg' }, { icon: '/imgs/wedding2.svg' }, { icon: '/imgs/wedding3.svg' }]).slice(0, 3).map((c, i) => (
              <div key={i} className="pb-preview__card pb-preview__card--icon">
                {c.icon ? <PreviewImg src={c.icon} className="pb-preview__icon-img" alt="" /> : null}
                <p>{truncateText(c.text ?? '', 60)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern === 'services_list' && (
        <div className="pb-preview pb-preview--services">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          <div className="pb-preview__services">
            {(serviceItems.length ? serviceItems : [{ title: 'Wi-Fi', icons: { base: '/imgs/wifi.svg' } }]).slice(0, 6).map((item, i) => (
              <div key={i} className="pb-preview__service">
                {item.icons?.base && <PreviewImg src={item.icons.base} className="pb-preview__icon-img" alt="" />}
                <span>{truncateText((item.title ?? '').replace(/\n/g, ' '), 24)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern === 'spa_gallery' && (
        <div className="pb-preview pb-preview--spa-gallery">
          <h3>Galerie Spa</h3>
          <div className="pb-preview__gallery pb-preview__gallery--7">
            {(spaPhotos.length ? spaPhotos : ['/imgs/g1.jpg']).slice(0, 7).map((src, i) => (
              <div key={i} className="pb-preview__gcell pb-preview__gcell--img">
                <PreviewImg src={src} className="pb-preview__fill-img" alt="" />
              </div>
            ))}
          </div>
        </div>
      )}

      {(pattern === 'gallery' || section.name === 'gallery') && (
        <div className="pb-preview pb-preview--gallery pb-preview--gallery-strip">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          <div className="pb-preview__gallery pb-preview__gallery--strip">
            {(galleryPhotos.length ? galleryPhotos : ['/imgs/g1.jpg']).slice(0, 5).map((src, i) => (
              <div key={i} className="pb-preview__gcell pb-preview__gcell--tall">
                <PreviewImg src={src} className="pb-preview__fill-img" alt="" />
              </div>
            ))}
          </div>
        </div>
      )}

      {pattern === 'testimonials' && (
        <div className="pb-preview pb-preview--reviews">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          <p className="pb-preview__sub">{truncateText(val('subtitle'), 80)}</p>
          <div className="pb-preview__reviews">
            {(reviews.length ? reviews : [{ text: 'Avis client…', name: 'Client', avatar: '' }]).slice(0, 2).map((r, i) => (
              <blockquote key={i} className="pb-preview__quote">
                {r.avatar && <PreviewImg src={r.avatar} className="pb-preview__avatar" alt="" />}
                <p>« {truncateText(r.text ?? '', 100)} »</p>
                <footer>{r.name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      )}

      {pattern === 'simple_list' && (
        <div className="pb-preview pb-preview--cards">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          <div className="pb-preview__cards">
            {[0, 1, 2].map(i => (
              <div key={i} className="pb-preview__card" />
            ))}
          </div>
        </div>
      )}

      {(pattern === 'cards_grid' || pattern === 'custom_band') && (
        <div className="pb-preview pb-preview--cards">
          <h3>{truncateText(title.replace(/\n/g, ' '), 50)}</h3>
          {desc && <p className="pb-preview__sub">{truncateText(desc, 90)}</p>}
          <div className="pb-preview__cards">
            {(gridCards.length ? gridCards : [{}, {}, {}]).slice(0, 3).map((c, i) => (
              <div key={i} className="pb-preview__card">
                {cardImage(c) ? (
                  <PreviewImg src={cardImage(c)} className="pb-preview__icon-img" alt="" />
                ) : null}
                <span>{truncateText(cardTitle(c) || `Élément ${i + 1}`, 28)}</span>
                {cardBody(c) ? <p>{truncateText(cardBody(c).replace(/\n/g, ' '), 60)}</p> : null}
              </div>
            ))}
          </div>
          {gridCards.length > 3 && (
            <span className="pb-preview__more">+{gridCards.length - 3} autres</span>
          )}
        </div>
      )}

      {pattern === 'cta_banner' && (
        <div
          className="pb-preview pb-preview--hero pb-preview--hero-img"
          style={heroBg ? { backgroundImage: `url(${resolvePreviewImageUrl(heroBg)})` } : undefined}
        >
          <div className="pb-preview--hero__shade" />
          <div className="pb-preview--hero__body">
            <h2>{truncateText(title.replace(/\n/g, ' '), 60)}</h2>
            <p>{truncateText(val('body') || desc, 90)}</p>
          </div>
        </div>
      )}

      {pattern === 'stats' && (
        <div className="pb-preview pb-preview--cards">
          <div className="pb-preview__cards">
            {['groupements', 'regions', 'mandate'].map(key => (
              <div key={key} className="pb-preview__card">
                <strong>{val(`value_${key}`) || val('mandate_years') || '—'}</strong>
                <span>{truncateText(val(`label_${key}`), 20)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
