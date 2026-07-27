import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditableJsonList from '../cms/EditableJsonList'
import EditToolbar from '../cms/EditToolbar'
import { useEditMode } from '../cms/EditModeProvider'
import { GROUPEMENTS, type GroupementItem } from '../lib/groupements'

const OBJECTIFS_PER_PAGE = 4

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
  const pageCount = itemCount === 0 ? 0 : Math.max(1, Math.ceil(itemCount / OBJECTIFS_PER_PAGE))

  useEffect(() => {
    if (pageCount === 0) return
    if (page > pageCount - 1) onPage(pageCount - 1)
  }, [page, pageCount, onPage])

  if (pageCount === 0) return null

  // In edit mode every card is visible — still show accurate page count (1 if ≤4 items)
  return (
    <div className="fi2t-dots" role="tablist" aria-label="Pages des objectifs">
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          type="button"
          className={i === Math.min(page, pageCount - 1) ? 'is-active' : undefined}
          aria-label={`Page ${i + 1}`}
          aria-current={i === Math.min(page, pageCount - 1) ? 'true' : undefined}
          onClick={() => {
            if (!editMode) onPage(i)
          }}
        />
      ))}
    </div>
  )
}

function ChevronIcon({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type ObjectifItem = { num: string; title: string; desc: string }
type ReasonItem = { title: string; desc: string }
type NewsItem = { slug: string; title: string; desc: string; date: string; img: string }

const OBJECTIFS_FALLBACK: ObjectifItem[] = [
  {
    num: '01',
    title: 'Vision stratégique',
    desc: 'Apporter sa contribution en matière de vision stratégique et pratique pour la diversification et l’innovation touristique en Tunisie',
  },
  {
    num: '02',
    title: 'Intérêts des membres',
    desc: 'Sauvegarder les intérêts économiques et sociaux de ses membres',
  },
  {
    num: '03',
    title: 'Synergie',
    desc: 'Créer une synergie entre les différents opérateurs du tourisme tunisien',
  },
  {
    num: '04',
    title: 'Développement',
    desc: 'Contribuer au développement et à l’essor du tourisme tunisien',
  },
]

const REASONS_FALLBACK: ReasonItem[] = [
  {
    title: 'Représentation Institutionnelle',
    desc: 'être représenté auprès des gouvernements et institutions',
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
    img: '/images/act1.jpg',
  },
  {
    slug: 'secteur-sous-pression',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive....',
    date: '22 Mai 2026',
    img: '/images/act2.jpg',
  },
  {
    slug: 'houssem-azouz-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act3.jpg',
  },
]

function HomeInner() {
  const { t } = useTranslation()
  const { isEditMode } = useEditMode()
  const [objectifsPage, setObjectifsPage] = useState(0)

  return (
    <div className="fi2t-home">
      <section className="fi2t-hero">
        <EditableImage
          page="home"
          blockKey="hero.image"
          className="fi2t-hero__bg"
          alt="FI2T"
          fallback="/hero.jpg"
        />
        <div className="fi2t-hero__overlay" />
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

      <section className="fi2t-section fi2t-about" id="about">
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
          <EditableImage
            page="home"
            blockKey="about.image"
            className="fi2t-about__image"
            alt="Qui sommes-nous"
            fallback="/images/qui-sommes-nous.jpg"
          />
          <div className="fi2t-about__badge">
            <EditableText
              page="home"
              blockKey="about.badge"
              as="p"
              className="fi2t-stat-badge"
              multiline
              fallback={"10+\nANNÉES D'ENGAGEMENT"}
            />
          </div>
        </div>
      </section>

      <section className="fi2t-objectifs-wrap" id="objectifs">
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
            emptyItem={(items) => ({
              num: String(items.length + 1).padStart(2, '0'),
              title: 'Nouvel objectif',
              desc: 'Description…',
            })}
            addLabel="Ajouter un objectif"
            fields={[
              { key: 'num', label: 'Numéro' },
              { key: 'title', label: 'Titre' },
              { key: 'desc', label: 'Description', multiline: true },
            ]}
            renderItem={(_item, _index, { editField }) => (
              <>
                {editField('num', 'span', 'fi2t-objectif-card__num')}
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

      <section className="fi2t-groupements" id="groupements">
        <EditableImage
          page="home"
          blockKey="groupements.bg"
          className="fi2t-groupements__bg"
          alt=""
          fallback="/images/bg 1.png"
        />
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
            shared
            fallback={GROUPEMENTS}
            emptyItem={{ label: 'Nouveau groupement', slug: '', icon: '/images/icon1.png' }}
            addLabel="Ajouter un groupement"
            fields={[
              { key: 'label', label: 'Nom' },
              { key: 'slug', label: 'Slug (URL)' },
              { key: 'icon', label: 'Icône', image: true },
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

      <section className="fi2t-section fi2t-adherer" id="adherer">
        <div className="fi2t-adherer__media">
          <EditableImage
            page="home"
            blockKey="adherer.image"
            className="fi2t-adherer__image"
            alt="Adhésion"
            fallback="/images/Rectangle 27.png"
          />
          <div className="fi2t-adherer__badge">
            <EditableText
              page="home"
              blockKey="adherer.badge"
              as="p"
              className="fi2t-stat-badge"
              multiline
              fallback={"50+\nMEMBRES ACTIFS"}
            />
          </div>
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
                <span className="fi2t-reasons__check" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
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

      <section className="fi2t-news" id="actualites">
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
              renderItem={(item, _index, { editable, editField, editImage }) => (
                <>
                  {editImage('img', 'fi2t-news-card__media', item.title)}
                  <div className="fi2t-news-card__body">
                    {editField('title', 'h3')}
                    {editField('desc', 'p')}
                    <footer>
                      {editField('date', 'time')}
                      {!editable && item.slug ? (
                        <Link to={`/actualites/${item.slug}`} className="fi2t-news-card__link">
                          {t('fi2t.ui.read_more')}
                        </Link>
                      ) : (
                        <span className="fi2t-news-card__link">{t('fi2t.ui.read_more')}</span>
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

      <section className="fi2t-cta">
        <EditableImage
          page="home"
          blockKey="cta.bg"
          className="fi2t-cta__bg"
          alt=""
          fallback="/images/bg--1.png"
        />
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
