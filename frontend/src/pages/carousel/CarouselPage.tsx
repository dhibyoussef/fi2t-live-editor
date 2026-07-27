import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Edit, Trash2, Eye, EyeOff, Images,
  ChevronRight, LayoutGrid, Image, Copy, Check,
  GalleryHorizontal, SlidersHorizontal,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { homeCarouselLabel, isHomeCarousel } from './homeCarousels'

// ─── Types ───────────────────────────────────────────────────────────────────

export type MediaCollectionType = 'carousel' | 'gallery'

export interface Carousel {
  id: number
  name: string
  slug: string
  type: MediaCollectionType
  description: string | null
  is_active: boolean
  is_system: boolean
  sort_order: number
  items_count: number
  active_items_count: number
}

type FilterType = 'all' | MediaCollectionType

const EMPTY = {
  name: '',
  slug: '',
  type: 'carousel' as MediaCollectionType,
  description: '',
  is_active: true,
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CarouselPage() {
  const qc       = useQueryClient()
  const navigate = useNavigate()

  const [filter, setFilter]       = useState<FilterType>('all')
  const [modal, setModal]         = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected]   = useState<Carousel | null>(null)
  const [form, setForm]           = useState(EMPTY)
  const [slugTouched, setSlugTouched] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: carousels = [], isLoading } = useQuery<Carousel[]>({
    queryKey: ['carousels'],
    queryFn: () => api.get('/admin/carousels').then(r => r.data),
  })

  const filtered = useMemo(() => {
    const list = filter === 'all' ? carousels : carousels.filter(c => c.type === filter)
    return [...list].sort((a, b) => {
      if (a.is_system !== b.is_system) return a.is_system ? -1 : 1
      return a.sort_order - b.sort_order
    })
  }, [carousels, filter])

  const counts = useMemo(() => ({
    all: carousels.length,
    carousel: carousels.filter(c => c.type === 'carousel').length,
    gallery: carousels.filter(c => c.type === 'gallery').length,
  }), [carousels])

  const invalidate = () => qc.invalidateQueries({ queryKey: ['carousels'] })

  const parseErrors = (e: any) => {
    const errs = e.response?.data?.errors ?? {}
    const flat: Record<string, string> = {}
    Object.entries(errs).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? (v[0] as string) : String(v) })
    return flat
  }

  const createM = useMutation({
    mutationFn: (d: typeof EMPTY) => api.post('/admin/carousels', d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Collection créée') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const updateM = useMutation({
    mutationFn: (d: typeof EMPTY) => api.put(`/admin/carousels/${selected?.id}`, d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Collection mise à jour') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const toggleM = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/carousels/${id}/toggle`),
    onSuccess: invalidate,
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/carousels/${id}`),
    onSuccess: () => { invalidate(); toast.success('Collection supprimée') },
    onError: (e: any) => {
      toast.error(e.response?.data?.message ?? 'Impossible de supprimer cette collection')
    },
  })

  const openCreate = (type: MediaCollectionType = 'carousel') => {
    setForm({ ...EMPTY, type })
    setSlugTouched(false)
    setFormErrors({})
    setModal('create')
  }

  const openEdit = (c: Carousel) => {
    setSelected(c)
    setForm({
      name: c.name,
      slug: c.slug,
      type: c.type,
      description: c.description ?? '',
      is_active: c.is_active,
    })
    setSlugTouched(true)
    setFormErrors({})
    setModal('edit')
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Le nom est obligatoire.'
    if (!form.slug.trim()) errs.slug = 'Le slug est obligatoire.'
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
      errs.slug = 'Slug invalide (lettres minuscules, chiffres et tirets).'
    }
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = () => {
    if (!validate()) return
    modal === 'create' ? createM.mutate(form) : updateM.mutate(form)
  }

  const f = (key: keyof typeof EMPTY, val: string | boolean | MediaCollectionType) => {
    setForm(p => {
      const next = { ...p, [key]: val }
      if (key === 'name' && !slugTouched && modal === 'create') {
        next.slug = slugify(String(val))
      }
      return next
    })
  }

  const copySlug = async (slug: string) => {
    try {
      await navigator.clipboard.writeText(slug)
      setCopiedSlug(slug)
      toast.success('Slug copié — à utiliser côté site React')
      setTimeout(() => setCopiedSlug(null), 2000)
    } catch {
      toast.error('Impossible de copier')
    }
  }

  return (
    <>
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <div className="gc-page-header-icon"><LayoutGrid size={18} /></div>
          <div>
            <p className="gc-page-header-title">Carousels & Galeries</p>
            <p className="gc-page-header-sub">
              {counts.carousel} carousel{counts.carousel !== 1 ? 's' : ''} · {counts.gallery} galerie{counts.gallery !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={<SlidersHorizontal size={14} />} onClick={() => openCreate('carousel')}>
            Nouveau carousel
          </Button>
          <Button icon={<Plus size={14} />} onClick={() => openCreate('gallery')}>
            Nouvelle galerie
          </Button>
        </div>
      </div>

      <div className="wc-page-tabs" style={{ marginBottom: 14 }}>
        {([
          ['all', 'Tous', counts.all],
          ['carousel', 'Carousels', counts.carousel],
          ['gallery', 'Galeries', counts.gallery],
        ] as const).map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            className={`wc-page-tab${filter === key ? ' active' : ''}`}
            onClick={() => setFilter(key)}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="gc-spinner" />
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="carousel-empty">
          <Images size={40} style={{ color: 'var(--gc-gold-400)', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: 'var(--gc-noir-900)' }}>
            {filter === 'gallery' ? 'Aucune galerie' : filter === 'carousel' ? 'Aucun carousel' : 'Aucune collection'}
          </p>
          <p style={{ fontSize: 13, color: 'var(--gc-noir-400)', marginBottom: 16 }}>
            Créez une collection d'images que l'admin pourra mettre à jour à tout moment.
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <Button variant="secondary" icon={<SlidersHorizontal size={14} />} onClick={() => openCreate('carousel')}>
              Carousel
            </Button>
            <Button icon={<Plus size={14} />} onClick={() => openCreate('gallery')}>Galerie</Button>
          </div>
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="cgroup-list">
          {filtered.map(c => (
            <div key={c.id} className={`cgroup-card${c.is_active ? '' : ' inactive'}`}>
              <div className="cgroup-card-left" onClick={() => navigate(`/carousel/${c.id}`)}>
                <div className={`cgroup-icon${c.type === 'gallery' ? ' cgroup-icon--gallery' : ''}`}>
                  {c.type === 'gallery' ? <GalleryHorizontal size={20} /> : <Image size={20} />}
                </div>
                <div className="cgroup-info">
                  <p className="cgroup-name">{c.name}</p>
                  <div className="cgroup-slug-row">
                    <code className="cgroup-slug">{c.slug}</code>
                    <button
                      type="button"
                      className="cgroup-slug-copy"
                      title="Copier le slug pour le dev React"
                      onClick={e => { e.stopPropagation(); copySlug(c.slug) }}
                    >
                      {copiedSlug === c.slug ? <Check size={12} /> : <Copy size={12} />}
                    </button>
                  </div>
                  {c.description && <p className="cgroup-desc">{c.description}</p>}
                  <div className="cgroup-stats">
                    {c.is_system && (
                      <Badge status="warning" size="xs">
                        {isHomeCarousel(c.slug) ? "Page d'accueil · protégé" : 'Système · protégé'}
                      </Badge>
                    )}
                    {homeCarouselLabel(c.slug) && (
                      <Badge status="neutral" size="xs">
                        {homeCarouselLabel(c.slug)}
                      </Badge>
                    )}
                    <Badge status={c.type === 'gallery' ? 'info' : 'neutral'} size="xs">
                      {c.type === 'gallery' ? 'Galerie' : 'Carousel'}
                    </Badge>
                    <Badge status="neutral" size="xs">
                      {c.items_count} image{c.items_count !== 1 ? 's' : ''}
                    </Badge>
                    <Badge status={c.active_items_count > 0 ? 'active' : 'inactive'} size="xs" dot>
                      {c.active_items_count} active{c.active_items_count !== 1 ? 's' : ''}
                    </Badge>
                    <Badge status={c.is_active ? 'active' : 'inactive'} size="xs">
                      {c.is_active ? 'Publié' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="cgroup-card-actions">
                <Button
                  variant="ghost" size="xs"
                  icon={c.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                  onClick={() => toggleM.mutate(c.id)}
                >
                  {c.is_active ? 'Désactiver' : 'Activer'}
                </Button>
                <Button variant="secondary" size="xs" icon={<Edit size={12} />} onClick={() => openEdit(c)}>
                  Modifier
                </Button>
                <Button
                  variant="ghost" size="xs" icon={<ChevronRight size={14} />}
                  onClick={() => navigate(`/carousel/${c.id}`)}
                >
                  Gérer les images
                </Button>
                {!c.is_system && (
                  <Button
                    variant="danger" size="xs" iconOnly icon={<Trash2 size={12} />}
                    onClick={() => {
                      if (confirm(`Supprimer « ${c.name} » et toutes ses images ?`)) deleteM.mutate(c.id)
                    }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'create'
          ? (form.type === 'gallery' ? 'Nouvelle galerie' : 'Nouveau carousel')
          : 'Modifier la collection'}
        subtitle="Nom interne + slug technique pour le site React"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Annuler</Button>
            <Button loading={createM.isPending || updateM.isPending} onClick={submit}>
              {modal === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selected?.is_system && (
            <p className="carousel-info-bar" style={{ margin: 0 }}>
              Collection liée à la page d&apos;accueil — le slug et le type ne peuvent pas être modifiés.
            </p>
          )}

          <div className="cgroup-type-picker">
            <button
              type="button"
              className={form.type === 'carousel' ? 'active' : ''}
              onClick={() => f('type', 'carousel')}
              disabled={selected?.is_system}
            >
              <SlidersHorizontal size={16} /> Carousel
            </button>
            <button
              type="button"
              className={form.type === 'gallery' ? 'active' : ''}
              onClick={() => f('type', 'gallery')}
              disabled={selected?.is_system}
            >
              <GalleryHorizontal size={16} /> Galerie
            </button>
          </div>

          <Input
            label="Nom *"
            value={form.name}
            error={formErrors.name}
            onChange={e => { f('name', e.target.value); setFormErrors(p => ({ ...p, name: '' })) }}
            placeholder={form.type === 'gallery' ? 'ex : Galerie Spa' : 'ex : Accueil Hero'}
          />

          <Input
            label="Slug (identifiant API) *"
            value={form.slug}
            error={formErrors.slug}
            disabled={selected?.is_system}
            onChange={e => {
              setSlugTouched(true)
              f('slug', slugify(e.target.value))
              setFormErrors(p => ({ ...p, slug: '' }))
            }}
            placeholder="ex : home-hero, spa-gallery"
          />
          <p style={{ margin: '-8px 0 0', fontSize: 11.5, color: '#8B7355' }}>
            API publique : <code>GET /api/carousels/public/{form.slug || 'votre-slug'}</code>
          </p>

          <div>
            <label className="gc-label">Description (optionnel)</label>
            <textarea
              className="gc-field"
              rows={2}
              value={form.description}
              onChange={e => f('description', e.target.value)}
              placeholder="Usage interne — non affiché sur le site"
              style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
            />
          </div>
        </div>
      </Modal>
    </>
  )
}
