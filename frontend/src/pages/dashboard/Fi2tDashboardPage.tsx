import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { apiClient } from '../../api/client'
import { buildLiveEditorUrl } from '../../api/editSession'
import toast from 'react-hot-toast'
import {
  ExternalLink, LayoutTemplate, Globe, Languages,
  Users, ShieldCheck, ArrowRight, FileText, Newspaper,
  Settings2, Loader2,
} from 'lucide-react'

type CmsPageRow = {
  id: number
  slug: string
  title: string
  status: 'draft' | 'published'
  template?: string
}

export default function Fi2tDashboardPage() {
  const token = useAuthStore((s) => s.token)
  const user = useAuthStore((s) => s.user)

  const pagesQ = useQuery({
    queryKey: ['dash-pages'],
    queryFn: () => apiClient.get('/admin/content/pages').then((r) => r.data as CmsPageRow[]),
  })
  const usersQ = useQuery({
    queryKey: ['dash-users'],
    queryFn: () => apiClient.get('/admin/users', { params: { per_page: 1 } }).then((r) => r.data),
  })
  const localesQ = useQuery({
    queryKey: ['dash-locales'],
    queryFn: () => apiClient.get('/admin/translations').then((r) => r.data as { locales?: string[] }),
  })

  const pages = Array.isArray(pagesQ.data) ? pagesQ.data : []
  const published = pages.filter((p) => p.status === 'published').length
  const drafts = pages.filter((p) => p.status === 'draft').length
  const locales = (() => {
    const raw = localesQ.data?.locales
    if (!Array.isArray(raw) || raw.length === 0) return ['fr', 'en', 'ar']
    return raw.map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && 'code' in item) {
        return String((item as { code: string }).code || '')
      }
      return ''
    }).filter(Boolean)
  })()
  const userTotal = usersQ.data?.meta?.total ?? usersQ.data?.total ?? usersQ.data?.data?.length ?? '—'
  const loading = pagesQ.isLoading || usersQ.isLoading || localesQ.isLoading

  const openLiveEditor = async (path = '/') => {
    if (!token) return
    try {
      const url = await buildLiveEditorUrl(path)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Impossible d’ouvrir le Live Editor — reconnectez-vous')
    }
  }

  const shortcuts = [
    { to: '/website-content', icon: LayoutTemplate, title: 'Contenu du site', desc: 'Pages, textes, images, listes et Aperçu live.' },
    { to: '/translations', icon: Languages, title: 'Traductions', desc: 'Interface FR / EN / AR.' },
    { to: '/users', icon: Users, title: 'Utilisateurs', desc: 'Comptes admin et accès.' },
    { to: '/roles', icon: ShieldCheck, title: 'Rôles', desc: 'Permissions super-admin / admin.' },
  ]

  return (
    <div className="fi2t-dash">
      <section className="fi2t-dash__hero">
        <img src="/hero.jpg" alt="" className="fi2t-dash__hero-bg" />
        <div className="fi2t-dash__hero-overlay" />
        <div className="fi2t-dash__hero-content">
          <div className="fi2t-dash__eyebrow">FI2T · CMS Live Editor</div>
          <h1>
            Bonjour{user?.first_name ? ` ${user.first_name}` : ''}
          </h1>
          <p>
            Tableau de bord pour publier et mettre à jour le site de la Fédération —
            contenu, actualités, langues et équipe.
          </p>
          <div className="fi2t-dash__hero-actions">
            <Link to="/website-content" className="fi2t-dash__btn fi2t-dash__btn--primary">
              Gérer le contenu
            </Link>
            <button type="button" className="fi2t-dash__btn fi2t-dash__btn--ghost" onClick={() => void openLiveEditor('/')}>
              Éditer le site live <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </section>

      <div className="fi2t-dash__stats">
        {loading ? (
          <div className="fi2t-stat fi2t-stat--wide">
            <Loader2 className="animate-spin" size={18} /> Chargement…
          </div>
        ) : (
          <>
            <div className="fi2t-stat">
              <span className="fi2t-stat__value">{pages.length}</span>
              <span className="fi2t-stat__label">Pages CMS</span>
            </div>
            <div className="fi2t-stat">
              <span className="fi2t-stat__value">{published}</span>
              <span className="fi2t-stat__label">Publiées</span>
            </div>
            <div className="fi2t-stat">
              <span className="fi2t-stat__value">{drafts}</span>
              <span className="fi2t-stat__label">Brouillons</span>
            </div>
            <div className="fi2t-stat">
              <span className="fi2t-stat__value">{locales.length}</span>
              <span className="fi2t-stat__label">Langues ({locales.map((l) => l.toUpperCase()).join(' · ')})</span>
            </div>
            <div className="fi2t-stat">
              <span className="fi2t-stat__value">{userTotal}</span>
              <span className="fi2t-stat__label">Utilisateurs</span>
            </div>
          </>
        )}
      </div>

      <section>
        <div className="fi2t-dash__section-head">
          <div>
            <h2>Accès rapide</h2>
            <p>Les outils les plus utilisés au quotidien</p>
          </div>
        </div>
        <div className="fi2t-dash__grid">
          {shortcuts.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.to} to={item.to} className="fi2t-dash-card">
                <div className="fi2t-dash-card__icon"><Icon size={20} /></div>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
                <div className="fi2t-dash-card__cta">Ouvrir <ArrowRight size={14} /></div>
              </Link>
            )
          })}
          <button type="button" className="fi2t-dash-card" onClick={() => void openLiveEditor('/actualites')}>
            <div className="fi2t-dash-card__icon"><Newspaper size={20} /></div>
            <strong>Actualités</strong>
            <span>Ajouter ou modifier un article en Live Editor.</span>
            <div className="fi2t-dash-card__cta">Live editor <ExternalLink size={14} /></div>
          </button>
          <button type="button" className="fi2t-dash-card" onClick={() => void openLiveEditor('/')}>
            <div className="fi2t-dash-card__icon"><Globe size={20} /></div>
            <strong>Site public</strong>
            <span>Ouvre le site (:3002) avec votre session d’édition.</span>
            <div className="fi2t-dash-card__cta">Ouvrir <ExternalLink size={14} /></div>
          </button>
        </div>
      </section>

      <section className="fi2t-dash__panel">
        <div className="fi2t-dash__section-head" style={{ marginBottom: 12 }}>
          <div>
            <h2>Pages du site</h2>
            <p>Statut de publication — cliquez pour éditer dans Contenu du site</p>
          </div>
        </div>
        <div className="fi2t-dash__pages">
          {pages.slice(0, 12).map((p) => (
            <Link key={p.slug} to={`/website-content?page=${encodeURIComponent(p.slug)}`} className="fi2t-dash__page-row">
              <span className="fi2t-dash__page-icon"><FileText size={14} /></span>
              <span className="fi2t-dash__page-title">{p.title || p.slug}</span>
              <span className={`fi2t-dash__pill fi2t-dash__pill--${p.status}`}>
                {p.status === 'published' ? 'Publié' : 'Brouillon'}
              </span>
            </Link>
          ))}
          {!loading && pages.length === 0 && (
            <p className="fi2t-dash__empty">Aucune page — ouvrez Contenu du site pour commencer.</p>
          )}
        </div>
        <Link to="/website-content" className="fi2t-dash__more">
          Voir toutes les pages <ArrowRight size={14} />
        </Link>
      </section>

      <section className="fi2t-dash__panel">
        <h3><Settings2 size={16} style={{ marginRight: 8, verticalAlign: -2 }} /> Rappel</h3>
        <ul className="fi2t-dash__tips">
          <li><strong>Publié</strong> — la page est visible sur le site public.</li>
          <li><strong>Brouillon</strong> — visible seulement pour les admins connectés en aperçu.</li>
          <li>Pour les images : crayon sur la photo → panneau (aperçu, chemin, changer).</li>
          <li>Dans Aperçu live : modifiez puis cliquez <strong>Enregistrer</strong> dans la barre du bas de l’aperçu.</li>
        </ul>
      </section>
    </div>
  )
}
