import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import EditableText from '../../cms/EditableText'
import EditableImage from '../../cms/EditableImage'
import '../../styles/spa.css'

const PAGE = 'home'
const SPA_IMAGE = '/imgs/spa.png'

export default function SpaSection() {
  const { t } = useTranslation()

  return (
    <section className="spa" data-cms-section="spa">
      <div className="spa__layout">
        <div className="spa__content">
          <div className="spa__content-inner">
            <div className="spa__brand">
              <img src="/logo-figma.svg" alt="" className="spa__logo-mark" aria-hidden="true" />
              <p className="spa__eyebrow">{t('home.spaEyebrow')}</p>
            </div>

            <EditableText
              page={PAGE}
              blockKey="spa.title"
              as="h2"
              className="spa__title"
              multiline
              fallback={t('home.spaTitle')}
              label="Spa — Titre"
            />

            <EditableText
              page={PAGE}
              blockKey="spa.desc"
              as="p"
              className="spa__text"
              multiline
              fallback={t('home.spaDesc')}
              label="Spa — Description"
            />

            <Link to="/spa/reservation" className="spa__cta">
              <span className="spa__cta-label">{t('home.spaCta')}</span>
              <span className="spa__cta-icon" aria-hidden="true">
                <img src="/imgs/calendar 5.svg" alt="" />
              </span>
            </Link>
          </div>
        </div>

        <div className="spa__visual">
          <Link to="/spa/reservation" className="spa__visual-link" aria-label={t('home.spaCta')}>
            <EditableImage
              page={PAGE}
              blockKey="spa.image"
              className="spa__visual-img"
              alt="Antonin Spa"
              label="Spa — Image"
              fallback={SPA_IMAGE}
            />
          </Link>
        </div>

        <div className="spa__brochure">
          <p className="spa__brochure-title">{t('home.spaBrochureTitle')}</p>
          <Link to="/spa" className="spa__brochure-btn">
            {t('home.spaBrochure')}
          </Link>
        </div>
      </div>
    </section>
  )
}
