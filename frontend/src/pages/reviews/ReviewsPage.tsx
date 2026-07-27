import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown,
  MessageSquareQuote, Star,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ImageUploader } from '../../components/ui/ImageUploader'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Review {
  id: number
  text: string
  author_name: string
  origin: string
  avatar_url: string | null
  platform: 'google' | 'tripadvisor' | null
  rating: number
  sort_order: number
  is_active: boolean
}

const EMPTY = {
  text: '',
  author_name: '',
  origin: '',
  avatar_url: '',
  platform: '' as '' | 'google' | 'tripadvisor',
  rating: 5,
  is_active: true,
}

function platformLabel(p: Review['platform']) {
  if (p === 'google') return 'Google'
  if (p === 'tripadvisor') return 'TripAdvisor'
  return null
}

export default function ReviewsPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Review | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: reviews = [], isLoading } = useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: () => api.get('/admin/reviews').then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['reviews'] })

  const parseErrors = (e: any) => {
    const errs = e.response?.data?.errors ?? {}
    const flat: Record<string, string> = {}
    Object.entries(errs).forEach(([k, v]) => {
      flat[k] = Array.isArray(v) ? (v[0] as string) : String(v)
    })
    return flat
  }

  const addM = useMutation({
    mutationFn: (d: typeof EMPTY) => api.post('/admin/reviews', {
      ...d,
      platform: d.platform || null,
      avatar_url: d.avatar_url || null,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Avis ajouté') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const updateM = useMutation({
    mutationFn: (d: typeof EMPTY) => api.put(`/admin/reviews/${selected?.id}`, {
      ...d,
      platform: d.platform || null,
      avatar_url: d.avatar_url || null,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Avis mis à jour') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const toggleM = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/reviews/${id}/toggle`),
    onSuccess: invalidate,
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/reviews/${id}`),
    onSuccess: () => { invalidate(); toast.success('Avis supprimé') },
  })

  const reorderM = useMutation({
    mutationFn: (order: number[]) => api.post('/admin/reviews/reorder', { order }),
    onSuccess: invalidate,
  })

  const f = (key: keyof typeof EMPTY, val: unknown) =>
    setForm(p => ({ ...p, [key]: val }))

  const openAdd = () => {
    setForm(EMPTY)
    setFormErrors({})
    setSelected(null)
    setModal('add')
  }

  const openEdit = (review: Review) => {
    setSelected(review)
    setFormErrors({})
    setForm({
      text: review.text,
      author_name: review.author_name,
      origin: review.origin,
      avatar_url: review.avatar_url ?? '',
      platform: review.platform ?? '',
      rating: review.rating,
      is_active: review.is_active,
    })
    setModal('edit')
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.text.trim()) errs.text = 'Le texte de l\'avis est obligatoire.'
    if (!form.author_name.trim()) errs.author_name = 'Le nom du client est obligatoire.'
    if (!form.origin.trim()) errs.origin = 'La provenance est obligatoire.'
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = () => {
    if (!validate()) return
    modal === 'add' ? addM.mutate(form) : updateM.mutate(form)
  }

  const move = (idx: number, dir: -1 | 1) => {
    const order = reviews.map(r => r.id)
    const swap = idx + dir
    if (swap < 0 || swap >= order.length) return
    ;[order[idx], order[swap]] = [order[swap], order[idx]]
    reorderM.mutate(order)
  }

  const activeCount = reviews.filter(r => r.is_active).length

  return (
    <>
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <div className="gc-page-header-icon"><MessageSquareQuote size={18} /></div>
          <div>
            <p className="gc-page-header-title">Avis clients</p>
            <p className="gc-page-header-sub">
              {reviews.length} avis · {activeCount} actif{activeCount !== 1 ? 's' : ''} sur le site
            </p>
          </div>
        </div>
        <Button icon={<Plus size={14} />} onClick={openAdd}>Ajouter un avis</Button>
      </div>

      <div className="carousel-info-bar">
        <span className="carousel-info-dot" />
        Les avis actifs s&apos;affichent dans la section <strong>Avis & Réputation</strong> de la page d&apos;accueil
        et défilent tous dans le carrousel. Modifiez le titre et le sous-titre dans{' '}
        <strong>Contenu du site → Accueil → Avis clients</strong>.
      </div>

      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="gc-spinner" />
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="carousel-empty">
          <MessageSquareQuote size={40} style={{ color: 'var(--gc-gold-400)', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: 'var(--gc-noir-900)' }}>Aucun avis</p>
          <p style={{ fontSize: 13, color: 'var(--gc-noir-400)', marginBottom: 16 }}>
            Ajoutez manuellement les avis Google, TripAdvisor ou internes.
          </p>
          <Button icon={<Plus size={14} />} onClick={openAdd}>Ajouter un avis</Button>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="carousel-grid">
          {reviews.map((review, idx) => (
            <div key={review.id} className={`carousel-card${review.is_active ? '' : ' inactive'}`}>
              <div className="carousel-thumb">
                {review.avatar_url ? (
                  <img
                    src={review.avatar_url}
                    alt={review.author_name}
                    onError={e => {
                      ;(e.target as HTMLImageElement).src =
                        'https://placehold.co/120x120/1C1811/D4A017?text=Avatar'
                    }}
                  />
                ) : (
                  <div className="review-card-thumb-placeholder">
                    <MessageSquareQuote size={28} />
                  </div>
                )}
                <span className="carousel-order-badge">#{idx + 1}</span>
                <span className={`carousel-active-badge${review.is_active ? ' on' : ' off'}`}>
                  {review.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              <div className="carousel-card-body">
                <div className="carousel-card-meta">
                  <p className="carousel-card-title">{review.author_name}</p>
                  <p className="carousel-card-sub">{review.origin}</p>
                  <div className="carousel-card-tags">
                    <Badge status="neutral" size="xs">
                      <Star size={10} /> {review.rating}/5
                    </Badge>
                    {platformLabel(review.platform) && (
                      <Badge status="info" size="xs">{platformLabel(review.platform)}</Badge>
                    )}
                  </div>
                  <p className="review-card-excerpt">{review.text}</p>
                </div>

                <div className="carousel-card-actions">
                  <Button variant="ghost" size="xs" icon={<MoveUp size={12} />} onClick={() => move(idx, -1)} disabled={idx === 0} />
                  <Button variant="ghost" size="xs" icon={<MoveDown size={12} />} onClick={() => move(idx, 1)} disabled={idx === reviews.length - 1} />
                  <Button
                    variant="ghost" size="xs"
                    icon={review.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                    onClick={() => toggleM.mutate(review.id)}
                  >
                    {review.is_active ? 'Masquer' : 'Activer'}
                  </Button>
                  <Button variant="secondary" size="xs" icon={<Edit size={12} />} onClick={() => openEdit(review)}>
                    Modifier
                  </Button>
                  <Button
                    variant="danger" size="xs" iconOnly icon={<Trash2 size={12} />}
                    onClick={() => {
                      if (confirm(`Supprimer l'avis de ${review.author_name} ?`)) deleteM.mutate(review.id)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Nouvel avis' : 'Modifier l\'avis'}
        subtitle="Affiché sur la page d'accueil — section Avis & Réputation"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Annuler</Button>
            <Button loading={addM.isPending || updateM.isPending} onClick={submit}>
              {modal === 'add' ? 'Ajouter' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="gc-label">Texte de l&apos;avis *</label>
            <textarea
              className="gc-field"
              rows={4}
              value={form.text}
              onChange={e => { f('text', e.target.value); setFormErrors(p => ({ ...p, text: '' })) }}
              placeholder="Ce que le client a écrit…"
              style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }}
            />
            {formErrors.text && <p className="gc-field-error">{formErrors.text}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input
              label="Nom du client *"
              value={form.author_name}
              error={formErrors.author_name}
              onChange={e => { f('author_name', e.target.value); setFormErrors(p => ({ ...p, author_name: '' })) }}
              placeholder="Ex: Marie L."
            />
            <Input
              label="Provenance *"
              value={form.origin}
              error={formErrors.origin}
              onChange={e => { f('origin', e.target.value); setFormErrors(p => ({ ...p, origin: '' })) }}
              placeholder="Ex: France, TripAdvisor…"
            />
          </div>

          <Select
            label="Plateforme"
            value={form.platform}
            onChange={e => f('platform', e.target.value as typeof form.platform)}
          >
            <option value="">Auto (depuis provenance)</option>
            <option value="google">Google</option>
            <option value="tripadvisor">TripAdvisor</option>
          </Select>

          <Select
            label="Note"
            value={String(form.rating)}
            onChange={e => f('rating', Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map(n => (
              <option key={n} value={n}>{n} étoile{n > 1 ? 's' : ''}</option>
            ))}
          </Select>

          <div>
            <p className="citem-section-title" style={{ marginBottom: 8 }}>Photo du client</p>
            <ImageUploader
              value={form.avatar_url}
              onChange={url => f('avatar_url', url)}
            />
          </div>

          <label className="gc-checkbox-row">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => f('is_active', e.target.checked)}
            />
            <span>Visible sur le site</span>
          </label>
        </div>
      </Modal>
    </>
  )
}
