import { Link } from 'react-router-dom'
import EditableText from '../../cms/EditableText'
import '../../styles/about-ambition.css'

const PAGE = 'about'

export default function AboutAmbitionSection() {
  return (
    <section className="about-ambition" aria-labelledby="about-ambition-title">
      <img
        src="/imgs/bgvictor.svg"
        alt=""
        className="about-ambition__victor"
        aria-hidden="true"
      />

      <div className="about-ambition__inner">
        <EditableText
          page={PAGE}
          blockKey="ambition.eyebrow"
          as="p"
          className="about-ambition__eyebrow"
          label="Ambition — Surtitre"
        />

        <EditableText
          page={PAGE}
          blockKey="ambition.title"
          as="h2"
          className="about-ambition__title"
          multiline
          label="Ambition — Titre"
        />

        <EditableText
          page={PAGE}
          blockKey="ambition.text"
          as="p"
          className="about-ambition__text"
          multiline
          label="Ambition — Texte"
        />

        <Link to="/hebergement-reservation" className="about-ambition__btn">
          <EditableText page={PAGE} blockKey="ambition.cta" as="span" label="Ambition — Bouton" />
        </Link>
      </div>
    </section>
  )
}
