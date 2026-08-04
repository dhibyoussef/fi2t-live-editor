import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEditMode } from './EditModeProvider'
import { useContent } from './ContentProvider'
import { ACTUALITES_ARTICLES, ACTUALITES_DEFAULTS } from './defaults/actualites'
import {
  createEmptyArticle,
  parseArticles,
  type ArticleItem,
} from '../lib/articles'
import api from '../api/client'

/**
 * Prominent Live Editor control to CREATE a full article —
 * not a page Structure “zone”, and not buried only inside “Gérer la liste”.
 */
export default function AddArticleButton() {
  const { isEditMode } = useEditMode()
  const { get, saveBlock } = useContent()
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = (i18n.language || 'fr').split('-')[0]

  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (!isEditMode) return null

  const reset = () => {
    setTitle('')
    setDesc('')
    setDate('')
    setError('')
    setBusy(false)
  }

  const create = async () => {
    const trimmed = title.trim()
    if (!trimmed) {
      setError('Le titre est obligatoire.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const raw = get('grid.items', ACTUALITES_DEFAULTS['grid.items'])
      const existing = parseArticles(raw, ACTUALITES_ARTICLES)
      const article = createEmptyArticle(existing, {
        title: trimmed,
        desc: desc.trim() || undefined,
        date: date.trim() || undefined,
      })
      const next: ArticleItem[] = [article, ...existing]
      const payload = JSON.stringify(next)

      await saveBlock({
        page: 'actualites',
        section: 'grid',
        key: 'items',
        locale: lang,
        type: 'json',
        value: payload,
        label: 'Actualités — Articles',
      })

      // Also add a teaser card on Accueil (best-effort, same locale)
      try {
        const { data } = await api.get('/content/home', { params: { locale: lang } })
        const homeRaw = (data?.blocks?.['actualites.items'] as string) || '[]'
        let homeItems: Record<string, string>[] = []
        try {
          const parsed = JSON.parse(homeRaw)
          homeItems = Array.isArray(parsed) ? parsed : []
        } catch {
          homeItems = []
        }
        const teaser = {
          slug: article.slug,
          title: article.title,
          desc: article.desc,
          date: article.date,
          img: article.img,
        }
        const withoutDup = homeItems.filter((x) => x.slug !== article.slug)
        await api.post('/admin/content/bulk', {
          blocks: [
            {
              page: 'home',
              section: 'actualites',
              key: 'items',
              locale: lang,
              type: 'json',
              value: JSON.stringify([teaser, ...withoutDup]),
              label: 'Accueil — Actualités',
            },
          ],
        })
      } catch {
        /* Accueil sync is optional */
      }

      setOpen(false)
      reset()
      navigate(`/actualites/${article.slug}`)
    } catch {
      setError('Impossible de créer l’article. Vérifiez la connexion / session.')
      setBusy(false)
    }
  }

  return (
    <>
      <div className="cms-add-article-bar">
        <button
          type="button"
          className="cms-add-article-btn"
          onClick={() => { reset(); setOpen(true) }}
        >
          <i className="fa-solid fa-newspaper" aria-hidden />
          Ajouter un article
        </button>
        <p className="cms-add-article-bar__hint">
          Crée une fiche actualité complète (pas une zone de page).
        </p>
      </div>

      {open && createPortal(
        <div
          className="cms-list-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Ajouter un article"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="cms-list-panel cms-list-panel--modal cms-add-article-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="cms-list-panel__head">
              <span className="cms-list-panel__badge">
                <i className="fa-solid fa-newspaper" aria-hidden />
                ARTICLE
              </span>
              <span className="cms-list-panel__lang">{lang.toUpperCase()}</span>
              <button
                type="button"
                className="cms-list-panel__close"
                onClick={() => !busy && setOpen(false)}
                aria-label="Fermer"
              >
                ×
              </button>
            </header>

            <h3 className="cms-list-panel__title">Nouvel article</h3>
            <p className="cms-list-panel__hint">
              L’article est ajouté à Actualités, puis ouvert pour rédaction (titre, texte, sections…).
            </p>

            <label className="cms-list-panel__field">
              <span>Titre *</span>
              <input
                className="cms-list-panel__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex. : Tourisme : nouvelle initiative Fi2T"
                autoFocus
              />
            </label>
            <label className="cms-list-panel__field">
              <span>Extrait (carte)</span>
              <textarea
                className="cms-list-panel__input"
                rows={3}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Court résumé affiché sur la grille…"
              />
            </label>
            <label className="cms-list-panel__field">
              <span>Date</span>
              <input
                className="cms-list-panel__input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Ex. : 4 août 2026"
              />
            </label>

            {error && <p className="cms-add-article-panel__error">{error}</p>}

            <div className="cms-list-panel__footer">
              <button
                type="button"
                className="cms-list-panel__done"
                disabled={busy}
                onClick={() => void create()}
              >
                {busy ? 'Création…' : 'Créer et ouvrir'}
              </button>
              <button
                type="button"
                className="cms-list-panel__delete"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
