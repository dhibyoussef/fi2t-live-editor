import { useState, useEffect } from 'react'
import { FileText } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'

function slugify(title: string) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    title: string
    slug: string
    status: 'draft' | 'published'
    template: string
    meta_title: string
    meta_description: string
  }) => void
  loading?: boolean
}

export default function AddPageModal({ open, onClose, onSubmit, loading }: Props) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [status, setStatus] = useState<'draft' | 'published'>('draft')
  const [template, setTemplate] = useState('default')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDesc, setMetaDesc] = useState('')

  useEffect(() => {
    if (!slugManual && title) setSlug(slugify(title))
  }, [title, slugManual])

  const reset = () => {
    setTitle('')
    setSlug('')
    setSlugManual(false)
    setStatus('draft')
    setTemplate('default')
    setMetaTitle('')
    setMetaDesc('')
  }

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); reset() }}
      title="Ajouter une page"
      subtitle="Comme WordPress — titre, permalien, statut et modèle"
      footer={
        <>
          <Button variant="secondary" onClick={() => { onClose(); reset() }}>Annuler</Button>
          <Button
            icon={<FileText size={13} />}
            loading={loading}
            disabled={!title.trim() || !slug.trim()}
            onClick={() => onSubmit({
              title: title.trim(),
              slug: slug.trim(),
              status,
              template,
              meta_title: metaTitle.trim(),
              meta_description: metaDesc.trim(),
            })}
          >
            Créer la page
          </Button>
        </>
      }
    >
      <div className="wc-page-form">
        <Input
          label="Titre de la page *"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ex: À propos, Contact, Offres spa…"
        />
        <div>
          <label className="gc-label">Permalien (URL) *</label>
          <div className="wc-permalink">
            <span className="wc-permalink-prefix">/</span>
            <input
              className="gc-field"
              value={slug}
              onChange={e => { setSlugManual(true); setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')) }}
              placeholder="a-propos"
            />
          </div>
          <p className="gc-field-hint">Généré automatiquement depuis le titre. Modifiable.</p>
        </div>
        <div className="gc-grid-2">
          <div>
            <label className="gc-label">Statut</label>
            <select className="gc-field" value={status} onChange={e => setStatus(e.target.value as 'draft' | 'published')}>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
          <div>
            <label className="gc-label">Modèle de page</label>
            <select className="gc-field" value={template} onChange={e => setTemplate(e.target.value)}>
              <option value="default">Page standard</option>
              <option value="landing">Landing page</option>
              <option value="home">Page d'accueil</option>
            </select>
          </div>
        </div>
        <Input
          label="Titre SEO (meta title)"
          value={metaTitle}
          onChange={e => setMetaTitle(e.target.value)}
          placeholder="Titre pour les moteurs de recherche"
        />
        <div>
          <label className="gc-label">Description SEO (meta description)</label>
          <textarea
            className="gc-field"
            rows={2}
            value={metaDesc}
            onChange={e => setMetaDesc(e.target.value)}
            placeholder="Courte description pour Google…"
          />
        </div>
      </div>
    </Modal>
  )
}
