import EditableText from '../../cms/EditableText'
import '../../styles/about-timeline.css'

const PAGE = 'about'

function TimelineDot() {
  return (
    <img
      src="/imgs/dots.svg"
      alt=""
      className="timeline-axis__dot"
      aria-hidden="true"
    />
  )
}

function TimelineYear({ blockKey, fallback }: { blockKey: string; fallback: string }) {
  return (
    <p className="timeline-entry__year">
      <i className="fa-regular fa-calendar" aria-hidden="true" />
      <EditableText page={PAGE} blockKey={blockKey} as="span" fallback={fallback} label="Année" />
    </p>
  )
}

function TimelineEntry({
  yearKey,
  yearFallback,
  titleKey,
  titleFallback,
  textKey,
  textFallback,
  direction = 'rtl',
}: {
  yearKey: string
  yearFallback: string
  titleKey: string
  titleFallback: string
  textKey: string
  textFallback: string
  direction?: 'rtl' | 'ltr'
}) {
  return (
    <div className={`timeline-entry${direction === 'ltr' ? ' timeline-entry--ltr' : ''}`}>
      <TimelineYear blockKey={yearKey} fallback={yearFallback} />
      <EditableText
        page={PAGE}
        blockKey={titleKey}
        as="h3"
        className="timeline-entry__title"
        fallback={titleFallback}
        label="Titre"
      />
      <EditableText
        page={PAGE}
        blockKey={textKey}
        as="p"
        className="timeline-entry__text"
        fallback={textFallback}
        multiline
        label="Texte"
      />
    </div>
  )
}

export default function AboutTimelineSection() {
  return (
    <section className="timeline-section" aria-labelledby="timeline-section-title">
      <div className="timeline-section__inner">
        <EditableText
          page={PAGE}
          blockKey="timeline.label"
          as="p"
          className="timeline-section__label"
          label="Timeline — Surtitre"
        />

        <EditableText
          page={PAGE}
          blockKey="timeline.title"
          as="h2"
          className="timeline-section__title"
          multiline
          label="Timeline — Titre"
        />

        <div className="timeline-axis">
          <img
            src="/imgs/Line.svg"
            alt=""
            className="timeline-axis__line"
            aria-hidden="true"
          />

          <article className="timeline-row timeline-row--left">
            <div className="timeline-row__side timeline-row__side--left">
              <TimelineEntry
                yearKey="timeline.item_2000_year"
                yearFallback="2000"
                titleKey="timeline.item_2000_title"
                titleFallback="Les Fondations"
                textKey="timeline.item_2000_text"
                textFallback=""
              />
            </div>
            <div className="timeline-row__center">
              <TimelineDot />
            </div>
            <div className="timeline-row__side timeline-row__side--right" aria-hidden="true" />
          </article>

          <aside className="timeline-row timeline-row--right">
            <div className="timeline-row__side timeline-row__side--left" aria-hidden="true" />
            <div className="timeline-row__center">
              <TimelineDot />
            </div>
            <div className="timeline-row__side timeline-row__side--right">
              <TimelineEntry
                yearKey="timeline.highlight_year"
                yearFallback="2000 - 2021"
                titleKey="timeline.highlight_title"
                titleFallback="Deux Décennies de Prestige"
                textKey="timeline.highlight_text"
                textFallback=""
                direction="ltr"
              />
            </div>
          </aside>

          <article className="timeline-row timeline-row--left">
            <div className="timeline-row__side timeline-row__side--left">
              <TimelineEntry
                yearKey="timeline.item_2021_year"
                yearFallback="2021"
                titleKey="timeline.item_2021_title"
                titleFallback="Les Fondations"
                textKey="timeline.item_2021_text"
                textFallback=""
              />
            </div>
            <div className="timeline-row__center">
              <TimelineDot />
            </div>
            <div className="timeline-row__side timeline-row__side--right" aria-hidden="true" />
          </article>
        </div>
      </div>
    </section>
  )
}
