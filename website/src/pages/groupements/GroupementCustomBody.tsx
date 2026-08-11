import { Fragment, useEffect, useRef, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import {
  getCustomGroupementPage,
  type BarItem,
  type CustomGroupementPage,
  type IconCard,
  type NumberedCard,
  type PlaceCard,
  type StatCard,
  type TimelineItem,
} from '../../cms/defaults/groupement-custom-pages'
import { GROUPEMENT_HERO_BY_SLUG } from '../../cms/defaults/groupements-index'
import { blocksToPage } from '../../cms/defaults/groupement-page-schema'
import CustomPageEditor from './CustomPageEditor'
import EditableImage, { useEditableImageSrc } from '../../cms/EditableImage'
import EditableText from '../../cms/EditableText'
import EditableJsonList from '../../cms/EditableJsonList'
import { useContent, useContentBlock } from '../../cms/ContentProvider'
import { useEditMode } from '../../cms/EditModeProvider'
import { GROUPEMENT_PHOTO_HERO_BY_SLUG, getHub, getParentHub } from '../../lib/groupement-tree'

/** Keeps the Figma 1440 Diagnostic stage visually identical at any desktop width. */
function CultDiagStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const parent = el.parentElement
    if (!parent) return
    const apply = () => {
      const w = parent.clientWidth || 1440
      if (w <= 640) {
        el.style.zoom = '1'
        return
      }
      el.style.zoom = String(Math.min(1, w / 1440))
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={ref} className="fi2t-gl-cult-diag__stage">
      {children}
    </div>
  )
}

function GlIcon({ name }: { name?: string }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true as const,
  }
  switch (name) {
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      )
    case 'building':
      return (
        <svg {...common}>
          <path d="M4 20V6l8-3 8 3v14" />
          <path d="M9 20v-6h6v6M9 10h.01M15 10h.01M12 10h.01M9 14h.01M15 14h.01" />
        </svg>
      )
    case 'tech':
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <path d="M8 20h8M12 16v4" />
        </svg>
      )
    case 'scale':
      return (
        <svg {...common}>
          <path d="M12 3v18M5 7h14M7 7l-3 7h6L7 7zm10 0l-3 7h6l-3-7z" />
        </svg>
      )
    case 'wallet':
    case 'money':
    case 'euro':
      return (
        <svg {...common}>
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <path d="M2 10h20M6 14h2M12 14h.01" />
        </svg>
      )
    case 'leaf':
      return (
        <svg {...common}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      )
    case 'heart':
    case 'care':
      return (
        <svg {...common}>
          <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
        </svg>
      )
    case 'quill':
      return (
        <svg {...common}>
          <path d="M20 2c-3 1-6 4-7 7l-1 3-3 1c-3 1-6 4-7 7 3-1 6-4 7-7l1-3 3-1c3-1 6-4 7-7z" />
          <path d="M12.5 12.5L7 18" />
        </svg>
      )
    case 'globe':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
        </svg>
      )
    case 'plane':
      return (
        <svg {...common}>
          <path d="M22 2L11 13" />
          <path d="M22 2L15 22l-4-9-9-4 20-7z" />
        </svg>
      )
    case 'shield':
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )
    case 'clinic':
    case 'resort':
    case 'pin':
    case 'access':
    case 'comfort':
    case 'eye':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      )
    case 'chart':
      return (
        <svg {...common}>
          <path d="M4 19V9M10 19V5M16 19v-7M20 19H3" />
          <path d="M16 8l3-3 3 3" />
        </svg>
      )
    case 'megaphone':
      return (
        <svg {...common}>
          <path d="M3 11v2a2 2 0 0 0 2 2h2l6 4V5L7 9H5a2 2 0 0 0-2 2z" />
          <path d="M16.5 8.5a4 4 0 0 1 0 7" />
        </svg>
      )
    case 'people':
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="3" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a3 3 0 0 1 0 5.74" />
        </svg>
      )
    case 'sync':
      return (
        <svg {...common} strokeWidth={2}>
          <path d="M21 12a9 9 0 0 0-14.5-7.1L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 14.5 7.1L21 16" />
          <path d="M21 21v-5h-5" />
        </svg>
      )
    case 'alert':
      return (
        <svg {...common}>
          <path d="M12 3l9 16H3L12 3z" />
          <path d="M12 10v4M12 17h.01" />
        </svg>
      )
    case 'landmark':
      return (
        <svg {...common}>
          <path d="M3 21h18M6 21V10l6-5 6 5v11M9 21v-6h6v6" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l2.5 2.5" />
        </svg>
      )
  }
}

/**
 * Banner = one clipped box:
 *  - plain photo + image-edit CHIP (hit area = chip only, clipped to photo)
 *  - title overlaid with pointer-events only on the text
 * Never wrap title inside EditableImage — that merges hit areas.
 */
function GroupementHero({ title, slug, children }: { title: string; slug: string; children?: ReactNode }) {
  const photo = GROUPEMENT_PHOTO_HERO_BY_SLUG[slug]
  const baked = GROUPEMENT_HERO_BY_SLUG[slug]
  const fallback = photo
    ? `${photo}?v=6`
    : baked?.includes('?')
      ? baked
      : baked
        ? `${baked}?v=7`
        : undefined

  if (fallback) {
    return (
      <GroupementSplitHero title={title} slug={slug} imageFallback={fallback}>
        {children}
      </GroupementSplitHero>
    )
  }

  return (
    <GroupementSplitHero title={title} slug={slug}>
      {children}
    </GroupementSplitHero>
  )
}

function GroupementSplitHero({
  title,
  slug,
  imageFallback,
  children,
}: {
  title: string
  slug: string
  imageFallback?: string
  children?: ReactNode
}) {
  const { isEditMode } = useEditMode()
  const src = useEditableImageSrc(slug, 'hero.image', imageFallback ?? '')
  const photoSrc = src || imageFallback || ''

  return (
    <section className="fi2t-g-hero" aria-label="Bannière" data-cms-page={slug} data-cms-section="hero">
      {/* Photo layer — plain <img>; image edits ONLY via chip (never full-bleed wrapper) */}
      <div className="fi2t-g-hero-media">
        {photoSrc ? (
          <img
            className="fi2t-g-hero-media__img"
            src={photoSrc}
            alt=""
            loading="eager"
            data-cms-page={slug}
            data-cms-block="hero.image"
          />
        ) : (
          <div className="fi2t-g-hero-media__brand" aria-hidden="true" />
        )}
        <span className="fi2t-g-hero-media__scrim" aria-hidden="true" />
        {isEditMode ? (
          <EditableImage
            page={slug}
            blockKey="hero.image"
            variant="chip"
            label="Image bannière"
            className="fi2t-g-hero-media__edit"
            fallback={imageFallback ?? ''}
          />
        ) : null}
      </div>

      {/* Title layer — overlaid visually, separate hit target (pointer-events only on text) */}
      <div
        className="fi2t-g-hero-title"
        onClick={(e) => e.stopPropagation()}
      >
        <EditableText
          page={slug}
          blockKey="hero.title"
          as="h1"
          className="fi2t-g-hero-title__text"
          label="Titre bannière"
          fallback={title}
        />
        <span className="fi2t-g-hero-title__accent" aria-hidden="true" />
        {children}
      </div>
    </section>
  )
}

/**
 * Figures like "+7%", "1.6 T" or "55 835" get reordered by the bidi algorithm
 * inside an RTL page. Isolating them as LTR keeps the reading order; values
 * that are actually Arabic words are left alone so they stay RTL.
 */
function Num({ children }: { children: ReactNode }) {
  if (typeof children !== 'string' && typeof children !== 'number') return <>{children}</>
  const segments = String(children)
    .split(/([\u0600-\u06FF][\u0600-\u06FF\s\u060C]*)/)
    .filter((part) => part.trim() !== '')
  if (segments.length === 0) return <>{children}</>
  return (
    <>
      {segments.map((segment, i) => (
        <Fragment key={`${i}-${segment.slice(0, 12)}`}>
          {i > 0 ? ' ' : null}
          {/[\u0600-\u06FF]/.test(segment) ? segment.trim() : <bdi dir="ltr">{segment.trim()}</bdi>}
        </Fragment>
      ))}
    </>
  )
}

/** Display order is the source of truth; a stored value only supplies a label such as AXE/AXIS. */
function sequenceNumber(index: number, template?: string) {
  const match = template?.match(/^(.*?)(\d+)(\D*)$/)
  const width = Math.max(2, match?.[2].length ?? 0)
  const number = String(index + 1).padStart(width, '0')
  return match ? `${match[1]}${number}${match[3]}` : number
}

function RichLine({ text }: { text: string }) {
  const parts = String(text).split(/\*\*(.+?)\*\*/)
  return (
    <p>
      {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : <span key={i}>{part}</span>))}
    </p>
  )
}

function ParentCrumb({ slug }: { slug: string }) {
  const { i18n } = useTranslation()
  const locale = (i18n.language || 'fr').split('-')[0]
  const parent = getParentHub(slug)
  if (!parent) return null
  const parentPage = getCustomGroupementPage(parent.slug, locale)
  const childPage = getCustomGroupementPage(slug, locale)
  const child = parent.children.find((c) => c.slug === slug)
  const parentLabel = parentPage?.heroTitle ?? parent.label
  const current = childPage?.heroTitle ?? child?.label ?? slug
  return (
    <nav className="fi2t-gl-crumb" aria-label="Fil d'Ariane">
      <Link to={`/${parent.slug}`}>{parentLabel}</Link>
      <span aria-hidden="true">/</span>
      <span>{current}</span>
    </nav>
  )
}

function HubBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const { isEditMode } = useEditMode()
  const s = page.sections
  const hub = getHub(String(s.hubSlug || ''))
  if (!hub) return null

  const childrenFallback = (
    (s.children as {
      slug: string
      label: string
      blurb: string
      face?: string
      tag?: string
    }[]) || hub.children
  ).map((c) => ({
    slug: c.slug,
    label: c.label,
    blurb: c.blurb ?? '',
    face: c.face ?? '',
    tag: c.tag ?? '',
  }))
  const statsFallback = ((s.stats as StatCard[]) || []).map((x) => ({
    value: x.value,
    label: x.label,
    desc: x.desc ?? '',
  }))
  const pillarsFallback = ((s.pillars as IconCard[]) || []).map((p) => ({
    title: p.title,
    desc: p.desc ?? '',
    icon: p.icon ?? 'shield',
  }))
  const discoverCta = String(s.discoverCta || 'Découvrir la filière')
  const ctaTo = String(s.ctaTo || '/fiche-adhesion')

  return (
    <div className="fi2t-gl-hub-stage">
      <section className="fi2t-gl-tree-intro" data-cms-section="intro">
        <EditableText
          page={slug}
          blockKey="intro.eyebrow"
          as="span"
          className="fi2t-gl-tree-eyebrow"
          label="Surtitre"
          fallback={String(s.eyebrow || 'Pôle du groupement')}
        />
        <EditableText
          page={slug}
          blockKey="intro.lead"
          as="p"
          className="fi2t-gl-tree-intro__lead"
          label="Accroche"
          fallback={String(s.lead || '')}
        />
        <div className="fi2t-gl-tree-intro__body">
          <EditableText
            page={slug}
            blockKey="intro.body"
            as="div"
            multiline
            label="Introduction"
            fallback={page.intro}
          />
        </div>
      </section>

      <section className="fi2t-gl-tree-stats" data-cms-section="stats">
        <EditableText
          page={slug}
          blockKey="stats.title"
          as="h2"
          fallback={String(s.statsTitle || '')}
        />
        <EditableJsonList<(typeof statsFallback)[number]>
          page={slug}
          blockKey="stats.items"
          label="Chiffres clés"
          className="fi2t-gl-tree-stats__grid"
          fallback={statsFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', desc: '' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName="fi2t-gl-tree-stat"
          renderItem={(_item, _index, { editField }) => (
            <>
              <strong>{editField('value', 'span')}</strong>
              {editField('label', 'span')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-tree-pillars" data-cms-section="pillars">
        <header className="fi2t-gl-head fi2t-gl-head--center">
          <EditableText
            page={slug}
            blockKey="pillars.title"
            as="h2"
            fallback={String(s.pillarsTitle || 'Le rôle de la Fi2T')}
          />
          <EditableText
            page={slug}
            blockKey="pillars.sub"
            as="p"
            fallback={String(s.pillarsSub || '')}
          />
        </header>
        <EditableJsonList<(typeof pillarsFallback)[number]>
          page={slug}
          blockKey="pillars.items"
          label="Piliers"
          className="fi2t-gl-tree-pillars__grid"
          fallback={pillarsFallback}
          emptyItem={{ title: 'Nouveau pilier', desc: '', icon: 'shield' }}
          addLabel="Ajouter un pilier"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName="fi2t-gl-tree-pillar"
          renderItem={(item, _index, { editField }) => (
            <>
              <span className="fi2t-gl-tree-pillar__icon" aria-hidden>
                {item.icon?.startsWith('/') ? (
                  <img src={item.icon} alt="" />
                ) : (
                  <GlIcon name={item.icon} />
                )}
              </span>
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-hub-filieres" aria-label={page.heroTitle} data-cms-section="grid">
        <header className="fi2t-gl-head fi2t-gl-head--center">
          <EditableText
            page={slug}
            blockKey="grid.title"
            as="h2"
            fallback={String(s.gridTitle || 'Les filières du pôle')}
          />
          <EditableText
            page={slug}
            blockKey="grid.sub"
            as="p"
            fallback={String(s.gridSub || '')}
          />
          {isEditMode ? (
            <p className="fi2t-gl-hub-cta-edit">
              Libellé CTA des cartes :{' '}
              <EditableText page={slug} blockKey="grid.cta" as="span" fallback={discoverCta} />
            </p>
          ) : null}
        </header>
        <EditableJsonList<(typeof childrenFallback)[number]>
          page={slug}
          blockKey="grid.children"
          label="Filières"
          className={`fi2t-gl-hub-grid${childrenFallback.length === 1 ? ' fi2t-gl-hub-grid--single' : ''}`}
          fallback={childrenFallback}
          emptyItem={{
            slug: 'nouvelle-filiere',
            label: 'Nouvelle filière',
            blurb: '',
            face: '/images/groupement-photos/face-tourisme-medical.jpg',
            tag: '',
          }}
          addLabel="Ajouter une filière"
          fields={[
            { key: 'face', label: 'Photo', image: true },
            { key: 'label', label: 'Titre' },
            { key: 'tag', label: 'Tag' },
            { key: 'blurb', label: 'Description', multiline: true },
            { key: 'slug', label: 'Slug (URL)' },
          ]}
          itemClassName="fi2t-gl-hub-card"
          renderItem={(item, _index, { editField, editImage, editable }) => {
            const media = (
              <div className="fi2t-gl-hub-card__media">
                {item.face || editable ? (
                  editImage('face', 'fi2t-gl-hub-card__face', item.label)
                ) : (
                  <span className="fi2t-gl-hub-card__placeholder" />
                )}
                {(item.tag || editable) ? (
                  <span className="fi2t-gl-hub-card__tag">{editField('tag', 'span')}</span>
                ) : null}
              </div>
            )
            const copy = (
              <div className="fi2t-gl-hub-card__copy">
                {editField('label', 'strong')}
                {editField('blurb', 'p')}
                <span className="fi2t-gl-hub-card__cta">
                  {discoverCta}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            )
            if (editable || !item.slug) {
              return (
                <>
                  {media}
                  {copy}
                </>
              )
            }
            return (
              <Link to={`/${item.slug}`} className="fi2t-gl-hub-card__hit">
                {media}
                {copy}
              </Link>
            )
          }}
        />
      </section>

      <section className="fi2t-gl-tree-cta" data-cms-section="cta">
        <div>
          <EditableText page={slug} blockKey="cta.title" as="h2" fallback={String(s.ctaTitle || '')} />
          <EditableText
            page={slug}
            blockKey="cta.body"
            as="p"
            multiline
            fallback={String(s.ctaBody || '')}
          />
        </div>
        {isEditMode ? (
          <span className="fi2t-gl-tree-cta__btn">
            <EditableText page={slug} blockKey="cta.label" as="span" fallback={String(s.ctaLabel || 'Adhérer à la Fi2T')} />
          </span>
        ) : (
          <Link to={ctaTo} className="fi2t-gl-tree-cta__btn">
            {String(s.ctaLabel || 'Adhérer à la Fi2T')}
          </Link>
        )}
      </section>
    </div>
  )
}

function SegmentBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const { isEditMode } = useEditMode()
  const s = page.sections
  const statsFallback = ((s.stats as StatCard[]) || []).map((x) => ({
    value: x.value,
    label: x.label,
    desc: x.desc ?? '',
  }))
  const pillarsFallback = ((s.pillars as IconCard[]) || []).map((p) => ({
    title: p.title,
    desc: p.desc ?? '',
    icon: p.icon ?? 'globe',
  }))
  const challengesFallback = ((s.challenges as string[]) || []).map((text) => ({ text }))
  const actionsFallback = ((s.actions as string[]) || []).map((text) => ({ text }))
  const ctaTo = String(s.ctaTo || '/fiche-adhesion')

  return (
    <div className="fi2t-gl-seg-stage">
      <section className="fi2t-gl-tree-intro" data-cms-section="intro">
        <EditableText
          page={slug}
          blockKey="intro.eyebrow"
          as="span"
          className="fi2t-gl-tree-eyebrow"
          label="Surtitre"
          fallback={String(s.eyebrow || 'Groupement Fi2T')}
        />
        <EditableText
          page={slug}
          blockKey="intro.lead"
          as="p"
          className="fi2t-gl-tree-intro__lead"
          multiline
          label="Accroche"
          fallback={String(s.lead || '')}
        />
        <div className="fi2t-gl-tree-intro__body">
          <EditableText
            page={slug}
            blockKey="intro.body"
            as="div"
            multiline
            label="Introduction"
            fallback={page.intro}
          />
        </div>
      </section>

      <section className="fi2t-gl-tree-stats" data-cms-section="stats">
        <EditableText
          page={slug}
          blockKey="stats.title"
          as="h2"
          label="Titre chiffres"
          fallback={String(s.statsTitle || '')}
        />
        <EditableJsonList<(typeof statsFallback)[number]>
          page={slug}
          blockKey="stats.items"
          label="Chiffres clés"
          className="fi2t-gl-tree-stats__grid"
          fallback={statsFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', desc: '' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName="fi2t-gl-tree-stat"
          renderItem={(_item, _index, { editField }) => (
            <>
              <strong>{editField('value', 'span')}</strong>
              {editField('label', 'span')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-tree-pillars" data-cms-section="pillars">
        <header className="fi2t-gl-head fi2t-gl-head--center">
          <EditableText
            page={slug}
            blockKey="pillars.title"
            as="h2"
            label="Titre piliers"
            fallback={String(s.pillarsTitle || 'Piliers du segment')}
          />
          {(isEditMode || s.pillarsSub) ? (
            <EditableText
              page={slug}
              blockKey="pillars.sub"
              as="p"
              multiline
              label="Sous-titre piliers"
              fallback={String(s.pillarsSub || '')}
            />
          ) : null}
        </header>
        <EditableJsonList<(typeof pillarsFallback)[number]>
          page={slug}
          blockKey="pillars.items"
          label="Piliers"
          className="fi2t-gl-tree-pillars__grid"
          fallback={pillarsFallback}
          emptyItem={{ title: 'Nouveau pilier', desc: '', icon: 'globe' }}
          addLabel="Ajouter un pilier"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName="fi2t-gl-tree-pillar"
          renderItem={(item, _index, { editField, editImage }) => (
            <>
              <span className="fi2t-gl-tree-pillar__icon" aria-hidden>
                {editImage(
                  'icon',
                  'fi2t-gl-tree-pillar__icon-btn',
                  item.title,
                  item.icon?.startsWith('/') ? (
                    <img src={item.icon} alt="" />
                  ) : (
                    <GlIcon name={item.icon} />
                  ),
                )}
              </span>
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-seg-split" data-cms-section="challenges">
        <div className="fi2t-gl-seg-split__col fi2t-gl-seg-split__col--challenges">
          <EditableText
            page={slug}
            blockKey="challenges.title"
            as="h2"
            label="Titre défis"
            fallback={String(s.challengesTitle || 'Défis à relever')}
          />
          <EditableJsonList<(typeof challengesFallback)[number]>
            page={slug}
            blockKey="challenges.items"
            label="Défis"
            className="fi2t-gl-seg-split__list"
            fallback={challengesFallback}
            emptyItem={{ text: 'Nouveau défi' }}
            addLabel="Ajouter un défi"
            fields={[{ key: 'text', label: 'Texte', multiline: true }]}
            itemClassName="fi2t-gl-seg-split__item"
            renderItem={(_item, _i, { editField }) => editField('text', 'span')}
          />
        </div>
        <div className="fi2t-gl-seg-split__col fi2t-gl-seg-split__col--actions">
          <EditableText
            page={slug}
            blockKey="actions.title"
            as="h2"
            label="Titre actions"
            fallback={String(s.actionsTitle || 'Actions Fi2T')}
          />
          <EditableJsonList<(typeof actionsFallback)[number]>
            page={slug}
            blockKey="actions.items"
            label="Actions"
            className="fi2t-gl-seg-split__list"
            fallback={actionsFallback}
            emptyItem={{ text: 'Nouvelle action' }}
            addLabel="Ajouter une action"
            fields={[{ key: 'text', label: 'Texte', multiline: true }]}
            itemClassName="fi2t-gl-seg-split__item"
            renderItem={(_item, _i, { editField }) => editField('text', 'span')}
          />
        </div>
      </section>

      <section className="fi2t-gl-tree-cta" data-cms-section="cta">
        <div>
          <EditableText
            page={slug}
            blockKey="cta.title"
            as="h2"
            label="CTA — Titre"
            fallback={String(s.ctaTitle || '')}
          />
          <EditableText
            page={slug}
            blockKey="cta.body"
            as="p"
            multiline
            label="CTA — Texte"
            fallback={String(s.ctaBody || '')}
          />
        </div>
        {isEditMode ? (
          <span className="fi2t-gl-tree-cta__btn">
            <EditableText
              page={slug}
              blockKey="cta.label"
              as="span"
              label="CTA — Libellé"
              fallback={String(s.ctaLabel || 'Adhérer à la Fi2T')}
            />
          </span>
        ) : (
          <Link to={ctaTo} className="fi2t-gl-tree-cta__btn">
            {String(s.ctaLabel || 'Adhérer à la Fi2T')}
          </Link>
        )}
        {isEditMode ? (
          <p className="fi2t-gl-seg-cta-to">
            Lien :{' '}
            <EditableText page={slug} blockKey="cta.to" as="span" label="CTA — Lien" fallback={ctaTo} />
          </p>
        ) : null}
      </section>
    </div>
  )
}

function ThalassoBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const { isEditMode } = useEditMode()
  const s = page.sections
  const body = Array.isArray(s.splitBody) ? (s.splitBody as string[]) : []
  const atoutsFallback = ((s.atouts as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? 'sun',
  }))
  const diagFallback = ((s.diagnostic as StatCard[]) || []).map((x) => ({
    value: x.value,
    label: x.label,
    desc: x.desc ?? '',
  }))
  const defisFallback = ((s.defis as IconCard[]) || []).map((d) => ({
    title: d.title,
    desc: d.desc ?? '',
  }))
  const planFallback = ((s.plan as NumberedCard[]) || []).map((a) => ({
    title: a.title,
    desc: a.desc ?? '',
  }))
  const splitImgFallback = `${String(s.splitImg ?? '/images/groupement-media/thalasso-split.jpg').split('?')[0]}?v=4`
  const splitImgSrc = useEditableImageSrc(slug, 'split.img', splitImgFallback)

  return (
    <div className="fi2t-gl-thal-stage">
      <section className="fi2t-gl-intro fi2t-gl-thal-intro" data-cms-section="intro">
        <EditableText
          page={slug}
          blockKey="intro.body"
          as="p"
          multiline
          label="Introduction"
          fallback={page.intro}
        />
      </section>

      <section className="fi2t-gl-split fi2t-gl-thal-split" data-cms-section="split">
        <div className="fi2t-gl-split__text">
          <EditableText
            page={slug}
            blockKey="split.title"
            as="h2"
            label="Titre présentation"
            fallback={String(s.splitTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="split.lead"
            as="p"
            className="fi2t-gl-split__bordered"
            multiline
            label="Chapô présentation"
            fallback={String(body[0] ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="split.copy"
            as="p"
            multiline
            label="Texte présentation"
            fallback={String(body[1] ?? '')}
          />
        </div>
        <div className="fi2t-gl-split__media fi2t-gl-thal-split__media">
          {isEditMode ? (
            <EditableImage
              page={slug}
              blockKey="split.img"
              className="fi2t-gl-split__img fi2t-gl-split__img--editable"
              label="Image présentation"
              alt=""
              fallback={splitImgFallback}
            />
          ) : (
            <img
              className="fi2t-gl-split__img"
              src={splitImgSrc}
              alt=""
              loading="lazy"
              data-cms-page={slug}
              data-cms-block="split.img"
            />
          )}
        </div>
      </section>

      <section className="fi2t-gl-thal-atouts-band" data-cms-section="atouts">
        <header className="fi2t-gl-thal-atouts-band__head">
          <EditableText
            page={slug}
            blockKey="atouts.title"
            as="h2"
            label="Titre atouts"
            fallback={String(s.atoutsTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="atouts.sub"
            as="p"
            label="Sous-titre atouts"
            fallback={String(s.atoutsSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof atoutsFallback)[number]>
          page={slug}
          blockKey="atouts.items"
          label="Atouts"
          className="fi2t-gl-thal-atouts"
          fallback={atoutsFallback}
          emptyItem={{ title: 'Nouvel atout', desc: '', icon: 'sun' }}
          addLabel="Ajouter un atout"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) =>
            `fi2t-gl-card fi2t-gl-thal-atout fi2t-gl-thal-atout--${i + 1}${
              i === 1 ? ' fi2t-gl-thal-atout--row' : ''
            }`
          }
          renderItem={(item, _index, { editField, editImage }) => (
            <>
              <span className="fi2t-gl-card__icon">
                {editImage('icon', '', item.title, <GlIcon name={item.icon} />)}
              </span>
              <div className="fi2t-gl-thal-atout__copy">
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-thal-diag" data-cms-section="diagnostic">
        <header className="fi2t-gl-thal-diag__head">
          <EditableText
            page={slug}
            blockKey="diagnostic.title"
            as="h2"
            label="Titre diagnostic"
            fallback={String(s.diagnosticTitle ?? '')}
          />
        </header>
        <EditableJsonList<(typeof diagFallback)[number]>
          page={slug}
          blockKey="diagnostic.items"
          label="Diagnostic économique"
          className="fi2t-gl-stats fi2t-gl-stats--thal"
          fallback={diagFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', desc: '' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName="fi2t-gl-stat fi2t-gl-stat--thal"
          renderItem={(_item, _index, { editField }) => (
            <>
              <div className="fi2t-gl-stat__value">{editField('value', 'span')}</div>
              <div className="fi2t-gl-stat__label">{editField('label', 'span')}</div>
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-thal-defis" data-cms-section="defis">
        <header className="fi2t-gl-thal-defis__head">
          <EditableText
            page={slug}
            blockKey="defis.title"
            as="h2"
            label="Titre défis"
            fallback={String(s.defisTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="defis.sub"
            as="p"
            label="Sous-titre défis"
            fallback={String(s.defisSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof defisFallback)[number]>
          page={slug}
          blockKey="defis.items"
          label="Défis stratégiques"
          className="fi2t-gl-thal-defis__grid"
          fallback={defisFallback}
          emptyItem={{ title: 'Nouveau défi', desc: '' }}
          addLabel="Ajouter un défi"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-thal-defis__item fi2t-gl-thal-defis__item--${i + 1}`}
          renderItem={(_item, _index, { editField }) => (
            <>
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-thal-plan" data-cms-section="plan">
        <header className="fi2t-gl-thal-plan__head">
          <EditableText
            page={slug}
            blockKey="plan.title"
            as="h2"
            fallback={String(s.planTitle ?? '')}
          />
        </header>
        <EditableJsonList<(typeof planFallback)[number]>
          page={slug}
          blockKey="plan.items"
          label="Plan de relance"
          className="fi2t-gl-numgrid fi2t-gl-numgrid--thal"
          fallback={planFallback}
          emptyItem={{ title: 'Nouvelle action', desc: '' }}
          addLabel="Ajouter une action"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName="fi2t-gl-numcard fi2t-gl-numcard--thal"
          renderItem={(_item, index, { editField }) => (
            <>
              <span className="fi2t-gl-numcard__num">{sequenceNumber(index)}</span>
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>
    </div>
  )
}

function SeniorBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const pourquoiFallback = ((s.pourquoi as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? 'sun',
  }))
  const servicesFallback = ((s.services as IconCard[]) || []).map((c) => ({
    title: c.title,
    icon: c.icon ?? 'clinic',
  }))
  const defisFallback = ((s.defis as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? 'access',
  }))
  const roadmapFallback = ((s.roadmap as TimelineItem[]) || []).map((t) => ({
    title: t.title,
    desc: t.desc ?? '',
  }))

  return (
    <div className="fi2t-gl-sen-stage">
      <section className="fi2t-gl-sen-intro" data-cms-section="intro">
        <EditableText
          page={slug}
          blockKey="intro.body"
          as="p"
          multiline
          label="Introduction"
          fallback={page.intro}
        />
      </section>

      <section className="fi2t-gl-sen-pourquoi" data-cms-section="pourquoi">
        <header className="fi2t-gl-sen-pourquoi__head">
          <EditableText
            page={slug}
            blockKey="pourquoi.title"
            as="h2"
            label="Titre pourquoi"
            fallback={String(s.pourquoiTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="pourquoi.sub"
            as="p"
            label="Sous-titre pourquoi"
            fallback={String(s.pourquoiSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof pourquoiFallback)[number]>
          page={slug}
          blockKey="pourquoi.items"
          label="Pourquoi la Tunisie"
          className="fi2t-gl-sen-pourquoi__cards"
          fallback={pourquoiFallback}
          emptyItem={{ title: 'Nouvel atout', desc: '', icon: 'sun' }}
          addLabel="Ajouter une carte"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-sen-card fi2t-gl-sen-card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-sen-card__icon',
                item.title,
                <img
                  className="fi2t-gl-sen-card__icon"
                  src={`/images/groupement-media/senior-pourquoi-${i + 1}.png?v=2`}
                  alt=""
                  width={48}
                  height={48}
                />,
              )}
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-sen-services" data-cms-section="services">
        <header className="fi2t-gl-sen-services__head">
          <EditableText
            page={slug}
            blockKey="services.title"
            as="h2"
            label="Titre services"
            fallback={String(s.servicesTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="services.sub"
            as="p"
            multiline
            label="Sous-titre services"
            fallback={String(s.servicesSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof servicesFallback)[number]>
          page={slug}
          blockKey="services.items"
          label="Services"
          className="fi2t-gl-sen-services__row"
          fallback={servicesFallback}
          emptyItem={{ title: 'Nouveau service', icon: 'clinic' }}
          addLabel="Ajouter un service"
          fields={[
            { key: 'title', label: 'Texte' },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-sen-services__item fi2t-gl-sen-services__item--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-sen-services__icon',
                item.title,
                <img
                  className="fi2t-gl-sen-services__icon"
                  src={`/images/groupement-media/senior-svc-${i + 1}.png?v=3`}
                  alt=""
                  width={30}
                  height={30}
                />,
              )}
              {editField('title', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-sen-defis" data-cms-section="defis">
        <header className="fi2t-gl-sen-defis__head">
          <EditableText
            page={slug}
            blockKey="defis.title"
            as="h2"
            label="Titre défis"
            fallback={String(s.defisTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="defis.sub"
            as="p"
            label="Sous-titre défis"
            fallback={String(s.defisSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof defisFallback)[number]>
          page={slug}
          blockKey="defis.items"
          label="Défis & Engagements"
          className="fi2t-gl-sen-defis__cards"
          fallback={defisFallback}
          emptyItem={{ title: 'Nouveau défi', desc: '', icon: 'access' }}
          addLabel="Ajouter un défi"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-sen-defis-card fi2t-gl-sen-defis-card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-sen-defis-card__icon',
                item.title,
                <img
                  className="fi2t-gl-sen-defis-card__icon"
                  src={`/images/groupement-media/senior-defis-${i + 1}.png?v=2`}
                  alt=""
                  width={40}
                  height={40}
                />,
              )}
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-sen-roadmap" data-cms-section="roadmap">
        <div className="fi2t-gl-sen-roadmap__copy">
          <EditableText
            page={slug}
            blockKey="roadmap.title"
            as="h2"
            label="Titre feuille de route"
            fallback={String(s.roadmapTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="roadmap.body"
            as="p"
            multiline
            label="Texte feuille de route"
            fallback={String(s.roadmapBody ?? '')}
          />
        </div>
        <EditableJsonList<(typeof roadmapFallback)[number]>
          page={slug}
          blockKey="roadmap.items"
          label="Feuille de route"
          className="fi2t-gl-sen-roadmap__list"
          fallback={roadmapFallback}
          emptyItem={{ title: 'Nouvelle étape', desc: '' }}
          addLabel="Ajouter une étape"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName="fi2t-gl-sen-roadmap__item"
          renderItem={(_item, index, { editField }) => (
            <>
              <span className="fi2t-gl-sen-roadmap__rail">
                <span className="fi2t-gl-sen-roadmap__num">{sequenceNumber(index)}</span>
              </span>
              <div>
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            </>
          )}
        />
      </section>
    </div>
  )
}

function ThermalBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const potFallback = ((s.pot as StatCard[]) || []).map((c) => ({
    value: c.value,
    label: c.label,
    desc: c.desc ?? '',
  }))
  const placesFallback = ((s.places as PlaceCard[]) || []).map((p, i) => ({
    name: p.name,
    tag: p.tag ?? '',
    img: `${String(p.img || `/images/groupement-media/thermal-${['korbous', 'jebel', 'hammam', 'jerba'][i] ?? 'korbous'}-photo.jpg`).split('?')[0]}?v=8`,
  }))
  const defisFallback = ((s.defis as IconCard[]) || []).map((d) => ({
    title: d.title,
    desc: d.desc ?? '',
    icon: d.icon ?? 'building',
  }))
  const roadmapFallback = ((s.roadmap as NumberedCard[]) || []).map((a) => ({
    title: a.title,
    desc: a.desc ?? '',
  }))

  return (
    <div className="fi2t-gl-therm-stage">
      <section className="fi2t-gl-therm-intro" data-cms-section="intro">
        <EditableText
          page={slug}
          blockKey="intro.body"
          as="p"
          multiline
          label="Introduction"
          fallback={page.intro}
        />
      </section>

      <section className="fi2t-gl-therm-pot" data-cms-section="pot">
        <header className="fi2t-gl-therm-pot__head">
          <EditableText
            page={slug}
            blockKey="pot.title"
            as="h2"
            label="Titre potentiel"
            fallback={String(s.potTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="pot.sub"
            as="p"
            multiline
            label="Sous-titre potentiel"
            fallback={String(s.potSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof potFallback)[number]>
          page={slug}
          blockKey="pot.items"
          label="Potentiel du secteur"
          className="fi2t-gl-therm-pot__cards"
          fallback={potFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', desc: '' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-therm-stat fi2t-gl-therm-stat--${i + 1}`}
          renderItem={(_item, i, { editField }) => (
            <>
              <img
                className="fi2t-gl-therm-stat__icon"
                src={`/images/groupement-media/thermal-pot-${i + 1}.png?v=2`}
                alt=""
                width={48}
                height={48}
              />
              <div className="fi2t-gl-therm-stat__value">{editField('value', 'span')}</div>
              <div className="fi2t-gl-therm-stat__label">{editField('label', 'span')}</div>
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-therm-real" data-cms-section="real">
        <div className="fi2t-gl-therm-real__copy">
          <EditableText
            page={slug}
            blockKey="real.title"
            as="h2"
            label="Titre réalité produit"
            fallback={String(s.realTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="real.body"
            as="p"
            multiline
            label="Texte réalité produit"
            fallback={String(s.realBody ?? '')}
          />
          <aside className="fi2t-gl-therm-metric">
            <strong className="fi2t-gl-therm-metric__value">
              <EditableText
                page={slug}
                blockKey="real.metricValue"
                as="span"
                label="Valeur métrique"
                fallback={String(s.realMetricValue ?? '')}
              />
            </strong>
            <EditableText
              page={slug}
              blockKey="real.metricLabel"
              as="span"
              className="fi2t-gl-therm-metric__label"
              label="Libellé métrique"
              fallback={String(s.realMetricLabel ?? '')}
            />
            <EditableText
              page={slug}
              blockKey="real.metricSub"
              as="p"
              multiline
              label="Sous-texte métrique"
              fallback={String(s.realMetricSub ?? '')}
            />
          </aside>
        </div>
        <EditableJsonList<(typeof placesFallback)[number]>
          page={slug}
          blockKey="places.items"
          label="Stations thermales"
          className="fi2t-gl-therm-places"
          fallback={placesFallback}
          emptyItem={{
            name: 'Nouvelle station',
            tag: '',
            img: '/images/groupement-media/thermal-korbous-photo.jpg?v=8',
          }}
          addLabel="Ajouter une station"
          fields={[
            { key: 'name', label: 'Nom' },
            { key: 'tag', label: 'Tag' },
            { key: 'img', label: 'Photo', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-therm-place fi2t-gl-therm-place--${i + 1}`}
          renderItem={(item, _i, { editField, editImage }) => (
            <>
              {editImage('img', 'fi2t-gl-therm-place__image', item.name)}
              <div className="fi2t-gl-therm-place__copy">
                {editField('name', 'strong')}
                {editField('tag', 'span')}
              </div>
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-therm-defis" data-cms-section="defis">
        <header className="fi2t-gl-therm-defis__head">
          <EditableText
            page={slug}
            blockKey="defis.title"
            as="h2"
            label="Titre défis"
            fallback={String(s.defisTitle ?? '')}
          />
        </header>
        <EditableJsonList<(typeof defisFallback)[number]>
          page={slug}
          blockKey="defis.items"
          label="Défis structurels"
          className="fi2t-gl-therm-defis__row"
          fallback={defisFallback}
          emptyItem={{ title: 'Nouveau défi', desc: '', icon: 'building' }}
          addLabel="Ajouter un défi"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-therm-defis-item fi2t-gl-therm-defis-item--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-therm-defis-item__icon',
                item.title,
                <img
                  className="fi2t-gl-therm-defis-item__icon"
                  src={`/images/groupement-media/thermal-defis-${i + 1}.png?v=1`}
                  alt=""
                />,
              )}
              <div>
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-therm-roadmap" data-cms-section="roadmap">
        <header className="fi2t-gl-therm-roadmap__head">
          <EditableText
            page={slug}
            blockKey="roadmap.title"
            as="h2"
            label="Titre feuille de route"
            fallback={String(s.roadmapTitle ?? '')}
          />
        </header>
        <EditableJsonList<(typeof roadmapFallback)[number]>
          page={slug}
          blockKey="roadmap.items"
          label="Feuille de route"
          className="fi2t-gl-therm-roadmap__grid"
          fallback={roadmapFallback}
          emptyItem={{ title: 'Nouvelle action', desc: '' }}
          addLabel="Ajouter une action"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-therm-numcard fi2t-gl-therm-numcard--${i + 1}`}
          renderItem={(_item, i, { editField }) => (
            <>
              <span className="fi2t-gl-therm-numcard__num">{sequenceNumber(i)}</span>
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>
    </div>
  )
}

function MedicalBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const advFallback = ((s.adv as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? '',
  }))
  const barsFallback = ((s.bars as BarItem[]) || []).map((b) => ({
    label: b.label,
    pct: String(b.pct),
    fill: b.fill ?? '',
  }))
  const diagFallback = ((s.diag as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? '',
  }))
  const actionsFallback = ((s.actions as NumberedCard[]) || []).map((a) => ({
    title: a.title,
    desc: a.desc ?? '',
  }))

  return (
    <div className="fi2t-gl-med-stage">
      <section className="fi2t-gl-med-intro" data-cms-section="intro">
        <EditableText
          page={slug}
          blockKey="intro.body"
          as="p"
          multiline
          label="Introduction"
          fallback={page.intro}
        />
      </section>

      <section className="fi2t-gl-med-adv" data-cms-section="adv">
        <EditableText
          page={slug}
          blockKey="adv.title"
          as="h2"
          className="fi2t-gl-med-adv__title"
          label="Titre avantages"
          fallback={String(s.advTitle ?? '')}
        />
        <EditableJsonList<(typeof advFallback)[number]>
          page={slug}
          blockKey="adv.items"
          label="Avantages"
          className="fi2t-gl-med-adv__grid"
          fallback={advFallback}
          emptyItem={{ title: 'Nouvel avantage', desc: '', icon: '' }}
          addLabel="Ajouter un avantage"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-med-adv__card fi2t-gl-med-adv__card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-med-adv__icon',
                item.title,
                <img
                  className="fi2t-gl-med-adv__icon"
                  src={`/images/groupement-media/medical-adv-${i + 1}.png?v=4`}
                  alt=""
                />,
              )}
              <div className="fi2t-gl-med-adv__copy">
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-med-origin" data-cms-section="origin">
        <div className="fi2t-gl-med-origin__inner">
          <div className="fi2t-gl-med-origin__left">
            <EditableText
              page={slug}
              blockKey="origin.title"
              as="h2"
              multiline
              label="Titre origine"
              fallback={String(s.originTitle ?? '')}
            />
            <EditableText
              page={slug}
              blockKey="origin.sub"
              as="p"
              multiline
              label="Sous-titre origine"
              fallback={String(s.originSub ?? '')}
            />
            <EditableJsonList<(typeof barsFallback)[number]>
              page={slug}
              blockKey="bars.items"
              label="Répartition pays"
              className="fi2t-gl-med-bars"
              fallback={barsFallback}
              emptyItem={{ label: 'Nouveau pays', pct: '10', fill: '#00A98D' }}
              addLabel="Ajouter un pays"
              fields={[
                { key: 'label', label: 'Pays' },
                { key: 'pct', label: 'Pourcentage', percent: true, min: 0, max: 100, step: 1 },
              ]}
              itemClassName="fi2t-gl-med-bars__item"
              renderItem={(item, _i, { editField }) => {
                const pct = Number(item.pct) || 0
                const fill = item.fill || '#00A98D'
                return (
                  <>
                    <div className="fi2t-gl-med-bars__row">
                      {editField('label', 'span')}
                      <strong style={{ color: fill }}>{pct}%</strong>
                    </div>
                    <div className="fi2t-gl-med-bars__track">
                      <i style={{ width: `${pct}%`, background: fill }} />
                    </div>
                  </>
                )
              }}
            />
          </div>
          <div className="fi2t-gl-med-donut" aria-label={`${s.donutValue} ${s.donutLabel}`}>
            <div className="fi2t-gl-med-donut__inner">
              <EditableText
                page={slug}
                blockKey="donut.value"
                as="strong"
                label="Donut — Valeur"
                fallback={String(s.donutValue ?? '')}
              />
              <EditableText
                page={slug}
                blockKey="donut.label"
                as="span"
                label="Donut — Libellé"
                fallback={String(s.donutLabel ?? '')}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="fi2t-gl-med-diag" data-cms-section="diag">
        <EditableText
          page={slug}
          blockKey="diag.intro"
          as="p"
          className="fi2t-gl-med-diag__intro"
          multiline
          label="Intro diagnostic"
          fallback={String(s.diagIntro ?? '')}
        />
        <EditableJsonList<(typeof diagFallback)[number]>
          page={slug}
          blockKey="diag.items"
          label="Diagnostic"
          className="fi2t-gl-med-diag__row"
          fallback={diagFallback}
          emptyItem={{ title: 'Nouveau défi', desc: '', icon: '' }}
          addLabel="Ajouter un diagnostic"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-med-diag__card fi2t-gl-med-diag__card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-med-diag__icon',
                item.title,
                <img
                  className="fi2t-gl-med-diag__icon"
                  src={`/images/groupement-media/medical-diag-${i + 1}.png?v=3`}
                  alt=""
                  width={56}
                  height={56}
                />,
              )}
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-med-actions" data-cms-section="actions">
        <EditableText
          page={slug}
          blockKey="actions.title"
          as="h2"
          className="fi2t-gl-med-actions__title"
          label="Titre actions"
          fallback={String(s.actionsTitle ?? '')}
        />
        <EditableJsonList<(typeof actionsFallback)[number]>
          page={slug}
          blockKey="actions.items"
          label="Actions"
          className="fi2t-gl-med-actions__grid"
          fallback={actionsFallback}
          emptyItem={{ title: 'Nouvelle action', desc: '' }}
          addLabel="Ajouter une action"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-med-action fi2t-gl-med-action--${i + 1}`}
          renderItem={(_item, i, { editField }) => (
            <div className="fi2t-gl-med-action__inner">
              <span className="fi2t-gl-med-action__num">{sequenceNumber(i)}</span>
              <div className="fi2t-gl-med-action__copy">
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            </div>
          )}
        />
      </section>
    </div>
  )
}

function AventureBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const marketFallback = ((s.market as StatCard[]) || []).map((m) => ({
    value: m.value,
    label: m.label,
  }))
  const photosFallback = ((s.photos as string[]) || []).map((img) => ({
    img: String(img),
  }))
  const freinsFallback = ((s.freins as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? '',
  }))
  const roadmapFallback = ((s.roadmap as TimelineItem[]) || []).map((t) => ({
    title: t.title,
    desc: t.desc ?? '',
  }))

  return (
    <div className="fi2t-gl-av-stage">
      <section className="fi2t-gl-av-top" data-cms-section="intro">
        <section className="fi2t-gl-av-intro">
          <EditableText
            page={slug}
            blockKey="intro.body"
            as="p"
            multiline
            label="Introduction"
            fallback={page.intro}
          />
        </section>
        <section className="fi2t-gl-av-market" data-cms-section="market">
          <div className="fi2t-gl-av-market__copy">
            <EditableText
              page={slug}
              blockKey="market.title"
              as="h2"
              label="Titre marché"
              fallback={String(s.marketTitle ?? '')}
            />
            <EditableText
              page={slug}
              blockKey="market.body"
              as="p"
              multiline
              label="Texte marché"
              fallback={String(s.marketBody ?? '')}
            />
          </div>
          <EditableJsonList<(typeof marketFallback)[number]>
            page={slug}
            blockKey="market.items"
            label="KPIs marché"
            className="fi2t-gl-av-market__kpis"
            fallback={marketFallback}
            emptyItem={{ value: '0', label: 'Nouveau KPI' }}
            addLabel="Ajouter un KPI"
            fields={[
              { key: 'value', label: 'Valeur' },
              { key: 'label', label: 'Libellé' },
            ]}
            itemClassName="fi2t-gl-av-kpi"
            renderItem={(_item, _i, { editField }) => (
              <>
                <strong>{editField('value', 'span')}</strong>
                {editField('label', 'span')}
              </>
            )}
          />
        </section>
      </section>

      <section className="fi2t-gl-av-wealth" data-cms-section="wealth">
        <EditableJsonList<(typeof photosFallback)[number]>
          page={slug}
          blockKey="photos.items"
          label="Photos richesse"
          className="fi2t-gl-av-wealth__photos"
          fallback={photosFallback}
          emptyItem={{ img: '/images/groupement-media/aventure-1.jpg?v=2' }}
          addLabel="Ajouter une photo"
          fields={[{ key: 'img', label: 'Photo', image: true }]}
          itemClassName={(_item, i) => `fi2t-gl-av-wealth__photo fi2t-gl-av-wealth__photo--${i + 1}`}
          renderItem={(item, _i, { editImage }) =>
            editImage('img', 'fi2t-gl-av-wealth__photo-img', 'Photo aventure', (
              <img src={item.img} alt="" className="fi2t-gl-av-wealth__photo-img" />
            ))
          }
        />
        <div className="fi2t-gl-av-wealth__copy">
          <EditableText
            page={slug}
            blockKey="wealth.title"
            as="h2"
            label="Titre richesse"
            fallback={String(s.wealthTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="wealth.body"
            as="p"
            multiline
            label="Texte richesse"
            fallback={String(s.wealthBody ?? '')}
          />
          <aside className="fi2t-gl-av-callout">
            <strong className="fi2t-gl-av-callout__value">
              <EditableText
                page={slug}
                blockKey="wealth.metricValue"
                as="span"
                label="Métrique — Valeur"
                fallback={String(s.wealthMetricValue ?? '')}
              />
            </strong>
            <EditableText
              page={slug}
              blockKey="wealth.metricLabel"
              as="span"
              className="fi2t-gl-av-callout__label"
              label="Métrique — Libellé"
              fallback={String(s.wealthMetricLabel ?? '')}
            />
            <EditableText
              page={slug}
              blockKey="wealth.metricSub"
              as="p"
              multiline
              label="Métrique — Sous-texte"
              fallback={String(s.wealthMetricSub ?? '')}
            />
          </aside>
        </div>
      </section>

      <section className="fi2t-gl-av-freins" data-cms-section="freins">
        <header className="fi2t-gl-av-freins__head">
          <EditableText
            page={slug}
            blockKey="freins.title"
            as="h2"
            label="Titre freins"
            fallback={String(s.freinsTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="freins.sub"
            as="p"
            multiline
            label="Sous-titre freins"
            fallback={String(s.freinsSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof freinsFallback)[number]>
          page={slug}
          blockKey="freins.items"
          label="Freins"
          className="fi2t-gl-av-freins__row"
          fallback={freinsFallback}
          emptyItem={{ title: 'Nouveau frein', desc: '', icon: '' }}
          addLabel="Ajouter un frein"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-av-freins__card fi2t-gl-av-freins__card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-av-freins__icon',
                item.title,
                <img
                  className="fi2t-gl-av-freins__icon"
                  src={`/images/groupement-media/aventure-freins-${i + 1}.png?v=2`}
                  alt=""
                  width={64}
                  height={64}
                />,
              )}
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-av-roadmap" data-cms-section="roadmap">
        <div className="fi2t-gl-av-roadmap__copy">
          <EditableText
            page={slug}
            blockKey="roadmap.title"
            as="h2"
            multiline
            label="Titre feuille de route"
            fallback={String(s.roadmapTitle ?? 'Feuille de\nRoute Fi2T')}
          />
          <EditableText
            page={slug}
            blockKey="roadmap.sub"
            as="p"
            multiline
            label="Sous-titre feuille de route"
            fallback={String(s.roadmapSub ?? '')}
          />
        </div>
        <EditableJsonList<(typeof roadmapFallback)[number]>
          page={slug}
          blockKey="roadmap.items"
          label="Feuille de route"
          className="fi2t-gl-av-roadmap__list"
          fallback={roadmapFallback}
          emptyItem={{ title: 'Nouvelle action', desc: '' }}
          addLabel="Ajouter une action"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName="fi2t-gl-av-roadmap__item"
          renderItem={(_item, i, { editField }) => (
            <>
              <span className="fi2t-gl-av-roadmap__num">{sequenceNumber(i)}</span>
              <div>
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            </>
          )}
        />
      </section>
    </div>
  )
}

function AffaireBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const mondialFallback = ((s.mondial as StatCard[]) || []).map((m) => ({
    value: m.value,
    label: m.label,
    desc: m.desc ?? '',
  }))
  const tnFallback = ((s.tnStats as StatCard[]) || []).map((x) => ({
    value: x.value,
    label: x.label,
  }))
  const atoutsFallback = ((s.atouts as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? '',
  }))
  const diagFallback = ((s.diag as IconCard[]) || []).map((d) => ({
    title: d.title,
    desc: d.desc ?? '',
    icon: d.icon ?? '',
  }))
  const axesFallback = ((s.axes as { title: string; desc: string; link: string }[]) || []).map((a) => ({
    title: a.title,
    desc: a.desc ?? '',
    link: a.link ?? '',
  }))

  return (
    <div className="fi2t-gl-aff-stage">
      <section className="fi2t-gl-aff-mondial" data-cms-section="mondial">
        <EditableText
          page={slug}
          blockKey="mondial.title"
          as="h2"
          className="fi2t-gl-aff-mondial__title"
          label="Titre poids mondial"
          fallback={String(s.mondialTitle || 'Poids Économique Mondial')}
        />
        <EditableJsonList<(typeof mondialFallback)[number]>
          page={slug}
          blockKey="mondial.items"
          label="Poids économique mondial"
          className="fi2t-gl-aff-mondial__row"
          fallback={mondialFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', desc: '' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-aff-mondial__col fi2t-gl-aff-mondial__col--${i + 1}`}
          renderItem={(_item, _i, { editField }) => (
            <>
              <strong>{editField('value', 'span')}</strong>
              {editField('label', 'span')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-aff-tn" data-cms-section="tn">
        <EditableText
          page={slug}
          blockKey="tn.title"
          as="h2"
          className="fi2t-gl-aff-tn__title"
          label="Titre Tunisie"
          fallback={String(s.tnTitle ?? '')}
        />
        <EditableText
          page={slug}
          blockKey="tn.body"
          as="p"
          className="fi2t-gl-aff-tn__body"
          multiline
          label="Texte Tunisie"
          fallback={String(s.tnBody ?? '')}
        />
        <EditableJsonList<(typeof tnFallback)[number]>
          page={slug}
          blockKey="tn.stats"
          label="Chiffres Tunisie"
          className="fi2t-gl-aff-tn__stats"
          fallback={tnFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur', multiline: true },
            { key: 'label', label: 'Libellé', multiline: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-aff-tn__row fi2t-gl-aff-tn__row--${i + 1}`}
          renderItem={(_item, i, { editField }) => (
            <>
              <div className={`fi2t-gl-aff-tn__pill fi2t-gl-aff-tn__pill--${i + 1}`}>
                <strong>{editField('value', 'span')}</strong>
              </div>
              {editField('label', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-aff-atouts" data-cms-section="atouts">
        <EditableText
          page={slug}
          blockKey="atouts.title"
          as="h2"
          className="fi2t-gl-aff-atouts__title"
          label="Titre atouts"
          fallback={String(s.atoutsTitle ?? '')}
        />
        <EditableText
          page={slug}
          blockKey="atouts.sub"
          as="p"
          className="fi2t-gl-aff-atouts__sub"
          multiline
          label="Sous-titre atouts"
          fallback={String(s.atoutsSub ?? '')}
        />
        <EditableJsonList<(typeof atoutsFallback)[number]>
          page={slug}
          blockKey="atouts.items"
          label="Atouts stratégiques"
          className="fi2t-gl-aff-atouts__grid"
          fallback={atoutsFallback}
          emptyItem={{ title: 'Nouvel atout', desc: '', icon: '' }}
          addLabel="Ajouter un atout"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-aff-atouts__card fi2t-gl-aff-atouts__card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-aff-atouts__icon',
                item.title,
                <img
                  className="fi2t-gl-aff-atouts__icon"
                  src={`/images/groupement-media/affaire-atout-${i + 1}.png?v=2`}
                  alt=""
                />,
              )}
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-aff-diag" data-cms-section="diag">
        <div className="fi2t-gl-aff-diag__copy">
          <EditableText
            page={slug}
            blockKey="diag.title"
            as="h2"
            multiline
            label="Titre diagnostic"
            fallback={String(s.diagTitle || 'Diagnostic\nStratégique\n&\nContraintes')}
          />
          <EditableText
            page={slug}
            blockKey="diag.body"
            as="p"
            multiline
            label="Texte diagnostic"
            fallback={String(s.diagBody ?? '')}
          />
        </div>
        <EditableJsonList<(typeof diagFallback)[number]>
          page={slug}
          blockKey="diag.items"
          label="Diagnostic"
          className="fi2t-gl-aff-diag__grid"
          fallback={diagFallback}
          emptyItem={{ title: 'Nouveau point', desc: '', icon: '' }}
          addLabel="Ajouter un point"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-aff-diag__cell fi2t-gl-aff-diag__cell--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              <div className="fi2t-gl-aff-diag__head">
                {editImage(
                  'icon',
                  'fi2t-gl-aff-diag__icon',
                  item.title,
                  <img
                    className="fi2t-gl-aff-diag__icon"
                    src={`/images/groupement-media/affaire-diag-${i + 1}.png?v=2`}
                    alt=""
                  />,
                )}
                {editField('title', 'h3')}
              </div>
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-aff-axes" data-cms-section="axes">
        <header className="fi2t-gl-aff-axes__head">
          <EditableText
            page={slug}
            blockKey="axes.title"
            as="h2"
            label="Titre axes"
            fallback={String(s.axesTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="axes.sub"
            as="p"
            multiline
            label="Sous-titre axes"
            fallback={String(s.axesSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof axesFallback)[number]>
          page={slug}
          blockKey="axes.items"
          label="Axes stratégiques"
          className="fi2t-gl-aff-axes__row"
          fallback={axesFallback}
          emptyItem={{ title: 'Nouvel axe', desc: '', link: '' }}
          addLabel="Ajouter un axe"
          fields={[
            { key: 'title', label: 'Titre', multiline: true },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'link', label: 'Libellé lien' },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-aff-axe fi2t-gl-aff-axe--${i + 1}`}
          renderItem={(_item, i, { editField }) => (
            <>
              <span className="fi2t-gl-aff-axe__num">{sequenceNumber(i, 'AXE 01')}</span>
              {editField('title', 'h3')}
              {editField('desc', 'p')}
              <div className="fi2t-gl-aff-axe__link">
                <img src="/images/groupement-media/affaire-check.png?v=2" alt="" width={19} height={19} />
                <em>{editField('link', 'span')}</em>
              </div>
            </>
          )}
        />
      </section>
    </div>
  )
}

function GolfBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const { isEditMode } = useEditMode()
  const s = page.sections
  const potFallback = ((s.pot as StatCard[]) || []).map((m) => ({
    value: m.value,
    label: m.label,
    icon: m.icon ?? '',
  }))
  const etatFallback = ((s.etatStats as StatCard[]) || []).map((x) => ({
    value: x.value,
    label: x.label,
  }))
  const defisFallback = ((s.defis as IconCard[]) || []).map((d) => ({
    title: d.title,
    desc: d.desc ?? '',
    icon: d.icon ?? '',
  }))
  const roadmapFallback = ((s.roadmap as NumberedCard[]) || []).map((r) => ({
    title: r.title,
    desc: r.desc ?? '',
  }))
  const bannerFallback = String(
    s.banner ||
      "Un touriste golfeur dépense en moyenne **50% de plus** qu'un touriste balnéaire classique.",
  )
  const { value: bannerValue } = useContentBlock(slug, 'banner.text', {
    type: 'text',
    label: 'Bandeau',
    fallback: bannerFallback,
  })

  return (
    <div className="fi2t-gl-golf-stage">
      <section className="fi2t-gl-golf-pot" data-cms-section="pot">
        <EditableText
          page={slug}
          blockKey="pot.title"
          as="h2"
          className="fi2t-gl-golf-pot__title"
          label="Titre potentiel"
          fallback={String(s.potTitle ?? '')}
        />
        <EditableText
          page={slug}
          blockKey="pot.sub"
          as="p"
          className="fi2t-gl-golf-pot__sub"
          multiline
          label="Sous-titre potentiel"
          fallback={String(s.potSub ?? '')}
        />
        <EditableJsonList<(typeof potFallback)[number]>
          page={slug}
          blockKey="pot.items"
          label="Potentiel mondial"
          className="fi2t-gl-golf-pot__row"
          fallback={potFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', icon: '' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-golf-pot__card fi2t-gl-golf-pot__card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-golf-pot__icon',
                item.label,
                <img
                  className="fi2t-gl-golf-pot__icon"
                  src={`/images/groupement-media/golf-pot-${i + 1}.png?v=1`}
                  alt=""
                />,
              )}
              <strong>{editField('value', 'span')}</strong>
              {editField('label', 'span')}
            </>
          )}
        />
        <aside className="fi2t-gl-golf-banner">
          <img src="/images/groupement-media/golf-info.png?v=1" alt="" width={30} height={30} />
          {isEditMode ? (
            <EditableText
              page={slug}
              blockKey="banner.text"
              as="p"
              multiline
              label="Bandeau"
              fallback={bannerFallback}
            />
          ) : (
            <RichLine text={bannerValue || bannerFallback} />
          )}
        </aside>
      </section>

      <section className="fi2t-gl-golf-etat" data-cms-section="etat">
        <article className="fi2t-gl-golf-etat__card">
          <EditableText
            page={slug}
            blockKey="etat.title"
            as="h2"
            label="Titre état des lieux"
            fallback={String(s.etatTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="etat.body"
            as="p"
            className="fi2t-gl-golf-etat__body"
            multiline
            label="Texte état des lieux"
            fallback={String(s.etatBody ?? '')}
          />
          <EditableJsonList<(typeof etatFallback)[number]>
            page={slug}
            blockKey="etat.stats"
            label="Stats Tunisie"
            className="fi2t-gl-golf-etat__stats"
            fallback={etatFallback}
            emptyItem={{ value: '0', label: 'Nouveau chiffre' }}
            addLabel="Ajouter un chiffre"
            fields={[
              { key: 'value', label: 'Valeur' },
              { key: 'label', label: 'Libellé' },
            ]}
            itemClassName={(_item, i) => `fi2t-gl-golf-etat__stat fi2t-gl-golf-etat__stat--${i + 1}`}
            renderItem={(_item, _i, { editField }) => (
              <>
                <strong>{editField('value', 'span')}</strong>
                {editField('label', 'span')}
              </>
            )}
          />
        </article>
        <aside className="fi2t-gl-golf-etat__box">
          <EditableText
            page={slug}
            blockKey="etat.box"
            as="strong"
            label="Box — Valeur"
            fallback={String(s.etatBox ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="etat.boxLabel"
            as="h3"
            label="Box — Libellé"
            fallback={String(s.etatBoxLabel ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="etat.boxSub"
            as="p"
            multiline
            label="Box — Sous-texte"
            fallback={String(s.etatBoxSub ?? '')}
          />
        </aside>
      </section>

      <section className="fi2t-gl-golf-defis" data-cms-section="defis">
        <header className="fi2t-gl-golf-defis__head">
          <EditableText
            page={slug}
            blockKey="defis.title"
            as="h2"
            label="Titre défis"
            fallback={String(s.defisTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="defis.sub"
            as="p"
            multiline
            label="Sous-titre défis"
            fallback={String(s.defisSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof defisFallback)[number]>
          page={slug}
          blockKey="defis.items"
          label="Défis stratégiques"
          className="fi2t-gl-golf-defis__grid"
          fallback={defisFallback}
          emptyItem={{ title: 'Nouveau défi', desc: '', icon: '' }}
          addLabel="Ajouter un défi"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-golf-defis__card fi2t-gl-golf-defis__card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-golf-defis__icon',
                item.title,
                <img
                  className="fi2t-gl-golf-defis__icon"
                  src={`/images/groupement-media/golf-def-${i + 1}.png?v=2`}
                  alt=""
                />,
              )}
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-golf-map" data-cms-section="map">
        <header className="fi2t-gl-golf-map__head">
          <EditableText
            page={slug}
            blockKey="roadmap.title"
            as="h2"
            label="Titre feuille de route"
            fallback={String(s.roadmapTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="roadmap.sub"
            as="p"
            multiline
            label="Sous-titre feuille de route"
            fallback={String(s.roadmapSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof roadmapFallback)[number]>
          page={slug}
          blockKey="roadmap.items"
          label="Feuille de route"
          className="fi2t-gl-golf-map__grid"
          fallback={roadmapFallback}
          emptyItem={{ title: 'Nouvelle action', desc: '' }}
          addLabel="Ajouter une action"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-golf-map__card fi2t-gl-golf-map__card--${i + 1}`}
          renderItem={(_item, i, { editField }) => (
            <>
              <strong>{sequenceNumber(i, '01')}</strong>
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>
    </div>
  )
}

function PlaisanceBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const impactFallback = ((s.impactCards as IconCard[]) || []).map((c) => ({
    title: c.title,
    desc: c.desc ?? '',
    icon: c.icon ?? '',
  }))
  const probsFallback = ((s.probs as IconCard[]) || []).map((d) => ({
    title: d.title,
    desc: d.desc ?? '',
    icon: d.icon ?? '',
  }))
  const actionsFallback = ((s.actions as string[]) || []).map((text) => ({ text }))
  const marinaFallback = String(s.marinaImg || '/images/groupement-media/plaisance-marina.jpg?v=3')
  const blueprintFallback = String(s.blueprint || '/images/groupement-media/plaisance-blueprint.jpg?v=3')

  return (
    <div className="fi2t-gl-plais-stage">
      <section className="fi2t-gl-plais-impact" data-cms-section="impact">
        <div className="fi2t-gl-plais-impact__left">
          <EditableText
            page={slug}
            blockKey="impact.title"
            as="h2"
            multiline
            label="Titre impact"
            fallback={String(s.impactTitle || 'Un Impact Économique\nDécuplé')}
          />
          <EditableJsonList<(typeof impactFallback)[number]>
            page={slug}
            blockKey="impact.items"
            label="Cartes impact"
            className="fi2t-gl-plais-impact__cards"
            fallback={impactFallback}
            emptyItem={{ title: 'Nouvelle carte', desc: '', icon: '' }}
            addLabel="Ajouter une carte"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
              { key: 'icon', label: 'Icône', image: true },
            ]}
            itemClassName={(_item, i) => `fi2t-gl-plais-impact__card fi2t-gl-plais-impact__card--${i + 1}`}
            renderItem={(item, i, { editField, editImage }) => (
              <>
                <span className="fi2t-gl-plais-impact__chip">
                  {editImage(
                    'icon',
                    'fi2t-gl-plais-impact__icon',
                    item.title,
                    <img
                      className="fi2t-gl-plais-impact__icon"
                      src={`/images/groupement-media/plaisance-impact-glyph-${i + 1}.png?v=2`}
                      alt=""
                    />,
                  )}
                </span>
                <div className="fi2t-gl-plais-impact__copy">
                  {editField('title', 'h3')}
                  {editField('desc', 'p')}
                </div>
              </>
            )}
          />
        </div>
        <EditableImage
          page={slug}
          blockKey="marina.img"
          className="fi2t-gl-plais-impact__marina"
          label="Photo marina"
          alt="Marina"
          fallback={marinaFallback}
        />
      </section>

      <section className="fi2t-gl-plais-parent" data-cms-section="parent">
        <EditableImage
          page={slug}
          blockKey="parent.icon"
          className="fi2t-gl-plais-parent__icon"
          label="Icône parent pauvre"
          alt=""
          fallback={String(s.parentIcon || '/images/groupement-media/plaisance-parent-icon.png?v=2')}
        />
        <EditableText
          page={slug}
          blockKey="parent.title"
          as="h2"
          label="Titre parent pauvre"
          fallback={String(s.parentTitle ?? '')}
        />
        <EditableText
          page={slug}
          blockKey="parent.body"
          as="p"
          multiline
          label="Texte parent pauvre"
          fallback={String(s.parentBody ?? '')}
        />
        <span className="fi2t-gl-plais-parent__bar" aria-hidden />
      </section>

      <section className="fi2t-gl-plais-probs" data-cms-section="prob">
        <header className="fi2t-gl-plais-probs__head">
          <EditableText
            page={slug}
            blockKey="prob.title"
            as="h2"
            label="Titre problématiques"
            fallback={String(s.probTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="prob.sub"
            as="p"
            multiline
            label="Sous-titre problématiques"
            fallback={String(s.probSub ?? '')}
          />
        </header>
        <EditableJsonList<(typeof probsFallback)[number]>
          page={slug}
          blockKey="prob.items"
          label="Problématiques"
          className="fi2t-gl-plais-probs__grid"
          fallback={probsFallback}
          emptyItem={{ title: 'Nouvelle problématique', desc: '', icon: '' }}
          addLabel="Ajouter une problématique"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          itemClassName={(_item, i) => `fi2t-gl-plais-probs__card fi2t-gl-plais-probs__card--${i + 1}`}
          renderItem={(item, i, { editField, editImage }) => (
            <>
              {editImage(
                'icon',
                'fi2t-gl-plais-probs__icon',
                item.title,
                <img
                  className="fi2t-gl-plais-probs__icon"
                  src={`/images/groupement-media/plaisance-prob-${i + 1}.png?v=2`}
                  alt=""
                />,
              )}
              {editField('title', 'h3')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-plais-actions" data-cms-section="actions">
        <div className="fi2t-gl-plais-actions__left">
          <EditableText
            page={slug}
            blockKey="actions.title"
            as="h2"
            multiline
            label="Titre actions"
            fallback={String(s.actionsTitle || 'Actions à\nentreprendre')}
          />
          <EditableText
            page={slug}
            blockKey="actions.body"
            as="p"
            multiline
            label="Texte actions"
            fallback={String(s.actionsBody ?? '')}
          />
          <EditableImage
            page={slug}
            blockKey="blueprint.img"
            className="fi2t-gl-plais-actions__blueprint"
            label="Schéma blueprint"
            alt="Schéma"
            fallback={blueprintFallback}
          />
        </div>
        <EditableJsonList<(typeof actionsFallback)[number]>
          page={slug}
          blockKey="actions.items"
          label="Actions"
          className="fi2t-gl-plais-actions__list"
          fallback={actionsFallback}
          emptyItem={{ text: 'Nouvelle action' }}
          addLabel="Ajouter une action"
          fields={[{ key: 'text', label: 'Texte' }]}
          itemClassName={(_item, i) => `fi2t-gl-plais-actions__item fi2t-gl-plais-actions__item--${i + 1}`}
          renderItem={(_item, i, { editField }) => (
            <>
              <span>{String(i + 1).padStart(2, '0')}</span>
              <em>{editField('text', 'span')}</em>
            </>
          )}
        />
      </section>
    </div>
  )
}

function AutoBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const { isEditMode } = useEditMode()
  const s = page.sections
  const statsFallback = ((s.stats as { value: string; label: string; desc: string; tone: string }[]) || []).map(
    (x) => ({
      value: x.value,
      label: x.label,
      desc: x.desc ?? '',
      tone: x.tone || 'light',
    }),
  )
  const realItemsFallback = ((s.realItems as string[]) || []).map((text) => ({ text }))
  const actionsItemsFallback = ((s.actionsItems as string[]) || []).map((text) => ({ text }))
  const realImgFallback = String(s.realImg || '/images/groupement-media/auto-road.jpg?v=2')
  const actionsImgFallback = String(s.actionsImg || '/images/groupement-media/auto-hands.jpg?v=2')
  const visionBodyFallback = String(s.visionBody ?? '')
  const visionBody = useContentBlock(slug, 'vision.body', {
    type: 'text',
    label: 'Texte vision',
    fallback: visionBodyFallback,
  })
  const boldVision = (text: string) => {
    const parts = text.split(/(road trips|caravaning|rallyes)/gi)
    return parts.map((part, i) =>
      /^(road trips|caravaning|rallyes)$/i.test(part) ? <strong key={i}>{part}</strong> : part,
    )
  }
  const dash = (i: number, last: number, kind: 'real' | 'actions') => {
    if (kind === 'actions' && i === 2) return '-\u00a0 '
    if (kind === 'real' && i === last) return '-\u00a0\u00a0'
    if (kind === 'real') return '-\u00a0\u00a0\u00a0'
    return '-\u00a0\u00a0'
  }

  return (
    <div className="fi2t-gl-auto-stage">
      <section className="fi2t-gl-auto-vision" data-cms-section="vision">
        <EditableText
          page={slug}
          blockKey="vision.title"
          as="h2"
          className="fi2t-gl-auto-vision__title"
          label="Titre vision"
          fallback={String(s.visionTitle ?? '')}
        />
        {isEditMode ? (
          <EditableText
            page={slug}
            blockKey="vision.body"
            as="p"
            className="fi2t-gl-auto-vision__body"
            multiline
            label="Texte vision"
            fallback={visionBodyFallback}
          />
        ) : (
          <p className="fi2t-gl-auto-vision__body" data-cms-page={slug} data-cms-block="vision.body">
            {boldVision(visionBody.value || visionBodyFallback)}
          </p>
        )}
      </section>

      <section className="fi2t-gl-auto-stats-band" data-cms-section="stats">
        <EditableJsonList<(typeof statsFallback)[number]>
          page={slug}
          blockKey="stats.items"
          label="Chiffres clés"
          className="fi2t-gl-auto-stats-row"
          fallback={statsFallback}
          emptyItem={{ value: '0', label: 'NOUVEAU', desc: '', tone: 'light' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'tone', label: 'Ton (light/dark)' },
          ]}
          itemClassName={(item, i) =>
            `fi2t-gl-auto-stat-card fi2t-gl-auto-stat-card--${item.tone || 'light'} fi2t-gl-auto-stat-card--${i + 1}`
          }
          renderItem={(item, _i, { editField, editable }) => (
            <>
              <strong>{editable ? editField('value', 'span') : <Num>{item.value}</Num>}</strong>
              {editField('label', 'span')}
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-auto-real" data-cms-section="real">
        <div className="fi2t-gl-auto-real__copy">
          <EditableText
            page={slug}
            blockKey="real.title"
            as="h2"
            label="Titre réalité"
            fallback={String(s.realTitle ?? '')}
          />
          <div className="fi2t-gl-auto-real__text">
            <EditableText
              page={slug}
              blockKey="real.body"
              as="p"
              className="fi2t-gl-auto-real__lead"
              multiline
              label="Intro réalité"
              fallback={String(s.realBody ?? '')}
            />
            <EditableJsonList<(typeof realItemsFallback)[number]>
              page={slug}
              blockKey="real.items"
              label="Atouts réalité"
              className="fi2t-gl-auto-real__list"
              fallback={realItemsFallback}
              emptyItem={{ text: 'Nouvel atout' }}
              addLabel="Ajouter un atout"
              fields={[{ key: 'text', label: 'Texte' }]}
              itemClassName={(_item, i) => `fi2t-gl-auto-real__item fi2t-gl-auto-real__item--${i + 1}`}
              renderItem={(_item, i, { editField }) => (
                <>
                  <span aria-hidden>{dash(i, realItemsFallback.length - 1, 'real')}</span>
                  {editField('text', 'span')}
                </>
              )}
            />
          </div>
        </div>
        <EditableImage
          page={slug}
          blockKey="real.img"
          className="fi2t-gl-auto-real__img"
          label="Photo réalité"
          alt=""
          fallback={realImgFallback}
        />
      </section>

      <section className="fi2t-gl-auto-actions" data-cms-section="actions">
        <EditableImage
          page={slug}
          blockKey="actions.img"
          className="fi2t-gl-auto-actions__img"
          label="Photo actions"
          alt=""
          fallback={actionsImgFallback}
        />
        <div className="fi2t-gl-auto-actions__copy">
          <EditableText
            page={slug}
            blockKey="actions.title"
            as="h2"
            label="Titre actions"
            fallback={String(s.actionsTitle ?? '')}
          />
          <div className="fi2t-gl-auto-actions__text">
            <EditableJsonList<(typeof actionsItemsFallback)[number]>
              page={slug}
              blockKey="actions.items"
              label="Actions"
              className="fi2t-gl-auto-actions__list"
              fallback={actionsItemsFallback}
              emptyItem={{ text: 'Nouvelle action' }}
              addLabel="Ajouter une action"
              fields={[{ key: 'text', label: 'Texte' }]}
              itemClassName={(_item, i) => `fi2t-gl-auto-actions__item fi2t-gl-auto-actions__item--${i + 1}`}
              renderItem={(_item, i, { editField }) => (
                <>
                  <span aria-hidden>{dash(i, actionsItemsFallback.length - 1, 'actions')}</span>
                  {editField('text', 'span')}
                </>
              )}
            />
            <EditableText
              page={slug}
              blockKey="actions.body"
              as="p"
              className="fi2t-gl-auto-actions__lead"
              multiline
              label="Conclusion actions"
              fallback={String(s.actionsBody ?? '')}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

/** Columns in the values grid — drives how many pager dots the section needs. */
const HEB_VALUES_PER_PAGE = 4

type HebergementType = { name: string; desc: string; img: string; wide?: boolean }

function HebergementsBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const typesFallback = (s.types as HebergementType[]).map((t) => ({
    name: t.name,
    desc: t.desc,
    img: t.img,
    wide: t.wide ? '1' : '0',
  }))
  const hebValueIcon: Record<string, string> = {
    leaf: '/images/groupement-media/heb-value-durabilite.png?v=3',
    quill: '/images/groupement-media/heb-value-authenticite.png?v=3',
    people: '/images/groupement-media/heb-value-interaction.png?v=3',
    heart: '/images/groupement-media/heb-value-impact.png?v=3',
  }
  const valuesFallback = (s.values as IconCard[]).map((v) => ({
    title: v.title,
    desc: v.desc ?? '',
    icon: v.icon?.startsWith('/') ? v.icon : (hebValueIcon[v.icon ?? ''] ?? hebValueIcon.leaf),
  }))
  const statsFallback = (s.growthStats as (StatCard & { suffix?: string })[]).map((x) => ({
    value: x.value,
    label: x.label,
    suffix: x.suffix ?? '',
  }))
  const diagFallback = (
    s.diag as { title: string; desc: string; side?: string }[]
  ).map((d, i) => ({
    title: d.title,
    desc: d.desc,
    side: d.side ?? (i % 2 === 0 ? 'left' : 'right'),
  }))

  return (
    <>
      <section className="fi2t-gl-intro fi2t-gl-intro--heb" data-cms-section="intro">
        <EditableText
          page={slug}
          blockKey="intro.body"
          as="p"
          className="fi2t-gl-intro--heb__lead"
          multiline
          fallback={page.intro}
        />
        <EditableText
          page={slug}
          blockKey="intro.lead"
          as="h2"
          fallback={String(s.introLead ?? '')}
        />
        <EditableText
          page={slug}
          blockKey="intro.copy"
          as="p"
          multiline
          fallback={String(s.introBody ?? '')}
        />
      </section>

      <EditableJsonList<(typeof typesFallback)[number]>
        page={slug}
        blockKey="types.items"
        label="Typologies"
        className="fi2t-gl-heb-types fi2t-gl-heb-types--live"
        fallback={typesFallback}
        emptyItem={{ name: 'Nouvelle typologie', desc: '', img: '/images/groupement-media/heb-ecolodge-photo.jpg', wide: '0' }}
        addLabel="Ajouter une typologie"
        fields={[
          { key: 'name', label: 'Nom' },
          { key: 'desc', label: 'Description', multiline: true },
          { key: 'img', label: 'Image', image: true },
          { key: 'wide', label: 'Carte large (1 = oui, 0 = non)' },
        ]}
        transform={(items) =>
          items.map((t) => ({
            name: String(t.name ?? ''),
            desc: String(t.desc ?? ''),
            img: String(t.img ?? ''),
            wide: String(t.wide) === 'true' || t.wide === '1' ? '1' : '0',
          }))
        }
        itemClassName={(item, index) =>
          `fi2t-gl-typecard fi2t-gl-typecard--pos-${index}${item.wide === '1' ? ' fi2t-gl-typecard--wide' : ' fi2t-gl-typecard--narrow'}`
        }
        renderItem={(item, _index, { editField, editImage }) => (
          <>
            {editImage('img', 'fi2t-gl-typecard__image', item.name)}
            <div className="fi2t-gl-typecard__copy">
              {editField('name', 'strong')}
              {editField('desc', 'p')}
            </div>
          </>
        )}
      />

      <section className="fi2t-gl-band fi2t-gl-band--white fi2t-gl-heb-values" data-cms-section="values">
        <EditableJsonList<(typeof valuesFallback)[number]>
          page={slug}
          blockKey="values.items"
          label="Valeurs"
          className="fi2t-gl-values"
          fallback={valuesFallback}
          emptyItem={{
            title: 'Nouvelle valeur',
            desc: '',
            icon: '/images/groupement-media/heb-value-durabilite.png?v=3',
          }}
          addLabel="Ajouter une valeur"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône', image: true },
          ]}
          transform={(items) =>
            items.map((v) => {
              const raw = String(v.icon ?? '')
              return {
                title: String(v.title ?? ''),
                desc: String(v.desc ?? ''),
                icon: raw.startsWith('/') ? raw : (hebValueIcon[raw] ?? hebValueIcon.leaf),
              }
            })
          }
          itemClassName="fi2t-gl-values__item"
          renderItem={(item, _index, { editField, editImage }) => (
            <>
              <span className="fi2t-gl-values__icon">
                {editImage('icon', '', item.title)}
              </span>
              {editField('title', 'strong')}
              {editField('desc', 'p')}
            </>
          )}
          renderAfter={(items) => {
            const pages = Math.ceil(items.length / HEB_VALUES_PER_PAGE)
            return (
              <div className="fi2t-gl-values__dots" aria-hidden="true">
                {pages > 1
                  ? Array.from({ length: pages }, (_, i) => (
                      <i key={i} className={i === 0 ? 'is-active' : undefined} />
                    ))
                  : null}
              </div>
            )
          }}
        />
      </section>

      <section className="fi2t-gl-band fi2t-gl-band--soft fi2t-gl-heb-growth" data-cms-section="growth">
        <div className="fi2t-gl-split__text">
          <EditableText
            page={slug}
            blockKey="growth.title"
            as="h2"
            fallback={String(s.growthTitle ?? '')}
          />
          <EditableText
            page={slug}
            blockKey="growth.body"
            as="p"
            multiline
            fallback={String(s.growthBody ?? '')}
          />
        </div>
        <EditableJsonList<(typeof statsFallback)[number]>
          page={slug}
          blockKey="growth.stats"
          label="Chiffres"
          className="fi2t-gl-stack-cards"
          fallback={statsFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', suffix: '' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'suffix', label: 'Suffixe' },
            { key: 'label', label: 'Libellé', multiline: true },
          ]}
          itemClassName="fi2t-gl-stat"
          renderItem={(item, _index, { editField, editable }) => (
            <>
              <div className="fi2t-gl-stat__value-row">
                <div className="fi2t-gl-stat__value">{editField('value', 'span')}</div>
                {(item.suffix || editable) ? (
                  <div className="fi2t-gl-stat__suffix">{editField('suffix', 'span')}</div>
                ) : null}
              </div>
              <div className="fi2t-gl-stat__label">{editField('label', 'span')}</div>
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-band fi2t-gl-band--white fi2t-gl-heb-diag" data-cms-section="diag">
        <header className="fi2t-gl-head">
          <EditableText
            page={slug}
            blockKey="diag.title"
            as="h2"
            fallback={String(s.diagTitle ?? '')}
          />
        </header>
        <EditableJsonList<(typeof diagFallback)[number]>
          page={slug}
          blockKey="diag.items"
          label="Diagnostic"
          className="fi2t-gl-zigzag"
          fallback={diagFallback}
          emptyItem={{ title: 'Nouveau point', desc: '', side: 'left' }}
          addLabel="Ajouter un point"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'side', label: 'Côté (left/right)' },
          ]}
          itemClassName={(item, index) =>
            `fi2t-gl-zigzag__item fi2t-gl-zigzag__item--${item.side || (index % 2 === 0 ? 'left' : 'right')}`
          }
          renderItem={(item, index, { editField }) => {
            const side = item.side || (index % 2 === 0 ? 'left' : 'right')
            const copy = (
              <div className="fi2t-gl-zigzag__copy">
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            )
            const num = <span className="fi2t-gl-zigzag__num">{sequenceNumber(index)}</span>
            const empty = <span className="fi2t-gl-zigzag__empty" aria-hidden="true" />
            return side === 'left' ? (
              <>
                {copy}
                {num}
                {empty}
              </>
            ) : (
              <>
                {empty}
                {num}
                {copy}
              </>
            )
          }}
        />
      </section>
    </>
  )
}

function CulturelBody({ page, slug }: { page: CustomGroupementPage; slug: string }) {
  const s = page.sections
  const cultDiagIcon: Record<string, string> = {
    alert: '/images/groupement-media/culturel-diag-alert.png?v=4',
    sync: '/images/groupement-media/culturel-diag-sync.png?v=4',
    megaphone: '/images/groupement-media/culturel-diag-megaphone.png?v=4',
  }
  const statsFallback = (s.stats as (StatCard & { icon?: string; desc?: string })[]).map((x) => ({
    value: x.value,
    label: x.label,
    desc: x.desc ?? '',
    icon: x.icon ?? 'globe',
  }))
  const atoutsFallback = (s.atouts as IconCard[]).map((a) => ({
    title: a.title,
    desc: a.desc ?? '',
    icon: a.icon ?? 'landmark',
  }))
  const diagFallback = (s.diag as IconCard[]).map((d) => {
    const raw = d.icon ?? 'alert'
    return {
      title: d.title,
      desc: d.desc ?? '',
      icon: raw.startsWith('/') ? raw : (cultDiagIcon[raw] ?? cultDiagIcon.alert),
    }
  })
  const roadmapFallback = (s.roadmap as TimelineItem[]).map((t) => ({
    title: t.title,
    desc: t.desc ?? '',
  }))
  const artisanFallback = `${String(s.artisanImg ?? '/images/groupement-media/culturel-artisanat.png').split('?')[0]}?v=9`

  return (
    <>
      <section className="fi2t-gl-intro fi2t-gl-cult-intro" data-cms-section="intro">
        <EditableText page={slug} blockKey="intro.body" as="p" multiline fallback={page.intro} />
      </section>

      <section className="fi2t-gl-band fi2t-gl-band--white fi2t-gl-cult-stats" data-cms-section="stats">
        <EditableJsonList<(typeof statsFallback)[number]>
          page={slug}
          blockKey="stats.items"
          label="Chiffres clés"
          className="fi2t-gl-stats fi2t-gl-stats--culturel"
          fallback={statsFallback}
          emptyItem={{ value: '0', label: 'Nouveau chiffre', desc: '', icon: 'globe' }}
          addLabel="Ajouter un chiffre"
          fields={[
            { key: 'value', label: 'Valeur' },
            { key: 'label', label: 'Libellé' },
            { key: 'desc', label: 'Description', multiline: true },
            { key: 'icon', label: 'Icône (globe/euro/chart ou chemin image)' },
          ]}
          itemClassName="fi2t-gl-stat fi2t-gl-stat--culturel"
          renderItem={(item, _index, { editField }) => (
            <>
              <span className="fi2t-gl-stat__icon">
                {item.icon?.startsWith('/') ? <img src={item.icon} alt="" /> : <GlIcon name={item.icon} />}
              </span>
              <div className="fi2t-gl-stat__value">{editField('value', 'span')}</div>
              <div className="fi2t-gl-stat__label">{editField('label', 'span')}</div>
              {editField('desc', 'p')}
            </>
          )}
        />
      </section>

      <section className="fi2t-gl-cult-atouts" data-cms-section="atouts">
        <div className="fi2t-gl-cult-atouts__copy">
          <EditableText page={slug} blockKey="atouts.title" as="h2" fallback={String(s.atoutsTitle ?? '')} />
          <EditableText
            page={slug}
            blockKey="atouts.body"
            as="p"
            multiline
            fallback={String(s.atoutsBody ?? '')}
          />
          <EditableJsonList<(typeof atoutsFallback)[number]>
            page={slug}
            blockKey="atouts.items"
            label="Atouts"
            className="fi2t-gl-atout-list fi2t-gl-atout-list--grid"
            fallback={atoutsFallback}
            emptyItem={{ title: 'Nouvel atout', desc: '', icon: 'landmark' }}
            addLabel="Ajouter un atout"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
              { key: 'icon', label: 'Icône (landmark/plane ou chemin image)' },
            ]}
            itemClassName="fi2t-gl-atout-list__item fi2t-gl-atout-list__item--stack"
            renderItem={(item, _index, { editField }) => (
              <>
                <span className="fi2t-gl-card__icon">
                  {item.icon?.startsWith('/') ? <img src={item.icon} alt="" /> : <GlIcon name={item.icon} />}
                </span>
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </>
            )}
          />
        </div>
        <div className="fi2t-gl-quote-media">
          <EditableImage
            page={slug}
            blockKey="artisan.img"
            label="Artisanat"
            className="fi2t-gl-quote-media__img"
            fallback={artisanFallback}
            alt=""
          />
          <EditableText
            page={slug}
            blockKey="quote.value"
            as="blockquote"
            multiline
            fallback={String(s.quote ?? '')}
          />
        </div>
      </section>

      <section className="fi2t-gl-band fi2t-gl-band--white fi2t-gl-cult-diag" data-cms-section="diag">
        <CultDiagStage>
          <header className="fi2t-gl-head fi2t-gl-head--center">
            <EditableText page={slug} blockKey="diag.title" as="h2" fallback={String(s.diagTitle ?? '')} />
            <EditableText page={slug} blockKey="diag.sub" as="p" fallback={String(s.diagSub ?? '')} />
          </header>
          <EditableJsonList<(typeof diagFallback)[number]>
            page={slug}
            blockKey="diag.items"
            label="Diagnostic"
            className="fi2t-gl-cult-diag__cards"
            fallback={diagFallback}
            emptyItem={{
              title: 'Nouveau point',
              desc: '',
              icon: '/images/groupement-media/culturel-diag-alert.png?v=4',
            }}
            addLabel="Ajouter un point"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
              { key: 'icon', label: 'Icône', image: true },
            ]}
            transform={(items) =>
              items.map((d) => {
                const raw = String(d.icon ?? '')
                return {
                  title: String(d.title ?? ''),
                  desc: String(d.desc ?? ''),
                  icon: raw.startsWith('/') ? raw : (cultDiagIcon[raw] ?? cultDiagIcon.alert),
                }
              })
            }
            itemClassName="fi2t-gl-cult-diag__card"
            renderItem={(item, _index, { editField, editImage }) => (
              <>
                <span className="fi2t-gl-cult-diag__icon">
                  {editImage('icon', '', item.title)}
                </span>
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </>
            )}
          />
        </CultDiagStage>
      </section>

      <section className="fi2t-gl-band fi2t-gl-cult-roadmap fi2t-gl-roadmap-split" data-cms-section="roadmap">
        <div>
          <EditableText page={slug} blockKey="roadmap.title" as="h2" fallback={String(s.roadmapTitle ?? '')} />
          <EditableText
            page={slug}
            blockKey="roadmap.body"
            as="p"
            multiline
            fallback={String(s.roadmapBody ?? '')}
          />
        </div>
        <EditableJsonList<(typeof roadmapFallback)[number]>
          page={slug}
          blockKey="roadmap.items"
          label="Feuille de route"
          className="fi2t-gl-roadmap-list"
          fallback={roadmapFallback}
          emptyItem={{ title: 'Nouvelle étape', desc: '' }}
          addLabel="Ajouter une étape"
          fields={[
            { key: 'title', label: 'Titre' },
            { key: 'desc', label: 'Description', multiline: true },
          ]}
          itemClassName="fi2t-gl-roadmap-list__item"
          renderItem={(_item, index, { editField }) => (
            <>
              <span>{sequenceNumber(index)}</span>
              <div>
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </div>
            </>
          )}
        />
      </section>
    </>
  )
}

const LAYOUTS: Record<string, (p: CustomGroupementPage, slug: string) => ReactNode> = {
  thalasso: (p, slug) => <ThalassoBody page={p} slug={slug} />,
  senior: (p, slug) => <SeniorBody page={p} slug={slug} />,
  thermal: (p, slug) => <ThermalBody page={p} slug={slug} />,
  medical: (p, slug) => <MedicalBody page={p} slug={slug} />,
  aventure: (p, slug) => <AventureBody page={p} slug={slug} />,
  affaire: (p, slug) => <AffaireBody page={p} slug={slug} />,
  golf: (p, slug) => <GolfBody page={p} slug={slug} />,
  plaisance: (p, slug) => <PlaisanceBody page={p} slug={slug} />,
  auto: (p, slug) => <AutoBody page={p} slug={slug} />,
  hebergements: (p, slug) => <HebergementsBody page={p} slug={slug} />,
  culturel: (p, slug) => <CulturelBody page={p} slug={slug} />,
  hub: (p, slug) => <HubBody page={p} slug={slug} />,
  segment: (p, slug) => <SegmentBody page={p} slug={slug} />,
}

export function hasCustomGroupementLayout(slug: string) {
  return Boolean(getCustomGroupementPage(slug))
}

export default function GroupementCustomBody({ slug }: { slug: string }) {
  const { i18n } = useTranslation()
  const { get } = useContent()
  const locale = (i18n.language || 'fr').split('-')[0]
  const fallback = getCustomGroupementPage(slug, locale)
  if (!fallback) return null
  /*
   * The page is stored as one CMS block per band (`atouts.data`, `plan.data`…).
   * Rebuild the flat object the layouts expect so live edits reach visitors
   * while un-edited bands stay byte-identical to the Figma defaults.
   */
  const page = blocksToPage(fallback, (key) => get(key, '') || undefined)
  const render = LAYOUTS[page.layout]
  if (!render) return null
  return (
    <div className={`fi2t-gl fi2t-gl--${page.layout}`} data-cms-page={slug}>
      <GroupementHero title={page.heroTitle} slug={slug}>
        <ParentCrumb slug={slug} />
      </GroupementHero>
      {render(page, slug)}
      {page.layout === 'hebergements' || page.layout === 'culturel' || page.layout === 'hub' || page.layout === 'thalasso' || page.layout === 'senior' || page.layout === 'thermal' || page.layout === 'medical' || page.layout === 'aventure' || page.layout === 'affaire' || page.layout === 'segment' || page.layout === 'golf' || page.layout === 'plaisance' || page.layout === 'auto'
        ? null
        : <CustomPageEditor slug={slug} page={page} />}
    </div>
  )
}
