import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage, { useEditableImageSrc, useEditableImageAlt } from '../cms/EditableImage'
import EditableJsonList from '../cms/EditableJsonList'
import EditablePositioned from '../cms/EditablePositioned'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import { GROUPEMENTS, type GroupementItem } from '../lib/groupements'

const OBJECTIFS_PER_PAGE = 4

/** Objectives are numbered from their position, so editors never type it. */
const objectifNumber = (index: number) => String(index + 1).padStart(2, '0')

function ObjectifsDots({
  itemCount,
  page,
  onPage,
  editMode,
}: {
  itemCount: number
  page: number
  onPage: (page: number) => void
  editMode: boolean
}) {
  const pageCount = Math.ceil(itemCount / OBJECTIFS_PER_PAGE)

  useEffect(() => {
    if (pageCount === 0) return
    if (page > pageCount - 1) onPage(pageCount - 1)
  }, [page, pageCount, onPage])

  // Only when there is another page to reach — no decorative spare dots.
  if (pageCount <= 1) return null

  return (
    <div className="fi2t-dots" role="tablist" aria-label="Pages des objectifs">
      {Array.from({ length: pageCount }, (_, i) => {
        const active = i === page
        return (
          <button
            key={i}
            type="button"
            className={active ? 'is-active' : undefined}
            aria-label={`Page ${i + 1}`}
            aria-current={active ? 'true' : undefined}
            onClick={() => {
              if (!editMode) onPage(i)
            }}
          />
        )
      })}
    </div>
  )
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NewsArrowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2 6h7M6.5 2.5L10 6l-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CtaLeadIcon() {
  return (
    <svg className="fi2t-cta__btn-icon" width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <path
        d="M2.25 7.5h8.5M7.5 3.75 11.25 7.5 7.5 11.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type ObjectifItem = { title: string; desc: string }
type ReasonItem = { title: string; desc: string }
type NewsItem = { slug: string; title: string; desc: string; date: string; img: string }

const OBJECTIFS_FALLBACK: ObjectifItem[] = [
  {
    title: 'Vision stratégique',
    desc: 'Apporter sa contribution en matière de vision stratégique et pratique pour la diversification et l’innovation touristique en Tunisie',
  },
  {
    title: 'Intérêts des membres',
    desc: 'Sauvegarder les intérêts économiques et sociaux de ses membres',
  },
  {
    title: 'Synergie',
    desc: 'Créer une synergie entre les différents opérateurs du tourisme tunisien',
  },
  {
    title: 'Développement',
    desc: 'Contribuer au développement et à l’essor du tourisme tunisien',
  },
]

const REASONS_FALLBACK: ReasonItem[] = [
  {
    title: 'Représentation Institutionnelle',
    desc: 'Être représenté auprès des gouvernements et institutions',
  },
  {
    title: 'Réseautage Stratégique',
    desc: 'Participer à un réseau professionnel structuré',
  },
  {
    title: 'Visibilité Accrue',
    desc: 'Améliorer sa visibilité et ses opportunités commerciales',
  },
  {
    title: 'Label de Qualité',
    desc: 'Bénéficier d’un label de qualité et de conformité',
  },
  {
    title: 'Ressources & Expertise',
    desc: 'Accéder à des ressources professionnelles et formations, renforçant ainsi sa compétitivité sur le marché tunisien et international',
  },
]

const NEWS_FALLBACK: NewsItem[] = [
  {
    slug: 'walid-tritar-president-fi2t',
    title: 'Tourisme: Walid Tritar, nouveau Président de la Fi2T',
    desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
    date: '11 Mai 2026',
    img: '/images/act1.jpg?v=home2',
  },
  {
    slug: 'secteur-sous-pression',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive....',
    date: '22 Mai 2026',
    img: '/images/act2.jpg?v=home2',
  },
  {
    slug: 'houssem-azouz-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act3.jpg?v=home2',
  },
]

function HomeInner() {
  const { t } = useTranslation()
  const { isEditMode } = useEditMode()
  const [objectifsPage, setObjectifsPage] = useState(0)
  const heroImgSrc = useEditableImageSrc('home', 'hero.image', '/hero.jpg')
  const heroImgAlt = useEditableImageAlt('home', 'hero.image', 'FI2T')
  const aboutImgSrc = useEditableImageSrc('home', 'about.image', '/images/qui-sommes-nous-card.png?v=home2')
  const groupementsBgSrc = useEditableImageSrc('home', 'groupements.bg', '/images/bg 1.png')
  const ctaBgSrc = useEditableImageSrc('home', 'cta.bg', '/images/bg--1.png')

  return (
    <div className="fi2t-home">
      <section className="fi2t-hero" data-cms-section="hero">
        {/* Plain <img> keeps absolute full-bleed CSS; pencil opens the image panel. */}
        <img
          src={heroImgSrc}
          alt={heroImgAlt}
          className="fi2t-hero__bg"
          data-cms-page="home"
          data-cms-block="hero.image"
          data-cms-type="image"
        />
        {isEditMode && (
          <EditableImage
            page="home"
            blockKey="hero.image"
            variant="chip"
            label="Image hero"
            alt="FI2T"
            className="fi2t-hero__edit-chip"
            fallback="/hero.jpg"
          />
        )}
        <div className="fi2t-hero__overlay" aria-hidden="true" />
        <div className="fi2t-hero__content">
          <EditableText
            page="home"
            blockKey="hero.title"
            as="h1"
            className="fi2t-hero__title"
            fallback="Le futur du tourisme tunisien se construit ici !"
          />
          <EditableText
            page="home"
            blockKey="hero.subtitle"
            as="p"
            className="fi2t-hero__subtitle"
            fallback="Unir, innover et valoriser le tourisme tunisien"
          />
          <div className="fi2t-hero__actions">
            <Link to="/qui-sommes-nous" className="fi2t-btn fi2t-btn--light">
              <EditableText page="home" blockKey="hero.cta_primary" as="span" fallback="Découvrir la Fédération" />
            </Link>
            <Link to="/fiche-adhesion" className="fi2t-btn fi2t-btn--ghost">
              <EditableText page="home" blockKey="hero.cta_secondary" as="span" fallback="Adhérer maintenant" />
            </Link>
          </div>
        </div>
      </section>

      <section className="fi2t-section fi2t-about" id="about" data-cms-section="about">
        <div className="fi2t-about__text">
          <EditableText page="home" blockKey="about.title" as="h2" fallback="Qui sommes-nous ?" />
          <EditableText
            page="home"
            blockKey="about.body"
            as="p"
            multiline
            fallback="La Fédération Interprofessionnelle du Tourisme Tunisien est un syndicat professionnel patronal indépendant fondé en mars 2016 par divers opérateurs du tourisme tunisien, venant d’activités différentes : agences de voyages, hébergements alternatifs, loisirs, animation, sports, transports…"
          />
          <Link to="/qui-sommes-nous" className="fi2t-btn fi2t-btn--primary">
            <EditableText page="home" blockKey="about.cta" as="span" fallback="Voir plus" />
          </Link>
        </div>
        <div className="fi2t-about__media">
          <img
            src={aboutImgSrc}
            alt="Qui sommes-nous"
            className="fi2t-about__image"
            data-cms-page="home"
            data-cms-block="about.image"
            data-cms-type="image"
          />
          {isEditMode && (
            <EditableImage
              page="home"
              blockKey="about.image"
              variant="chip"
              label="Image à propos"
              className="fi2t-about__edit-chip"
              fallback="/images/qui-sommes-nous-card.png?v=home2"
            />
          )}
          <EditablePositioned
            page="home"
            blockKey="about.badge_pos"
            label="Badge 10+ — Position"
            className="fi2t-about__badge"
            fallback={{ left: -29, bottom: -43 }}
          >
            <EditableText
              page="home"
              blockKey="about.badge"
              as="p"
              className="fi2t-stat-badge"
              multiline
              fallback={"10+\nANNÉES D'ENGAGEMENT"}
            />
          </EditablePositioned>
        </div>
      </section>

      <section className="fi2t-objectifs-wrap" id="objectifs" data-cms-section="objectifs">
        <div className="fi2t-section fi2t-objectifs-section">
          <EditableText page="home" blockKey="objectifs.title" as="h2" className="fi2t-objectifs-section__title" fallback="Nos Objectifs" />
          <EditableText
            page="home"
            blockKey="objectifs.intro"
            as="p"
            className="fi2t-objectifs-section__intro"
            multiline
            fallback="La Fi2T a pour objectif de fédérer différents opérateurs de tourisme au sein d'un même syndicat professionnel, en vue"
          />
          <EditableJsonList<ObjectifItem>
            page="home"
            blockKey="objectifs.items"
            label="Objectifs — Liste"
            className="fi2t-objectifs"
            itemClassName={( _item, index) => {
              const base = 'fi2t-objectif-card'
              if (isEditMode) return base
              const start = objectifsPage * OBJECTIFS_PER_PAGE
              if (index < start || index >= start + OBJECTIFS_PER_PAGE) {
                return `${base} is-page-hidden`
              }
              return base
            }}
            fallback={OBJECTIFS_FALLBACK}
            emptyItem={() => ({ title: 'Nouvel objectif', desc: 'Description…' })}
            addLabel="Ajouter un objectif"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
            ]}
            renderItem={(_item, index, { editField }) => (
              <>
                {/* Numbered by position: reordering or deleting can't leave a gap. */}
                <span className="fi2t-objectif-card__num">{objectifNumber(index)}</span>
                {editField('title', 'h3')}
                {editField('desc', 'p')}
              </>
            )}
            renderAfter={(items) => (
              <ObjectifsDots
                itemCount={items.length}
                page={objectifsPage}
                onPage={setObjectifsPage}
                editMode={isEditMode}
              />
            )}
          />
        </div>
      </section>

      <section className="fi2t-groupements" id="groupements" data-cms-section="groupements">
        <img
          src={groupementsBgSrc}
          alt=""
          className="fi2t-groupements__bg"
          data-cms-page="home"
          data-cms-block="groupements.bg"
          data-cms-type="image"
        />
        {isEditMode && (
          <EditableImage
            page="home"
            blockKey="groupements.bg"
            variant="chip"
            label="Fond groupements"
            className="fi2t-groupements__edit-chip"
            fallback="/images/bg 1.png"
          />
        )}
        <div className="fi2t-groupements__overlay" />
        <div className="fi2t-groupements__inner">
          <EditableText page="home" blockKey="groupements.title" as="h2" fallback="Les Groupements Professionnels" />
          <EditableText
            page="home"
            blockKey="groupements.intro"
            as="p"
            multiline
            className="fi2t-groupements__intro"
            fallback="Dirigés par 3 membres élus, ils représentent et défendent les intérêts des opérateurs. Chaque groupement définit sa stratégie en toute autonomie pour une expertise métier ciblée."
          />
          <EditableJsonList<GroupementItem>
            page="home"
            blockKey="groupements.items"
            label="Groupements — Cartes"
            className="fi2t-groupements__grid"
            shared={false}
            fallback={GROUPEMENTS}
            emptyItem={{ label: 'Nouveau groupement', slug: '', icon: '/images/icon1.png?v=5' }}
            addLabel="Ajouter un groupement"
            fields={[
              { key: 'label', label: 'Nom' },
              { key: 'slug', label: 'Slug (URL)' },
              { key: 'icon', label: 'Icône', image: true, iconPick: true },
            ]}
            renderItem={(item, _index, { editable, editField, editImage }) => {
              const card = (
                <>
                  <div className="fi2t-group-card__icon">
                    {editImage('icon', undefined, item.label)}
                  </div>
                  {editField('label', 'p')}
                </>
              )

              if (editable || !item.slug) {
                return <div className="fi2t-group-card">{card}</div>
              }

              return (
                <Link to={`/${item.slug}`} className="fi2t-group-card">
                  {card}
                </Link>
              )
            }}
          />
        </div>
      </section>

      <section className="fi2t-section fi2t-adherer" id="adherer" data-cms-section="adherer">
        <div className="fi2t-adherer__media">
          <EditableImage
            page="home"
            blockKey="adherer.image"
            className="fi2t-adherer__image"
            alt="Adhésion"
            fallback="/images/Rectangle 27.png"
          />
          <EditablePositioned
            page="home"
            blockKey="adherer.badge_pos"
            label="Badge 50+ — Position"
            className="fi2t-adherer__badge"
            fallback={{ right: -26, bottom: -49 }}
          >
            <EditableText
              page="home"
              blockKey="adherer.badge"
              as="p"
              className="fi2t-stat-badge"
              multiline
              fallback={"50+\nMEMBRES ACTIFS"}
            />
          </EditablePositioned>
        </div>
        <div className="fi2t-adherer__content">
          <EditableText page="home" blockKey="adherer.title" as="h2" fallback="Pourquoi adhérer à la Fi2T ?" />
          <EditableJsonList<ReasonItem>
            page="home"
            blockKey="adherer.reasons"
            label="Adhérer — Raisons"
            className="fi2t-reasons"
            itemClassName="fi2t-reasons__item"
            fallback={REASONS_FALLBACK}
            emptyItem={{ title: 'Nouveau bénéfice', desc: 'Description…' }}
            addLabel="Ajouter un bénéfice"
            fields={[
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
            ]}
            renderItem={(_item, _index, { editField }) => (
              <>
                <img
                  src="/images/adherer-check.svg"
                  alt=""
                  className="fi2t-reasons__check"
                  width={20}
                  height={20}
                  aria-hidden="true"
                />
                <div>
                  {editField('title', 'strong')}
                  {editField('desc', 'span')}
                </div>
              </>
            )}
          />
          <Link to="/fiche-adhesion" className="fi2t-btn fi2t-btn--primary">
            <EditableText page="home" blockKey="adherer.cta" as="span" fallback="Adhérer maintenant" />
          </Link>
        </div>
      </section>

      <section className="fi2t-news" id="actualites" data-cms-section="actualites">
        <div className="fi2t-section">
          <div className="fi2t-news__head">
            <EditableText page="home" blockKey="actualites.title" as="h2" fallback="Dernières Actualités" />
            <Link to="/actualites" className="fi2t-btn fi2t-btn--primary">
              <EditableText page="home" blockKey="actualites.cta" as="span" fallback="Voir plus" />
            </Link>
          </div>
          <div className="fi2t-news__carousel">
            <button type="button" className="fi2t-news__arrow fi2t-news__arrow--prev" aria-label={t('fi2t.ui.prev_article')}>
              <ChevronIcon dir="left" />
            </button>
            <EditableJsonList<NewsItem>
              page="home"
              blockKey="actualites.items"
              label="Actualités — Cartes"
              className="fi2t-news__grid"
              itemClassName="fi2t-news-card"
              fallback={NEWS_FALLBACK}
              emptyItem={{
                slug: '',
                title: 'Nouveau titre',
                desc: 'Extrait…',
                date: '1 Janvier 2026',
                img: '/images/act1.jpg',
              }}
              addLabel="Ajouter une actualité"
              fields={[
                { key: 'title', label: 'Titre', multiline: true },
                { key: 'desc', label: 'Extrait', multiline: true },
                { key: 'date', label: 'Date' },
                { key: 'img', label: 'Image', image: true },
                { key: 'slug', label: 'Slug article' },
              ]}
              renderItem={(item, index, { editable, editField, editImage }) => (
                <>
                  {editable ? (
                    editImage('img', 'fi2t-news-card__media', item.title)
                  ) : (
                    <img
                      src={
                        index < 3
                          ? `/images/act${index + 1}-home.jpg?v=1`
                          : item.img || '/images/act1.jpg'
                      }
                      alt={item.title}
                      className="fi2t-news-card__media"
                    />
                  )}
                  <div className="fi2t-news-card__body">
                    {editField('title', 'h3')}
                    {editField('desc', 'p')}
                    <footer>
                      {editField('date', 'time')}
                      {!editable && item.slug ? (
                        <Link
                          to={`/actualites/${item.slug}`}
                          className="fi2t-news-card__link"
                          aria-label={t('fi2t.ui.read_more')}
                        >
                          <NewsArrowIcon />
                        </Link>
                      ) : (
                        <span className="fi2t-news-card__link" aria-hidden="true">
                          <NewsArrowIcon />
                        </span>
                      )}
                    </footer>
                  </div>
                </>
              )}
            />
            <button type="button" className="fi2t-news__arrow fi2t-news__arrow--next" aria-label={t('fi2t.ui.next_article')}>
              <ChevronIcon dir="right" />
            </button>
          </div>
        </div>
      </section>

      <section className="fi2t-cta" data-cms-section="cta">
        <img
          src={ctaBgSrc}
          alt=""
          className="fi2t-cta__bg"
          data-cms-page="home"
          data-cms-block="cta.bg"
          data-cms-type="image"
        />
        {isEditMode && (
          <EditableImage
            page="home"
            blockKey="cta.bg"
            variant="chip"
            label="Fond CTA"
            className="fi2t-cta__edit-chip"
            fallback="/images/bg--1.png"
          />
        )}
        <div className="fi2t-cta__overlay" />
        <div className="fi2t-cta__inner">
          <EditableText page="home" blockKey="cta.title" as="h2" fallback="Rejoignez notre vision pour le futur" />
          <EditableText
            page="home"
            blockKey="cta.body"
            as="p"
            multiline
            fallback="Devenez membre de la Fédération et participez activement à la construction d'un tourisme tunisien d'exception."
          />
          <div className="fi2t-hero__actions">
            <Link to="/fiche-adhesion" className="fi2t-btn fi2t-btn--light">
              <CtaLeadIcon />
              <EditableText page="home" blockKey="cta.primary" as="span" fallback="Rejoindre la fédération" />
            </Link>
            <Link to="/contact" className="fi2t-btn fi2t-btn--ghost">
              <EditableText page="home" blockKey="cta.secondary" as="span" fallback="Contacter le bureau" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Fi2tHomePage() {
  return (
    <ContentProvider page="home">
      <HomeInner />
      <EditToolbar />
    </ContentProvider>
  )
}
