import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown,
  ArrowLeft, Images, ExternalLink, AlignLeft, AlignCenter, AlignRight,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ImageUploader } from '../../components/ui/ImageUploader'
import api from '../../api/client'
import toast from 'react-hot-toast'
import type { Carousel } from './CarouselPage'
import { galleryLayoutMode, homeCarouselLabel, isHomeCarousel, aboutSlotLabel } from './homeCarousels'

// ─── Types ───────────────────────────────────────────────────────────────────

interface CarouselItem {
  id: number
  carousel_id: number
  title: string | null
  subtitle: string | null
  description: string | null
  button_text: string | null
  button_link: string | null
  image_url: string
  image_alt: string | null
  text_position: 'left' | 'center' | 'right'
  overlay_opacity: number
  layout: string | null
  sort_order: number
  is_active: boolean
}

const EMPTY_ITEM = {
  image_url: '',
  image_alt: '',
  title: '',
  subtitle: '',
  description: '',
  button_text: '',
  button_link: '',
  text_position: 'center' as const,
  overlay_opacity: 40,
  layout: '',
  is_active: true,
}

const posIcon = (p: string) =>
  p === 'left' ? <AlignLeft size={11} /> : p === 'right' ? <AlignRight size={11} /> : <AlignCenter size={11} />

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CarouselItemsPage() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc       = useQueryClient()

  const [modal, setModal]         = useState<'add' | 'edit' | 'preview' | null>(null)
  const [selected, setSelected]   = useState<CarouselItem | null>(null)
  const [form, setForm]           = useState(EMPTY_ITEM)
  const [uploadedPath, setUploadedPath] = useState('')
  const [formErrors, setFormErrors]     = useState<Record<string, string>>({})

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: carousel, isLoading: loadingCarousel } = useQuery<Carousel>({
    queryKey: ['carousel', id],
    queryFn: () => api.get(`/admin/carousels/${id}`).then(r => r.data),
    enabled: !!id,
  })

  const { data: items = [], isLoading: loadingItems } = useQuery<CarouselItem[]>({
    queryKey: ['carousel-items', id],
    queryFn: () => api.get(`/admin/carousels/${id}/items`).then(r => r.data),
    enabled: !!id,
  })

  const loading = loadingCarousel || loadingItems
  const isGallery = carousel?.type === 'gallery'
  const layoutMode = galleryLayoutMode(carousel?.slug)

  // ── Mutations ────────────────────────────────────────────────────────────

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['carousel-items', id] })
    qc.invalidateQueries({ queryKey: ['carousel', id] })
    qc.invalidateQueries({ queryKey: ['carousels'] })
  }

  const parseErrors = (e: any) => {
    const errs = e.response?.data?.errors ?? {}
    const flat: Record<string, string> = {}
    Object.entries(errs).forEach(([k, v]) => { flat[k] = Array.isArray(v) ? (v[0] as string) : String(v) })
    return flat
  }

  const addM = useMutation({
    mutationFn: (d: typeof EMPTY_ITEM) => api.post(`/admin/carousels/${id}/items`, d),
    onSuccess: () => { invalidateAll(); setModal(null); toast.success('Image ajoutée') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const updateM = useMutation({
    mutationFn: (d: typeof EMPTY_ITEM) =>
      api.put(`/admin/carousels/${id}/items/${selected?.id}`, d),
    onSuccess: () => { invalidateAll(); setModal(null); toast.success('Image mise à jour') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const toggleM = useMutation({
    mutationFn: (itemId: number) => api.patch(`/admin/carousels/${id}/items/${itemId}/toggle`),
    onSuccess: invalidateAll,
  })

  const deleteM = useMutation({
    mutationFn: (itemId: number) => api.delete(`/admin/carousels/${id}/items/${itemId}`),
    onSuccess: () => { invalidateAll(); toast.success('Image supprimée') },
  })

  const reorderM = useMutation({
    mutationFn: (order: number[]) =>
      api.post(`/admin/carousels/${id}/items/reorder`, { order }),
    onSuccess: invalidateAll,
  })

  // ── Handlers ─────────────────────────────────────────────────────────────

  const openAdd = () => {
    setForm(EMPTY_ITEM); setUploadedPath(''); setFormErrors({}); setModal('add')
  }

  const openEdit = (item: CarouselItem) => {
    setSelected(item)
    setUploadedPath('')
    setFormErrors({})
    setForm({
      image_url: item.image_url,
      image_alt: item.image_alt ?? '',
      title: item.title ?? '',
      subtitle: item.subtitle ?? '',
      description: item.description ?? '',
      button_text: item.button_text ?? '',
      button_link: item.button_link ?? '',
      text_position: item.text_position,
      overlay_opacity: item.overlay_opacity,
      layout: item.layout ?? '',
      is_active: item.is_active,
    })
    setModal('edit')
  }

  const openPreview = (item: CarouselItem) => { setSelected(item); setModal('preview') }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.image_url.trim()) errs.image_url = "Veuillez téléverser ou coller l'URL d'une image."
    setFormErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = () => {
    if (!validate()) return
    const payload = {
      ...form,
      layout: form.layout || null,
    }
    modal === 'add' ? addM.mutate(payload as typeof EMPTY_ITEM) : updateM.mutate(payload as typeof EMPTY_ITEM)
  }

  const move = (idx: number, dir: -1 | 1) => {
    const order = items.map(i => i.id)
    const swap  = idx + dir
    if (swap < 0 || swap >= order.length) return
    ;[order[idx], order[swap]] = [order[swap], order[idx]]
    reorderM.mutate(order)
  }

  const f = (key: keyof typeof EMPTY_ITEM, val: any) =>
    setForm(p => ({ ...p, [key]: val }))

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <button className="citem-back-btn" onClick={() => navigate('/carousel')}>
            <ArrowLeft size={15} />
          </button>
          <div className="gc-page-header-icon"><Images size={18} /></div>
          <div>
            <p className="gc-page-header-title">
              {loadingCarousel ? '…' : carousel?.name ?? 'Collection'}
            </p>
            <p className="gc-page-header-sub">
              {isGallery ? 'Galerie' : 'Carousel'}
              {carousel?.slug && <> · <code>{carousel.slug}</code></>}
              {' — '}{items.length} image{items.length !== 1 ? 's' : ''},{' '}
              {items.filter(i => i.is_active).length} active{items.filter(i => i.is_active).length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Button icon={<Plus size={14} />} onClick={openAdd}>Ajouter une image</Button>
      </div>

      {/* Info bar */}
      <div className="carousel-info-bar">
        <span className="carousel-info-dot" />
        {carousel?.is_system ? (
          <>
            <strong>{isHomeCarousel(carousel.slug) ? "Collection page d'accueil" : 'Collection système'}</strong>
            {homeCarouselLabel(carousel.slug) && <> ({homeCarouselLabel(carousel.slug)})</>}.
            {' '}Non supprimable — modifiez les images, l&apos;ordre et les textes ici.
            {carousel.slug === 'home-spa-gallery' && (
              <> Pour la galerie spa, renseignez le champ <strong>layout</strong> avec un numéro d&apos;emplacement (1 à 7).</>
            )}
            {carousel.slug === 'home-vip-lounge' && (
              <> Pour le VIP Lounge, renseignez <strong>layout</strong> avec <code>main</code>, <code>top</code> ou <code>bottom</code>.</>
            )}
            {carousel.slug === 'spa-reservation' && (
              <> Ces images s&apos;affichent sur la page <strong>/spa/reservation</strong> avec navigation par flèches.</>
            )}
            {carousel.slug === 'about-us-gallery' && (
              <> Pour la page <strong>/about</strong>, renseignez <strong>layout</strong> avec{' '}
                <code>hero</code>, <code>photo-1</code>, <code>photo-2</code>, <code>1</code>–<code>5</code> (mosaïque) ou laissez vide.</>
            )}
          </>
        ) : isGallery ? (
          <>Galerie consommée via <code>GET /api/carousels/public/{carousel?.slug}</code>. L&apos;admin peut remplacer ou réordonner les images à tout moment.</>
        ) : (
          <>Carousel consommé via <code>GET /api/carousels/public/{carousel?.slug}</code>. Slides avec texte/CTA optionnels.</>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="gc-spinner" />
        </div>
      )}

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div className="carousel-empty">
          <Images size={40} style={{ color: 'var(--gc-gold-400)', marginBottom: 12 }} />
          <p style={{ fontWeight: 600, color: 'var(--gc-noir-900)' }}>Aucune image</p>
          <p style={{ fontSize: 13, color: 'var(--gc-noir-400)', marginBottom: 16 }}>
            Ajoutez des images à cette collection.
          </p>
          <Button icon={<Plus size={14} />} onClick={openAdd}>Ajouter une image</Button>
        </div>
      )}

      {/* Items grid */}
      {!loading && items.length > 0 && (
        <div className="carousel-grid">
          {items.map((item, idx) => (
            <div key={item.id} className={`carousel-card${item.is_active ? '' : ' inactive'}`}>

              {/* Thumbnail */}
              <div className="carousel-thumb">
                <img
                  src={item.image_url}
                  alt={item.image_alt ?? item.title ?? ''}
                  onError={e => {
                    ;(e.target as HTMLImageElement).src =
                      'https://placehold.co/800x400/1C1811/D4A017?text=Image'
                  }}
                />
                {!isGallery && (
                  <>
                    <div className="carousel-thumb-overlay" style={{ opacity: item.overlay_opacity / 100 }} />
                    <div className={`carousel-thumb-text pos-${item.text_position}`}>
                      {item.title    && <p className="carousel-thumb-title">{item.title}</p>}
                      {item.subtitle && <p className="carousel-thumb-sub">{item.subtitle}</p>}
                      {item.button_text && <span className="carousel-thumb-btn">{item.button_text}</span>}
                    </div>
                  </>
                )}
                <span className="carousel-order-badge">#{idx + 1}</span>
                <span className={`carousel-active-badge${item.is_active ? ' on' : ' off'}`}>
                  {item.is_active ? 'Actif' : 'Inactif'}
                </span>
              </div>

              {/* Card body */}
              <div className="carousel-card-body">
                <div className="carousel-card-meta">
                  <p className="carousel-card-title">
                    {item.title || item.image_alt || <span style={{ color: '#B89E72', fontStyle: 'italic' }}>Sans légende</span>}
                  </p>
                  {!isGallery && item.subtitle && <p className="carousel-card-sub">{item.subtitle}</p>}
                  <div className="carousel-card-tags">
                    {isGallery && item.layout && (
                      <Badge status="info" size="xs">
                        {layoutMode === 'spa-slots'
                          ? `Slot ${item.layout}`
                          : layoutMode === 'vip-slots'
                            ? item.layout
                            : layoutMode === 'about-slots'
                              ? aboutSlotLabel(item.layout)
                              : `Format ${item.layout}`}
                      </Badge>
                    )}
                    {isGallery && !item.layout && layoutMode === 'about-slots' && (
                      <Badge status="neutral" size="xs">Galerie</Badge>
                    )}
                    {!isGallery && (
                      <>
                        <Badge status="neutral" size="xs">{posIcon(item.text_position)} {item.text_position}</Badge>
                        <Badge status="neutral" size="xs">Opacité {item.overlay_opacity}%</Badge>
                        {item.button_link && <Badge status="info" size="xs"><ExternalLink size={10} /> CTA</Badge>}
                      </>
                    )}
                  </div>
                </div>

                <div className="carousel-card-actions">
                  {/* Reorder */}
                  <div className="carousel-reorder">
                    <button
                      className="carousel-arrow-btn"
                      disabled={idx === 0 || reorderM.isPending}
                      onClick={() => move(idx, -1)} title="Monter"
                    ><MoveUp size={13} /></button>
                    <button
                      className="carousel-arrow-btn"
                      disabled={idx === items.length - 1 || reorderM.isPending}
                      onClick={() => move(idx, 1)} title="Descendre"
                    ><MoveDown size={13} /></button>
                  </div>

                  <Button variant="ghost" size="xs"
                    icon={item.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                    onClick={() => toggleM.mutate(item.id)}
                  >
                    {item.is_active ? 'Masquer' : 'Afficher'}
                  </Button>
                  {!isGallery && (
                    <Button variant="ghost" size="xs" icon={<Eye size={12} />}
                      onClick={() => openPreview(item)}>Aperçu</Button>
                  )}
                  <Button variant="secondary" size="xs" icon={<Edit size={12} />}
                    onClick={() => openEdit(item)}>Modifier</Button>
                  <Button variant="danger" size="xs" iconOnly icon={<Trash2 size={12} />}
                    onClick={() => {
                      if (confirm('Supprimer cette image ?')) deleteM.mutate(item.id)
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Add / Edit modal — xl with live preview ─────────────── */}
      <Modal
        open={modal === 'add' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Ajouter une image' : "Modifier l'image"}
        subtitle={isGallery
          ? 'Image + légende optionnelle + format de grille'
          : (form.image_url ? "L'aperçu se met à jour en temps réel" : "Commencez par téléverser une image")}
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Annuler</Button>
            <Button loading={addM.isPending || updateM.isPending} onClick={submit}>
              {modal === 'add' ? 'Ajouter' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div className={`citem-editor${form.image_url ? ' has-image' : ''}`}>

          {/* ── LEFT: sticky live preview — hidden until image set ─ */}
          <div className={`citem-preview-col${form.image_url ? ' visible' : ''}`}>
            <p className="citem-preview-label">Aperçu en direct</p>
            <div className="citem-live-preview">
              {form.image_url ? (
                <img
                  src={form.image_url}
                  alt={form.image_alt || 'preview'}
                  className="citem-live-img"
                  onError={e => {
                    ;(e.target as HTMLImageElement).src =
                      'https://placehold.co/800x450/1C1811/D4A017?text=Image'
                  }}
                />
              ) : (
                <div className="citem-live-placeholder">
                  <Images size={28} />
                  <span>Ajoutez une image pour voir l'aperçu</span>
                </div>
              )}

              {/* Overlay — carousel only */}
              {!isGallery && form.image_url && (
                <div className="citem-live-overlay" style={{ opacity: form.overlay_opacity / 100 }} />
              )}

              {/* Text layer */}
              {!isGallery && form.image_url && (form.title || form.subtitle || form.button_text) && (
                <div className={`citem-live-text pos-${form.text_position}`}>
                  {form.subtitle && (
                    <p className="citem-live-eyebrow">{form.subtitle}</p>
                  )}
                  {form.title && (
                    <h3 className="citem-live-title">{form.title}</h3>
                  )}
                  {form.description && (
                    <p className="citem-live-desc">{form.description}</p>
                  )}
                  {form.button_text && (
                    <span className="citem-live-cta">{form.button_text}</span>
                  )}
                </div>
              )}

              {/* Inactive ribbon */}
              {!form.is_active && form.image_url && (
                <div className="citem-live-inactive-ribbon">Inactif</div>
              )}
            </div>

            {/* Quick stats below preview */}
            {form.image_url && (
              <div className="citem-preview-stats">
                {!isGallery && <span>Position : <strong>{form.text_position}</strong></span>}
                {!isGallery && <span>Opacité : <strong>{form.overlay_opacity}%</strong></span>}
                {isGallery && form.layout && (
                  <span>
                    {layoutMode === 'spa-slots'
                      ? 'Emplacement'
                      : layoutMode === 'vip-slots'
                        ? 'Slot'
                        : layoutMode === 'about-slots'
                          ? 'Emplacement'
                          : 'Format'} :{' '}
                    <strong>{layoutMode === 'about-slots' ? (form.layout ? aboutSlotLabel(form.layout) : 'Galerie') : form.layout}</strong>
                  </span>
                )}
                <span className={form.is_active ? 'stat-active' : 'stat-inactive'}>
                  {form.is_active ? '● Actif' : '○ Inactif'}
                </span>
              </div>
            )}
          </div>

          {/* ── RIGHT: scrollable form ────────────────────────── */}
          <div className="citem-form-col">

            {/* Image uploader */}
            <div className="citem-form-section">
              <p className="citem-section-title">Image</p>
              <ImageUploader
                value={form.image_url}
                onChange={url => { f('image_url', url); setFormErrors(p => ({ ...p, image_url: '' })) }}
                uploadedPath={uploadedPath}
                onPathChange={path => setUploadedPath(path)}
              />
              {formErrors.image_url && <p className="gc-field-error">{formErrors.image_url}</p>}
              <div style={{ marginTop: 10 }}>
                <Input
                  label="Texte alternatif (SEO)"
                  value={form.image_alt}
                  onChange={e => f('image_alt', e.target.value)}
                  placeholder="Piscine extérieure du Golden Carthage"
                />
              </div>
            </div>

            {isGallery ? (
              <div className="citem-form-section">
                <p className="citem-section-title">Légende & format</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Input
                    label="Légende (optionnel)"
                    value={form.title}
                    onChange={e => f('title', e.target.value)}
                    placeholder="Vue piscine"
                  />
                  {layoutMode === 'spa-slots' ? (
                    <Select
                      label="Emplacement (1 à 7)"
                      value={form.layout}
                      onChange={e => f('layout', e.target.value)}
                    >
                      <option value="">— Choisir —</option>
                      {(['1', '2', '3', '4', '5', '6', '7'] as const).map(n => (
                        <option key={n} value={n}>Emplacement {n}</option>
                      ))}
                    </Select>
                  ) : layoutMode === 'vip-slots' ? (
                    <Select
                      label="Emplacement VIP"
                      value={form.layout}
                      onChange={e => f('layout', e.target.value)}
                    >
                      <option value="">— Choisir —</option>
                      <option value="main">Image principale (main)</option>
                      <option value="top">Image haute (top)</option>
                      <option value="bottom">Image basse (bottom)</option>
                    </Select>
                  ) : layoutMode === 'about-slots' ? (
                    <Select
                      label="Emplacement page À propos"
                      value={form.layout}
                      onChange={e => f('layout', e.target.value)}
                    >
                      <option value="">Auto (ordre d&apos;affichage)</option>
                      <option value="hero">Hero — image principale</option>
                      <option value="photo-1">Section — photo 1 (grande)</option>
                      <option value="photo-2">Section — photo 2 (encadrée)</option>
                      <option value="1">Mosaïque — photo 1 (gauche haut)</option>
                      <option value="2">Mosaïque — photo 2 (gauche bas)</option>
                      <option value="3">Mosaïque — photo 3 (centre)</option>
                      <option value="4">Mosaïque — photo 4 (droite haut)</option>
                      <option value="5">Mosaïque — photo 5 (droite bas)</option>
                    </Select>
                  ) : (
                    <Select
                      label="Format dans la grille"
                      value={form.layout}
                      onChange={e => f('layout', e.target.value)}
                    >
                      <option value="">Normal</option>
                      <option value="large">Grande (2×2)</option>
                      <option value="wide">Large (pleine largeur)</option>
                    </Select>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="citem-form-section">
                  <p className="citem-section-title">Contenu texte</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Input label="Titre" value={form.title} onChange={e => f('title', e.target.value)} placeholder="Découvrez notre hôtel" />
                    <Input label="Sous-titre / Accroche" value={form.subtitle} onChange={e => f('subtitle', e.target.value)} placeholder="Une expérience unique en Tunisie" />
                    <div>
                      <label className="gc-label">Description</label>
                      <textarea className="gc-field" rows={2} value={form.description} onChange={e => f('description', e.target.value)} placeholder="Texte descriptif optionnel…" style={{ resize: 'vertical', fontFamily: 'inherit', fontSize: 13 }} />
                    </div>
                  </div>
                </div>
                <div className="citem-form-section">
                  <p className="citem-section-title">Bouton d'action (CTA)</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Input label="Texte du bouton" value={form.button_text} onChange={e => f('button_text', e.target.value)} placeholder="Réserver maintenant" />
                    <Input label="Lien" value={form.button_link} onChange={e => f('button_link', e.target.value)} placeholder="/reservations" />
                  </div>
                </div>
              </>
            )}

            <div className="citem-form-section">
              <p className="citem-section-title">Affichage</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                {!isGallery && (
                  <>
                    <div>
                      <label className="gc-label">Position du texte</label>
                      <div className="citem-pos-btns">
                        {(['left', 'center', 'right'] as const).map(pos => (
                          <button key={pos} type="button" className={`citem-pos-btn${form.text_position === pos ? ' active' : ''}`} onClick={() => f('text_position', pos)}>
                            {pos === 'left' && <AlignLeft size={14} />}
                            {pos === 'center' && <AlignCenter size={14} />}
                            {pos === 'right' && <AlignRight size={14} />}
                            <span>{pos === 'left' ? 'Gauche' : pos === 'center' ? 'Centre' : 'Droite'}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="gc-label">Opacité du fond noir <span className="citem-opacity-val">{form.overlay_opacity}%</span></label>
                      <div className="citem-opacity-track">
                        <span className="citem-opacity-hint">Clair</span>
                        <input type="range" min={0} max={80} value={form.overlay_opacity} onChange={e => f('overlay_opacity', Number(e.target.value))} className="carousel-range" style={{ flex: 1 }} />
                        <span className="citem-opacity-hint">Sombre</span>
                      </div>
                    </div>
                  </>
                )}

                {/* Active toggle */}
                <div>
                  <label className="gc-label">Visibilité</label>
                  <div className="citem-visibility-btns">
                    <button
                      type="button"
                      className={`citem-vis-btn${form.is_active ? ' active' : ''}`}
                      onClick={() => f('is_active', true)}
                    >
                      <Eye size={13} /> Actif — visible sur le site
                    </button>
                    <button
                      type="button"
                      className={`citem-vis-btn${!form.is_active ? ' inactive-on' : ''}`}
                      onClick={() => f('is_active', false)}
                    >
                      <EyeOff size={13} /> Inactif — masqué
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* ── Quick preview modal (from card) ─────────────────────── */}
      <Modal
        open={modal === 'preview' && selected !== null}
        onClose={() => setModal(null)}
        title={`Aperçu — ${selected?.title ?? 'Sans titre'}`}
        subtitle="Rendu approximatif tel qu'il apparaîtra sur le site"
        size="lg"
      >
        {selected && (
          <div className="carousel-preview-wrap">
            <img
              src={selected.image_url}
              alt={selected.image_alt ?? ''}
              className="carousel-preview-img"
              onError={e => {
                ;(e.target as HTMLImageElement).src =
                  'https://placehold.co/800x400/1C1811/D4A017?text=Image'
              }}
            />
            <div className="carousel-preview-overlay" style={{ opacity: selected.overlay_opacity / 100 }} />
            <div className={`carousel-preview-content pos-${selected.text_position}`}>
              {selected.subtitle && <p className="carousel-preview-eyebrow">{selected.subtitle}</p>}
              {selected.title    && <h2 className="carousel-preview-title">{selected.title}</h2>}
              {selected.description && <p className="carousel-preview-desc">{selected.description}</p>}
              {selected.button_text && (
                <a href={selected.button_link ?? '#'} className="carousel-preview-cta"
                   onClick={e => e.preventDefault()}>
                  {selected.button_text}
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
