import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { buildLiveEditorUrl } from '../../api/editSession'
import toast from 'react-hot-toast'
import {
  ExternalLink, LayoutTemplate, Globe, Languages,
  Users, ShieldCheck, ArrowRight,
} from 'lucide-react'

export default function Fi2tDashboardPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const openLiveEditor = async () => {
    if (!token) return
    try {
      const url = await buildLiveEditorUrl('/')
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Impossible d’ouvrir le Live Editor — reconnectez-vous')
    }
  }

  return (
    <div className="fi2t-dash">
      <section className="fi2t-dash__hero">
        <img src="/hero.jpg" alt="" className="fi2t-dash__hero-bg" />
        <div className="fi2t-dash__hero-overlay" />
        <div className="fi2t-dash__hero-content">
          <div className="fi2t-dash__eyebrow">CMS · Live Editor</div>
          <h1>
            Bienvenue{user?.first_name ? ` ${user.first_name}` : ''} —
            gérez le site FI2T
          </h1>
          <p>
            Même langage visuel que le site public : pages, sections, textes et images
            modifiables en live.
          </p>
        </div>
      </section>

      <div className="fi2t-dash__stats">
        <div className="fi2t-stat">
          <span className="fi2t-stat__value">7</span>
          <span className="fi2t-stat__label">Pages CMS</span>
        </div>
        <div className="fi2t-stat">
          <span className="fi2t-stat__value">FR</span>
          <span className="fi2t-stat__label">Locale active</span>
        </div>
        <div className="fi2t-stat">
          <span className="fi2t-stat__value">Live</span>
          <span className="fi2t-stat__label">Éditeur inline</span>
        </div>
        <div className="fi2t-stat">
          <span className="fi2t-stat__value">FI2T</span>
          <span className="fi2t-stat__label">Fédération</span>
        </div>
      </div>

      <section>
        <div className="fi2t-dash__section-head">
          <div>
            <h2>Actions rapides</h2>
            <p>Accès direct au contenu et au live editor</p>
          </div>
        </div>

        <div className="fi2t-dash__grid">
          <Link to="/website-content" className="fi2t-dash-card">
            <div className="fi2t-dash-card__icon"><LayoutTemplate size={20} /></div>
            <strong>Contenu du site</strong>
            <span>Page builder : pages, sections et blocs (textes, images, JSON).</span>
            <div className="fi2t-dash-card__cta">Ouvrir <ArrowRight size={14} /></div>
          </Link>

          <Link to="/translations" className="fi2t-dash-card">
            <div className="fi2t-dash-card__icon"><Languages size={20} /></div>
            <strong>Traductions</strong>
            <span>Traduire les textes de l’interface (FR → EN / AR).</span>
            <div className="fi2t-dash-card__cta">Ouvrir <ArrowRight size={14} /></div>
          </Link>

          <button type="button" className="fi2t-dash-card" onClick={openLiveEditor}>
            <div className="fi2t-dash-card__icon"><Globe size={20} /></div>
            <strong>Éditer le site</strong>
            <span>Ouvre le site public en mode live editor avec votre session.</span>
            <div className="fi2t-dash-card__cta">
              Live editor <ExternalLink size={14} />
            </div>
          </button>
        </div>
      </section>

      <section className="fi2t-dash__panel">
        <h3>Administration</h3>
        <div className="fi2t-dash__links">
          <Link to="/users">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Users size={16} color="#00a98d" /> Utilisateurs
            </span>
            <ArrowRight size={14} />
          </Link>
          <Link to="/roles">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <ShieldCheck size={16} color="#00a98d" /> Rôles & permissions
            </span>
            <ArrowRight size={14} />
          </Link>
          <button type="button" onClick={openLiveEditor}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <Globe size={16} color="#00a98d" /> Prévisualiser le site (:3002)
            </span>
            <ExternalLink size={14} />
          </button>
        </div>
      </section>
    </div>
  )
}
