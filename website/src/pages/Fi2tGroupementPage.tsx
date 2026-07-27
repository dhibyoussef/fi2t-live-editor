import { useState, type ReactNode } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ContentProvider, useContent } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'
import {
  getGroupementDefaults,
  isGroupementSlug,
} from '../cms/defaults/groupements-index'
import type { ChallengeItem, PillarCard, ProposalItem } from '../cms/defaults/groupement-shared'

function parseJsonArray<T>(raw: string, fallback: T[]): T[] {
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

function AccordionItem({
  open,
  onToggle,
  header,
  children,
}: {
  open: boolean
  onToggle: () => void
  header: ReactNode
  children?: ReactNode
}) {
  return (
    <article className={`fi2t-g-acc${open ? ' is-open' : ''}`}>
      <button type="button" className="fi2t-g-acc__head" onClick={onToggle} aria-expanded={open}>
        {header}
        <span className="fi2t-g-acc__chevron" aria-hidden="true">
          ›
        </span>
      </button>
      {open && children ? <div className="fi2t-g-acc__body">{children}</div> : null}
    </article>
  )
}

function GroupementInner({ slug }: { slug: string }) {
  const { get } = useContent()
  const defaults = getGroupementDefaults(slug)
  const [openChallenge, setOpenChallenge] = useState(0)
  const [openProposal, setOpenProposal] = useState(0)

  const pillars = parseJsonArray<PillarCard>(
    get('positioning.pillars', '[]'),
    parseJsonArray(defaults['positioning.pillars'] ?? '[]', []),
  )
  const challenges = parseJsonArray<ChallengeItem>(
    get('challenges.items', '[]'),
    parseJsonArray(defaults['challenges.items'] ?? '[]', []),
  )
  const enjeuxItems = parseJsonArray<string>(
    get('enjeux.items', '[]'),
    parseJsonArray(defaults['enjeux.items'] ?? '[]', []),
  )
  const proposals = parseJsonArray<ProposalItem>(
    get('proposals.items', '[]'),
    parseJsonArray(defaults['proposals.items'] ?? '[]', []),
  )

  return (
    <div className="fi2t-groupement-page">
      <section className="fi2t-page-hero">
        <EditableImage
          page={slug}
          blockKey="hero.image"
          className="fi2t-page-hero__bg"
          alt=""
          fallback="/hero.jpg"
        />
        <div className="fi2t-page-hero__overlay" />
        <div className="fi2t-page-hero__content">
          <EditableText
            page={slug}
            blockKey="hero.title"
            as="h1"
            className="fi2t-page-hero__title"
            fallback={defaults['hero.title'] ?? slug}
          />
          <span className="fi2t-page-hero__accent" aria-hidden="true" />
        </div>
      </section>

      <section className="fi2t-section fi2t-g-positioning">
        <div className="fi2t-g-positioning__text">
          <EditableText
            page={slug}
            blockKey="positioning.title"
            as="h2"
            fallback="Positionnement FI2T"
          />
          <EditableText
            page={slug}
            blockKey="positioning.body"
            as="p"
            multiline
            fallback={defaults['positioning.body'] ?? ''}
          />
        </div>
        <div className="fi2t-g-pillars">
          {pillars.map((item) => (
            <article key={item.title} className="fi2t-g-pillar">
              <img src={item.icon} alt="" />
              <h3>{item.title}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="fi2t-g-challenges">
        <div className="fi2t-section">
          <EditableText
            page={slug}
            blockKey="challenges.title"
            as="h2"
            className="fi2t-g-section-title"
            fallback="Positionnement FI2T"
          />
          <div className="fi2t-g-acc-list">
            {challenges.map((item, index) => (
              <AccordionItem
                key={item.number}
                open={openChallenge === index}
                onToggle={() => setOpenChallenge((v) => (v === index ? -1 : index))}
                header={
                  <>
                    <span className="fi2t-g-acc__num">{item.number}</span>
                    <span className="fi2t-g-acc__title">{item.title}</span>
                  </>
                }
              >
                <div className="fi2t-g-acc__text">{item.body}</div>
                {item.constat && <p className="fi2t-g-acc__constat">{item.constat}</p>}
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>

      <section className="fi2t-section fi2t-g-enjeux">
        <EditableImage
          page={slug}
          blockKey="enjeux.image"
          className="fi2t-g-enjeux__image"
          alt=""
          fallback="/images/groupement-enjeux.jpg"
        />
        <div>
          <EditableText
            page={slug}
            blockKey="enjeux.title"
            as="h2"
            fallback="Enjeux stratégiques"
          />
          <ul>
            {enjeuxItems.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fi2t-g-proposals">
        <div className="fi2t-section">
          <EditableText
            page={slug}
            blockKey="proposals.title"
            as="h2"
            className="fi2t-g-section-title"
            fallback="Propositions stratégiques"
          />
          <div className="fi2t-g-acc-list fi2t-g-acc-list--proposals">
            {proposals.map((item, index) => (
              <AccordionItem
                key={item.title}
                open={openProposal === index}
                onToggle={() => setOpenProposal((v) => (v === index ? -1 : index))}
                header={<span className="fi2t-g-acc__title fi2t-g-acc__title--teal">{item.title}</span>}
              >
                <div className="fi2t-g-acc__text">{item.body}</div>
              </AccordionItem>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default function Fi2tGroupementPage() {
  const { slug = '' } = useParams<{ slug: string }>()

  if (!isGroupementSlug(slug)) {
    return <Navigate to="/" replace />
  }

  return (
    <ContentProvider page={slug}>
      <GroupementInner slug={slug} />
      <EditToolbar />
    </ContentProvider>
  )
}
