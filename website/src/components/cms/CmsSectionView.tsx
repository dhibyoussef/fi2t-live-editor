import { type CSSProperties, type ReactNode } from 'react'
import EditableText from '../../cms/EditableText'
import EditableImage from '../../cms/EditableImage'
import { useContent } from '../../cms/ContentProvider'
import { useBuilderPreview } from '../../cms/BuilderPreviewProvider'
import '../../styles/cms-dynamic.css'
import { publicUrl } from '../../lib/publicUrl'

export interface CmsSectionData {
  slug: string
  title: string
  pattern: string | null
  blocks: Record<string, string>
}

interface Props {
  page: string
  section: CmsSectionData
  index: number
}

function blockKey(section: string, key: string) {
  return `${section}.${key}`
}

function parseJson<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) as T } catch { return fallback }
}

function SectionShell({
  slug, className, style, children,
}: { slug: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  const { highlightSection, isEmbed } = useBuilderPreview()
  const highlighted = isEmbed && highlightSection === slug
  return (
    <section
      data-cms-section={slug}
      className={`${className ?? ''}${highlighted ? ' cms-section-highlight' : ''}`}
      style={style}
    >
      {children}
    </section>
  )
}

export default function CmsSectionView({ page, section, index }: Props) {
  const { getJson, get } = useContent()
  const pattern = section.pattern ?? 'text'
  const bg = index % 2 === 0 ? 'section--maroon' : 'section--navy'

  if (pattern === 'hero') {
    const slide = get(blockKey(section.slug, 'slide_1'), section.blocks.slide_1 ?? '')
      || get(blockKey(section.slug, 'slide_2'), section.blocks.slide_2 ?? '')
    return (
      <SectionShell
        slug={section.slug}
        className="cms-dyn-hero"
        style={slide ? { backgroundImage: `url(${publicUrl(slide)})` } : undefined}
      >
        <div className="cms-dyn-hero__overlay" />
        <div className="container cms-dyn-hero__body">
          <EditableText page={page} blockKey={blockKey(section.slug, 'headline')} as="h1" className="cms-dyn-hero__title" multiline label="Titre principal" />
          <EditableText page={page} blockKey={blockKey(section.slug, 'rating')} as="p" className="cms-dyn-hero__sub" label="Sous-titre" />
          <EditableText page={page} blockKey={blockKey(section.slug, 'intro')} as="p" className="cms-dyn-hero__intro" multiline label="Introduction" />
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'heading') {
    return (
      <SectionShell slug={section.slug} className={`section ${bg} cms-dyn-heading`}>
        <div className="container">
          <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--gold" label="Titre" />
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'image') {
    return (
      <SectionShell slug={section.slug} className={`section ${bg}`}>
        <div className="container cms-dyn-image-wrap">
          <EditableImage page={page} blockKey={blockKey(section.slug, 'image')} className="cms-dyn-image" alt="" label="Image" />
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'text_image') {
    return (
      <SectionShell slug={section.slug} className={`section ${bg} cms-dyn-split`}>
        <div className="container cms-dyn-split__grid">
          <EditableImage page={page} blockKey={blockKey(section.slug, 'image')} className="cms-dyn-split__img" alt="" label="Image" />
          <div className="cms-dyn-split__text">
            <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--gold" multiline label="Titre" />
            <EditableText page={page} blockKey={blockKey(section.slug, 'desc')} as="p" className="cms-dyn-text" multiline label="Description" />
          </div>
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'rooms_cards' || (pattern === null && section.slug.includes('room'))) {
    const cards = getJson<Array<{ name: string; desc: string; image: string; badge?: string }>>(
      blockKey(section.slug, 'cards'),
      parseJson(section.blocks.cards, []),
    )
    return (
      <SectionShell slug={section.slug} className={`section ${bg}`}>
        <div className="container">
          <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--gold" label="Titre" />
          <EditableText page={page} blockKey={blockKey(section.slug, 'desc')} as="p" className="cms-dyn-text cms-dyn-text--center" multiline label="Description" />
          <div className="cms-dyn-cards">
            {cards.map((c, i) => (
              <article key={i} className="cms-dyn-card">
                {c.image && <img src={publicUrl(c.image)} alt={c.name} />}
                <div className="cms-dyn-card__body">
                  {c.badge && <span className="cms-dyn-card__badge">{c.badge}</span>}
                  <h3>{c.name}</h3>
                  <p>{c.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'restaurants_cards') {
    const cards = getJson<Array<{ name: string; image: string }>>(
      blockKey(section.slug, 'cards'),
      parseJson(section.blocks.cards, []),
    )
    return (
      <SectionShell slug={section.slug} className={`section ${bg}`}>
        <div className="container">
          <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--gold" label="Titre" />
          <EditableText page={page} blockKey={blockKey(section.slug, 'desc')} as="p" className="cms-dyn-text cms-dyn-text--center" multiline label="Description" />
          <div className="cms-dyn-cards cms-dyn-cards--3">
            {cards.map((c, i) => (
              <article key={i} className="cms-dyn-card cms-dyn-card--overlay">
                {c.image && <img src={publicUrl(c.image)} alt={c.name} />}
                <div className="cms-dyn-card__overlay"><h3>{c.name}</h3></div>
              </article>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'gallery') {
    const photos = getJson<Array<{ image: string; large?: boolean; wide?: boolean }>>(
      blockKey(section.slug, 'photos'),
      parseJson(section.blocks.photos, []),
    )
    return (
      <SectionShell slug={section.slug} className={`section ${bg}`}>
        <div className="container">
          <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--gold" label="Titre galerie" />
          <div className="cms-dyn-gallery">
            {photos.map((p, i) => (
              <div key={i} className={`cms-dyn-gallery__item${p.large ? ' cms-dyn-gallery__item--large' : ''}${p.wide ? ' cms-dyn-gallery__item--wide' : ''}`}>
                <img src={publicUrl(p.image)} alt="" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'testimonials') {
    const reviews = getJson<Array<{ text: string; name: string; origin: string; avatar: string }>>(
      blockKey(section.slug, 'reviews'),
      parseJson(section.blocks.reviews, []),
    )
    return (
      <SectionShell slug={section.slug} className={`section ${bg}`}>
        <div className="container">
          <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--cream" label="Titre" />
          <EditableText page={page} blockKey={blockKey(section.slug, 'subtitle')} as="p" className="cms-dyn-text cms-dyn-text--center" multiline label="Sous-titre" />
          <div className="cms-dyn-reviews">
            {reviews.map((r, i) => (
              <blockquote key={i} className="cms-dyn-review">
                <p>{r.text}</p>
                <footer>
                  {r.avatar && <img src={publicUrl(r.avatar)} alt="" />}
                  <div><strong>{r.name}</strong><span>{r.origin}</span></div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  }

  if (pattern === 'simple_list') {
    const items = getJson<Array<{ title: string; text: string; image: string }>>(
      blockKey(section.slug, 'items'),
      parseJson(section.blocks.items, []),
    )
    return (
      <SectionShell slug={section.slug} className={`section ${bg}`}>
        <div className="container">
          <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--gold" label="Titre" />
          <div className="cms-dyn-cards">
            {items.map((item, i) => (
              <article key={i} className="cms-dyn-card">
                {item.image && <img src={publicUrl(item.image)} alt={item.title} />}
                <div className="cms-dyn-card__body">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </SectionShell>
    )
  }

  // Default: text pattern
  return (
    <SectionShell slug={section.slug} className={`section ${bg}`}>
      <div className="container cms-dyn-text-block">
        <EditableText page={page} blockKey={blockKey(section.slug, 'title')} as="h2" className="section-title section-title--gold" multiline label="Titre" />
        <EditableText page={page} blockKey={blockKey(section.slug, 'desc')} as="p" className="cms-dyn-text" multiline label="Description" />
      </div>
    </SectionShell>
  )
}
