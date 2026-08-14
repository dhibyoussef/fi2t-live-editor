import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Upload, GripVertical, Star, ArrowLeft, ChevronRight, LayoutGrid, ExternalLink, Newspaper } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadImageFile } from '../../../lib/uploadImageFile'
import PageTreeEditor from './PageTreeEditor'
import { resolvePreviewImageUrl } from '../builder/previewAssets'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseArray<T>(raw: string, fallback: T[]): T[] {
  if (!raw?.trim()) return fallback
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as T[] : fallback
  } catch {
    return fallback
  }
}

async function uploadContentImage(file: File): Promise<string> {
  const data = await uploadImageFile(file, '/admin/content/upload-image')
  return data.url
}

// ─── Shared UI ───────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="wc-field">
      <label className="wc-field-label">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder = '' }: {
  value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <input
      className="wc-field-input"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
  )
}

function ImageField({ value, onChange, label = 'Image' }: {
  value: string; onChange: (v: string) => void; label?: string
}) {
  const upload = async (file: File) => {
    try {
      onChange(await uploadContentImage(file))
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erreur lors du téléversement')
    }
  }

  return (
    <Field label={label}>
      <div className="wc-card-image-row">
        <div className="wc-card-image-preview">
          {value ? <img src={resolvePreviewImageUrl(value)} alt="" /> : <span>Aucune image</span>}
        </div>
        <div className="wc-card-image-actions">
          <TextInput value={value} onChange={onChange} placeholder="URL de l'image" />
          <label className="wc-upload-btn">
            <Upload size={13} /> Choisir une image
            <input type="file" accept="image/*" hidden onChange={e => {
              const f = e.target.files?.[0]
              if (f) upload(f)
              e.target.value = ''
            }} />
          </label>
        </div>
      </div>
    </Field>
  )
}

function ItemCard({ index, title, onRemove, children }: {
  index: number; title: string; onRemove: () => void; children: React.ReactNode
}) {
  return (
    <div className="wc-item-card">
      <div className="wc-item-card-head">
        <GripVertical size={14} className="wc-item-grip" />
        <span className="wc-item-card-title">{title} {index + 1}</span>
        <button type="button" className="wc-item-remove" onClick={onRemove} title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="wc-item-card-body">{children}</div>
    </div>
  )
}

// ─── Room cards ──────────────────────────────────────────────────────────────

interface RoomCard {
  name: string
  desc: string
  image: string
  badge?: string
  promo?: string
  stars?: number
}

const DEFAULT_ROOM: RoomCard = { name: '', desc: '', image: '', stars: 5 }

function RoomCardsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<RoomCard>(value, [])

  const update = (next: RoomCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Ajoutez ou modifiez les chambres affichées sur la page d'accueil.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Chambre" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <div className="wc-field-grid">
            <Field label="Nom de la chambre">
              <TextInput value={item.name} onChange={v => update(items.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Ex: Suite Junior" />
            </Field>
            <Field label="Nombre d'étoiles">
              <div className="wc-stars-picker">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    className={`wc-star-btn${(item.stars ?? 5) >= n ? ' active' : ''}`}
                    onClick={() => update(items.map((x, j) => j === i ? { ...x, stars: n } : x))}
                  >
                    <Star size={14} />
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field label="Description courte">
            <textarea
              className="wc-field-input"
              rows={2}
              value={item.desc}
              onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))}
              placeholder="Petite description de la chambre…"
            />
          </Field>
          <ImageField
            value={item.image}
            onChange={v => update(items.map((x, j) => j === i ? { ...x, image: v } : x))}
          />
          <div className="wc-field-grid">
            <Field label="Badge (optionnel)">
              <TextInput value={item.badge ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, badge: v || undefined } : x))} placeholder="Ex: En Vedette" />
            </Field>
            <Field label="Promo (optionnel)">
              <TextInput value={item.promo ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, promo: v || undefined } : x))} placeholder="Ex: -30%" />
            </Field>
          </div>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { ...DEFAULT_ROOM }])}>
        <Plus size={14} /> Ajouter une chambre
      </button>
    </div>
  )
}

// ─── Restaurant cards ────────────────────────────────────────────────────────

interface RestoCard { name: string; image: string; images?: string[] }
const DEFAULT_RESTO: RestoCard = { name: '', image: '', images: [] }

function RestaurantCardsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<RestoCard>(value, [])
  const update = (next: RestoCard[]) => onChange(JSON.stringify(next))

  const galleryText = (item: RestoCard) => (item.images ?? []).join('\n')
  const setGallery = (i: number, raw: string) => {
    const images = raw.split('\n').map(s => s.trim()).filter(Boolean)
    update(items.map((x, j) => j === i ? {
      ...x,
      images,
      image: images[0] ?? x.image,
    } : x))
  }

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Restaurants affichés sur la page d&apos;accueil (secours si l&apos;API lieux n&apos;est pas disponible). Gérez les restaurants depuis Venues → Restaurants.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Restaurant" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Nom du restaurant">
            <TextInput value={item.name} onChange={v => update(items.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Ex: CALCUTA" />
          </Field>
          <ImageField
            value={item.image}
            onChange={v => update(items.map((x, j) => j === i ? { ...x, image: v, images: v ? [v, ...(x.images ?? []).filter(u => u !== v)] : x.images } : x))}
            label="Photo principale"
          />
          <Field label="Galerie (une URL par ligne)">
            <textarea
              className="wc-field-input"
              rows={3}
              value={galleryText(item)}
              onChange={e => setGallery(i, e.target.value)}
              placeholder="URLs des photos pour le carrousel réservation"
            />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { ...DEFAULT_RESTO }])}>
        <Plus size={14} /> Ajouter un restaurant
      </button>
    </div>
  )
}

// ─── Gallery photos ──────────────────────────────────────────────────────────

interface PhotoItem { image: string; large?: boolean; wide?: boolean }
const DEFAULT_PHOTO: PhotoItem = { image: '' }

function GalleryPhotosEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<PhotoItem>(value, [])
  const update = (next: PhotoItem[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Photos de la galerie. Cochez « Grande » ou « Large » pour modifier la taille d'affichage.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Photo" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <ImageField value={item.image} onChange={v => update(items.map((x, j) => j === i ? { ...x, image: v } : x))} label="Photo" />
          <div className="wc-check-row">
            <label className="wc-check">
              <input
                type="checkbox"
                checked={!!item.large}
                onChange={e => update(items.map((x, j) => j === i ? { ...x, large: e.target.checked || undefined, wide: e.target.checked ? undefined : x.wide } : x))}
              />
              Grande photo (haute)
            </label>
            <label className="wc-check">
              <input
                type="checkbox"
                checked={!!item.wide}
                onChange={e => update(items.map((x, j) => j === i ? { ...x, wide: e.target.checked || undefined, large: e.target.checked ? undefined : x.large } : x))}
              />
              Photo large (pleine largeur)
            </label>
          </div>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { ...DEFAULT_PHOTO }])}>
        <Plus size={14} /> Ajouter une photo
      </button>
    </div>
  )
}

// ─── Reviews ─────────────────────────────────────────────────────────────────

interface ReviewItem { text: string; name: string; origin: string; avatar: string; platform?: 'google' | 'tripadvisor' }
const DEFAULT_REVIEW: ReviewItem = { text: '', name: '', origin: '', avatar: '' }

function ReviewsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<ReviewItem>(value, [])
  const update = (next: ReviewItem[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Avis clients — tous défilent dans le carrousel témoignages (2 visibles à la fois).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Avis" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Texte de l'avis">
            <textarea
              className="wc-field-input"
              rows={3}
              value={item.text}
              onChange={e => update(items.map((x, j) => j === i ? { ...x, text: e.target.value } : x))}
              placeholder="Ce que le client a écrit…"
            />
          </Field>
          <div className="wc-field-grid">
            <Field label="Nom du client">
              <TextInput value={item.name} onChange={v => update(items.map((x, j) => j === i ? { ...x, name: v } : x))} placeholder="Ex: Marie L." />
            </Field>
            <Field label="Provenance">
              <TextInput value={item.origin} onChange={v => update(items.map((x, j) => j === i ? { ...x, origin: v } : x))} placeholder="Ex: TripAdvisor, France…" />
            </Field>
          </div>
          <Field label="Plateforme">
            <select
              className="wc-field-input"
              value={item.platform ?? ''}
              onChange={e => update(items.map((x, j) => j === i ? { ...x, platform: (e.target.value || undefined) as ReviewItem['platform'] } : x))}
            >
              <option value="">Auto (depuis provenance)</option>
              <option value="google">Google</option>
              <option value="tripadvisor">TripAdvisor</option>
            </select>
          </Field>
          <ImageField value={item.avatar} onChange={v => update(items.map((x, j) => j === i ? { ...x, avatar: v } : x))} label="Photo du client" />
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { ...DEFAULT_REVIEW }])}>
        <Plus size={14} /> Ajouter un avis
      </button>
    </div>
  )
}

// ─── Wedding cards ───────────────────────────────────────────────────────────

interface WeddingCardItem { icon: string; text: string }
const DEFAULT_WEDDING: WeddingCardItem = { icon: '/imgs/wedding1.svg', text: '' }

function WeddingCardsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<WeddingCardItem>(value, [])
  const update = (next: WeddingCardItem[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Cartes de la section Mariages & Noces.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Carte" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <ImageField value={item.icon} onChange={v => update(items.map((x, j) => j === i ? { ...x, icon: v } : x))} label="Icône" />
          <Field label="Texte">
            <textarea className="wc-field-input" rows={3} value={item.text} onChange={e => update(items.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { ...DEFAULT_WEDDING }])}>
        <Plus size={14} /> Ajouter une carte
      </button>
    </div>
  )
}

// ─── Service items ───────────────────────────────────────────────────────────

interface ServiceIconSet { base: string; overlay?: string }
interface ServiceItem { title: string; icons: ServiceIconSet }
const DEFAULT_SERVICE: ServiceItem = { title: '', icons: { base: '/imgs/wifi.svg' } }

function ServiceItemsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<ServiceItem>(value, [])
  const update = (next: ServiceItem[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Services du carrousel (titre + icônes SVG).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Service" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre (\\n pour retour à la ligne)">
            <textarea className="wc-field-input" rows={2} value={item.title} onChange={e => update(items.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
          </Field>
          <ImageField value={item.icons.base} onChange={v => update(items.map((x, j) => j === i ? { ...x, icons: { ...x.icons, base: v } } : x))} label="Icône principale" />
          <ImageField value={item.icons.overlay ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, icons: { ...x.icons, overlay: v || undefined } } : x))} label="Icône overlay (optionnel)" />
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { ...DEFAULT_SERVICE }])}>
        <Plus size={14} /> Ajouter un service
      </button>
    </div>
  )
}

// ─── Generic simple cards ────────────────────────────────────────────────────

interface SimpleCard { title: string; text: string; image: string }
const DEFAULT_SIMPLE: SimpleCard = { title: '', text: '', image: '' }

function SimpleCardsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<SimpleCard>(value, [])
  const update = (next: SimpleCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Liste d'éléments avec titre, texte et image.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Élément" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Texte">
            <textarea className="wc-field-input" rows={2} value={item.text} onChange={e => update(items.map((x, j) => j === i ? { ...x, text: e.target.value } : x))} />
          </Field>
          <ImageField value={item.image} onChange={v => update(items.map((x, j) => j === i ? { ...x, image: v } : x))} />
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { ...DEFAULT_SIMPLE }])}>
        <Plus size={14} /> Ajouter un élément
      </button>
    </div>
  )
}

// ─── FI2T home / organisation lists ──────────────────────────────────────────

interface ObjectifItem { num?: string; title: string; desc: string }
interface GroupementCard { label: string; slug: string; icon: string }
interface ReasonItem { title: string; desc: string }
interface NewsCard {
  slug: string
  title: string
  desc: string
  date: string
  img: string
  hero_title?: string
  subtitle?: string
  quote?: string
  intro?: string
  sections?: Array<{ question: string; answer: string }>
  source?: string
}

function ObjectifsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<ObjectifItem>(value, [])
  const update = (next: ObjectifItem[]) =>
    onChange(JSON.stringify(next.map(({ num: _storedNumber, ...item }) => item)))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Objectifs (titre et description). Le numéro suit automatiquement l’ordre de la liste. 4 par page sur le site.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Objectif" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={3} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, {
          title: 'Nouvel objectif',
          desc: '',
        }])}
      >
        <Plus size={14} /> Ajouter un objectif
      </button>
    </div>
  )
}

function GroupementsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<GroupementCard>(value, [])
  const update = (next: GroupementCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Groupements professionnels (nom, slug URL, icône).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Groupement" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Nom">
            <TextInput value={item.label ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, label: v } : x))} />
          </Field>
          <Field label="Slug (URL)">
            <TextInput value={item.slug ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, slug: v } : x))} placeholder="tourisme-culturel" />
          </Field>
          <ImageField value={item.icon ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, icon: v } : x))} label="Icône" />
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, { label: 'Nouveau groupement', slug: '', icon: '/images/icon1.png?v=5' }])}
      >
        <Plus size={14} /> Ajouter un groupement
      </button>
    </div>
  )
}

function ReasonsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<ReasonItem>(value, [])
  const update = (next: ReasonItem[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Raisons d'adhérer (titre + description).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Raison" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={2} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { title: '', desc: '' }])}>
        <Plus size={14} /> Ajouter un bénéfice
      </button>
    </div>
  )
}

/** Same structure for every article page (mirrors website Fi2tArticlePage). */
const ARTICLE_PAGE_STRUCTURE = [
  {
    id: 'hero',
    title: 'Bannière',
    hint: 'Titre affiché sur la bannière de la page article',
  },
  {
    id: 'card',
    title: 'Carte (liste Actualités)',
    hint: 'Titre, extrait, date, slug et image dans la grille',
  },
  {
    id: 'header',
    title: 'En-tête article',
    hint: 'Titre, sous-titre, citation et introduction',
  },
  {
    id: 'body',
    title: 'Corps / questions-réponses',
    hint: 'Texte simple ou accordéon Q&R',
  },
  {
    id: 'source',
    title: 'Source',
    hint: 'Ligne de crédit en bas de page',
  },
] as const

type ArticleView = 'list' | 'structure' | 'section'
type ArticleSectionId = (typeof ARTICLE_PAGE_STRUCTURE)[number]['id']

function emptyArticle(): NewsCard {
  const stamp = Date.now()
  return {
    slug: `nouvel-article-${stamp}`,
    title: 'Nouvel article',
    desc: 'Résumé de l’article…',
    date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
    img: '/images/act1.png?v=6',
    hero_title: 'Nouvel article',
    subtitle: '',
    quote: '',
    intro: 'Introduction de l’article…',
    sections: [
      { question: 'Question 1', answer: 'Réponse…' },
      { question: 'Question 2', answer: 'Réponse…' },
    ],
    source: 'Source : Fi2T',
  }
}

function patchArticle(items: NewsCard[], index: number, patch: Partial<NewsCard>): NewsCard[] {
  return items.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

/**
 * Drill-down like other CMS pages:
 * 1) Liste des articles → 2) Structure de la page (standard) → 3) Édition d’une section.
 */
function NewsCardsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<NewsCard>(value, [])
  const update = (next: NewsCard[]) => onChange(JSON.stringify(next))
  const [view, setView] = useState<ArticleView>('list')
  const [selected, setSelected] = useState(-1)
  const [activeSection, setActiveSection] = useState<ArticleSectionId>('hero')
  const [query, setQuery] = useState('')

  const article = selected >= 0 && selected < items.length ? items[selected] : null

  const filtered = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => {
      const q = query.trim().toLowerCase()
      if (!q) return true
      return (
        (item.title ?? '').toLowerCase().includes(q)
        || (item.slug ?? '').toLowerCase().includes(q)
        || (item.date ?? '').toLowerCase().includes(q)
      )
    })

  const setField = <K extends keyof NewsCard>(key: K, fieldValue: NewsCard[K]) => {
    if (selected < 0) return
    update(patchArticle(items, selected, { [key]: fieldValue } as Partial<NewsCard>))
  }

  const setQa = (sectionIndex: number, patch: Partial<{ question: string; answer: string }>) => {
    if (!article || selected < 0) return
    const sections = [...(article.sections ?? [])]
    sections[sectionIndex] = { ...sections[sectionIndex], ...patch }
    setField('sections', sections)
  }

  const addQa = () => {
    if (!article) return
    setField('sections', [...(article.sections ?? []), { question: 'Nouvelle question', answer: 'Réponse…' }])
  }

  const removeQa = (sectionIndex: number) => {
    if (!article) return
    setField('sections', (article.sections ?? []).filter((_, i) => i !== sectionIndex))
  }

  const openArticle = (index: number) => {
    setSelected(index)
    setView('structure')
    setActiveSection('hero')
  }

  const addArticle = () => {
    update([emptyArticle(), ...items])
    setSelected(0)
    setView('structure')
    setActiveSection('hero')
  }

  const removeArticle = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    update(next)
    setSelected(-1)
    setView('list')
  }

  const siteBase = import.meta.env.VITE_WEBSITE_ORIGIN ?? import.meta.env.VITE_PUBLIC_SITE_URL ?? 'http://127.0.0.1:3002'
  const sectionMeta = ARTICLE_PAGE_STRUCTURE.find((s) => s.id === activeSection)

  /* ─── 1) Liste des articles ───────────────────────────────────────────── */
  if (view === 'list' || !article) {
    return (
      <div className="wc-article-page">
        <p className="wc-list-hint">
          Cliquez sur un article pour ouvrir sa <strong>Structure de la page</strong>
          {' '}(identique pour tous les articles). Onglets FR / EN / AR = langue éditée.
        </p>
        <div className="wc-article-page__toolbar">
          <strong>Articles</strong>
          <span className="wc-article-studio__count">{items.length}</span>
        </div>
        <input
          className="wc-field-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un article…"
        />
        <div className="wc-article-page__list">
          {filtered.map(({ item, index }) => (
            <button
              key={`${item.slug}-${index}`}
              type="button"
              className="wc-article-page__row"
              onClick={() => openArticle(index)}
            >
              <span className="wc-article-studio__thumb">
                {item.img ? (
                  <img src={resolvePreviewImageUrl(item.img)} alt="" />
                ) : null}
              </span>
              <span className="wc-article-studio__meta">
                <span className="wc-article-studio__title">{item.title || 'Sans titre'}</span>
                <span className="wc-article-studio__slug">{item.slug || '—'}</span>
              </span>
              <ChevronRight size={16} className="wc-article-page__chevron" />
            </button>
          ))}
          {!filtered.length && <p className="wc-article-studio__empty">Aucun article trouvé.</p>}
        </div>
        <button type="button" className="wc-add-item-btn" onClick={addArticle}>
          <Plus size={14} /> Nouvel article
        </button>
      </div>
    )
  }

  /* ─── 2) Structure de la page (standard) ──────────────────────────────── */
  if (view === 'structure') {
    return (
      <div className="wc-article-page">
        <button type="button" className="wc-article-page__back" onClick={() => setView('list')}>
          <ArrowLeft size={14} /> Tous les articles
        </button>

        <div className="wc-article-page__head">
          <div className="wc-article-page__kicker">
            <LayoutGrid size={12} /> Structure de la page
          </div>
          <h3 className="wc-article-page__title">{article.title || 'Sans titre'}</h3>
          <p className="wc-article-page__slug">/{article.slug}</p>
          <div className="wc-article-page__actions">
            <a
              className="wc-article-studio__preview-link"
              href={`${siteBase}/actualites/${article.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={12} /> Voir sur le site
            </a>
            <button
              type="button"
              className="wc-item-remove"
              title="Supprimer cet article"
              onClick={() => removeArticle(selected)}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <p className="wc-list-hint">
          Structure standard de chaque page article — cliquez une section pour l’éditer.
        </p>

        <div className="wc-article-page__structure">
          {ARTICLE_PAGE_STRUCTURE.map((sec, i) => (
            <button
              key={sec.id}
              type="button"
              className="wc-article-page__structure-row"
              onClick={() => {
                setActiveSection(sec.id)
                setView('section')
              }}
            >
              <span className="wc-article-page__structure-num">{i + 1}</span>
              <span className="wc-article-page__structure-text">
                <span className="wc-article-page__structure-title">{sec.title}</span>
                <span className="wc-article-page__structure-hint">{sec.hint}</span>
              </span>
              <ChevronRight size={16} className="wc-article-page__chevron" />
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ─── 3) Édition d’une section ────────────────────────────────────────── */
  return (
    <div className="wc-article-page">
      <button type="button" className="wc-article-page__back" onClick={() => setView('structure')}>
        <ArrowLeft size={14} /> Structure de la page
      </button>

      <div className="wc-article-page__head">
        <div className="wc-article-page__kicker">{article.title || 'Article'}</div>
        <h3 className="wc-article-page__title">{sectionMeta?.title ?? activeSection}</h3>
        <p className="wc-list-hint" style={{ marginBottom: 0 }}>{sectionMeta?.hint}</p>
      </div>

      <div className="wc-article-page__fields">
        {activeSection === 'hero' && (
          <Field label="Titre hero (2 lignes possibles)">
            <textarea
              className="wc-field-input"
              rows={3}
              value={article.hero_title ?? article.title ?? ''}
              onChange={(e) => setField('hero_title', e.target.value)}
              placeholder={'Ligne 1\nLigne 2'}
            />
          </Field>
        )}

        {activeSection === 'card' && (
          <>
            <Field label="Titre (carte)">
              <TextInput value={article.title ?? ''} onChange={(v) => setField('title', v)} />
            </Field>
            <Field label="Extrait (carte)">
              <textarea
                className="wc-field-input"
                rows={3}
                value={article.desc ?? ''}
                onChange={(e) => setField('desc', e.target.value)}
              />
            </Field>
            <Field label="Date">
              <TextInput value={article.date ?? ''} onChange={(v) => setField('date', v)} />
            </Field>
            <Field label="Slug (URL)">
              <TextInput value={article.slug ?? ''} onChange={(v) => setField('slug', v)} placeholder="mon-article" />
            </Field>
            <ImageField
              value={article.img ?? ''}
              onChange={(v) => setField('img', v)}
              label="Image carte / featured"
            />
          </>
        )}

        {activeSection === 'header' && (
          <>
            <Field label="Titre page article">
              <TextInput value={article.title ?? ''} onChange={(v) => setField('title', v)} />
            </Field>
            <Field label="Sous-titre">
              <TextInput value={article.subtitle ?? ''} onChange={(v) => setField('subtitle', v)} placeholder="Optionnel" />
            </Field>
            <Field label="Citation">
              <textarea
                className="wc-field-input"
                rows={3}
                value={article.quote ?? ''}
                onChange={(e) => setField('quote', e.target.value)}
                placeholder="Optionnel"
              />
            </Field>
            <Field label="Introduction">
              <textarea
                className="wc-field-input"
                rows={5}
                value={article.intro ?? ''}
                onChange={(e) => setField('intro', e.target.value)}
              />
            </Field>
          </>
        )}

        {activeSection === 'body' && (
          <>
            <p className="wc-list-hint" style={{ marginTop: 0 }}>
              Avec questions → accordéon Q&R. Sans questions → date + texte simple.
            </p>
            {(article.sections ?? []).map((section, si) => (
              <ItemCard key={si} index={si} title="Question" onRemove={() => removeQa(si)}>
                <Field label="Question">
                  <TextInput value={section.question ?? ''} onChange={(v) => setQa(si, { question: v })} />
                </Field>
                <Field label="Réponse">
                  <textarea
                    className="wc-field-input"
                    rows={6}
                    value={section.answer ?? ''}
                    onChange={(e) => setQa(si, { answer: e.target.value })}
                  />
                </Field>
              </ItemCard>
            ))}
            <button type="button" className="wc-add-item-btn" onClick={addQa}>
              <Plus size={14} /> Ajouter une question
            </button>
            {!(article.sections?.length) && (
              <>
                <Field label="Date (corps simple)">
                  <TextInput value={article.date ?? ''} onChange={(v) => setField('date', v)} />
                </Field>
                <Field label="Texte (corps simple)">
                  <textarea
                    className="wc-field-input"
                    rows={5}
                    value={article.desc ?? ''}
                    onChange={(e) => setField('desc', e.target.value)}
                  />
                </Field>
              </>
            )}
          </>
        )}

        {activeSection === 'source' && (
          <Field label="Source">
            <TextInput
              value={article.source ?? ''}
              onChange={(v) => setField('source', v)}
              placeholder="Source : …"
            />
          </Field>
        )}
      </div>
    </div>
  )
}

interface ValueCard { title: string; desc: string; icon: string }
interface DiversifyPoint { title: string; desc: string }
interface HebTypeCard { name: string; desc: string; img: string; wide?: boolean }
interface HebStatCard { value: string; label: string; suffix?: string }
interface HebDiagCard { title: string; desc: string; side?: 'left' | 'right' }

function ValuesEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<ValueCard>(value, [])
  const update = (next: ValueCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Valeurs / objectifs (titre, description, icône image).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Valeur" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={3} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
          <ImageField value={item.icon ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, icon: v } : x))} label="Icône" />
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, { title: 'NOUVELLE VALEUR', desc: '', icon: '/images/groupement-media/heb-value-durabilite.png?v=3' }])}
      >
        <Plus size={14} /> Ajouter une valeur
      </button>
    </div>
  )
}

function HebTypesEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<HebTypeCard>(value, [])
  const update = (next: HebTypeCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Typologies d’hébergements (nom, description, photo). Cochez « large » pour une carte pleine largeur.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Typologie" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Nom">
            <TextInput value={item.name ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, name: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={3} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
          <ImageField value={item.img ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, img: v } : x))} label="Photo" />
          <label className="wc-field" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
            <input
              type="checkbox"
              checked={Boolean(item.wide)}
              onChange={e => update(items.map((x, j) => j === i ? { ...x, wide: e.target.checked } : x))}
            />
            <span>Carte large (pleine largeur)</span>
          </label>
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, { name: 'NOUVELLE TYPOLOGIE', desc: '', img: '/images/groupement-media/heb-ecolodges-photo.jpg?v=1', wide: false }])}
      >
        <Plus size={14} /> Ajouter une typologie
      </button>
    </div>
  )
}

function HebStatsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<HebStatCard>(value, [])
  const update = (next: HebStatCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Chiffres de croissance (valeur, libellé, suffixe optionnel comme « + »).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Stat" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Valeur">
            <TextInput value={item.value ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, value: v } : x))} />
          </Field>
          <Field label="Libellé">
            <TextInput value={item.label ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, label: v } : x))} />
          </Field>
          <Field label="Suffixe (ex. +)">
            <TextInput value={item.suffix ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, suffix: v } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, { value: '0', label: 'Nouveau chiffre', suffix: '' }])}
      >
        <Plus size={14} /> Ajouter un chiffre
      </button>
    </div>
  )
}

function HebDiagEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<HebDiagCard & { icon?: string }>(value, [])
  const update = (next: (HebDiagCard & { icon?: string })[]) => onChange(JSON.stringify(next))
  const hasSide = items.some((i) => i.side === 'left' || i.side === 'right')
  const hasIcon = items.some((i) => Boolean(i.icon))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">
        Points de diagnostic (titre, texte
        {hasSide || !hasIcon ? ', position' : ''}
        {hasIcon || !hasSide ? ', icône' : ''}).
      </p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Point" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={3} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
          {(hasSide || !hasIcon) && (
            <Field label="Position">
              <select
                className="wc-field-input"
                value={item.side === 'right' ? 'right' : 'left'}
                onChange={e => update(items.map((x, j) => j === i ? { ...x, side: e.target.value as 'left' | 'right' } : x))}
              >
                <option value="left">Gauche</option>
                <option value="right">Droite</option>
              </select>
            </Field>
          )}
          {(hasIcon || !hasSide) && (
            <ImageField
              value={item.icon ?? ''}
              onChange={v => update(items.map((x, j) => j === i ? { ...x, icon: v } : x))}
              label="Icône"
            />
          )}
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() =>
          update([
            ...items,
            hasIcon && !hasSide
              ? { title: 'NOUVEAU POINT', desc: '', icon: '/images/groupement-media/culturel-diag-alert.png?v=4' }
              : { title: 'NOUVEAU POINT', desc: '', side: items.length % 2 === 0 ? 'left' : 'right' },
          ])
        }
      >
        <Plus size={14} /> Ajouter un point
      </button>
    </div>
  )
}

interface CultStatCard { value: string; label: string; desc?: string; icon?: string }
interface IconCardItem { title: string; desc: string; icon?: string }

function CultStatsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<CultStatCard & { tone?: string }>(value, [])
  const update = (next: Array<CultStatCard & { tone?: string }>) => onChange(JSON.stringify(next))
  const usesTone = items.some((item) => item.tone !== undefined)

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Chiffres clés (valeur, libellé, description{usesTone ? ', ton light/dark' : ', icône'}).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Chiffre" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Valeur">
            <TextInput value={item.value ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, value: v } : x))} />
          </Field>
          <Field label="Libellé">
            <TextInput value={item.label ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, label: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={2} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
          {usesTone || item.tone !== undefined ? (
            <Field label="Ton (light / dark)">
              <TextInput value={item.tone ?? 'light'} onChange={v => update(items.map((x, j) => j === i ? { ...x, tone: v } : x))} placeholder="light" />
            </Field>
          ) : (
            <Field label="Icône (globe/euro/chart ou URL)">
              <TextInput value={item.icon ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, icon: v } : x))} />
            </Field>
          )}
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, usesTone
          ? { value: '0', label: 'Nouveau chiffre', desc: '', tone: 'light' }
          : { value: '0', label: 'Nouveau chiffre', desc: '', icon: 'globe' }])}
      >
        <Plus size={14} /> Ajouter un chiffre
      </button>
    </div>
  )
}

function IconCardsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<IconCardItem>(value, [])
  const update = (next: IconCardItem[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Cartes (titre, description, icône image).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Carte" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={2} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
          <ImageField
            value={item.icon?.startsWith('/') || item.icon?.startsWith('http') ? (item.icon ?? '') : ''}
            onChange={v => update(items.map((x, j) => j === i ? { ...x, icon: v } : x))}
            label="Icône"
          />
          <Field label="Ou clé SVG (sun, building, tech…)">
            <TextInput
              value={item.icon && !item.icon.startsWith('/') && !item.icon.startsWith('http') ? item.icon : ''}
              onChange={v => update(items.map((x, j) => j === i ? { ...x, icon: v } : x))}
              placeholder="sun"
            />
          </Field>
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, { title: 'NOUVELLE CARTE', desc: '', icon: 'sun' }])}
      >
        <Plus size={14} /> Ajouter une carte
      </button>
    </div>
  )
}

interface HubChildCard { slug: string; label: string; blurb: string; face?: string; tag?: string }

function HubChildrenEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<HubChildCard>(value, [])
  const update = (next: HubChildCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Filières du pôle (photo, titre, tag, texte, slug URL).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Filière" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <ImageField value={item.face ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, face: v } : x))} label="Photo" />
          <Field label="Titre">
            <TextInput value={item.label ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, label: v } : x))} />
          </Field>
          <Field label="Tag">
            <TextInput value={item.tag ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, tag: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={3} value={item.blurb ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, blurb: e.target.value } : x))} />
          </Field>
          <Field label="Slug (URL)">
            <TextInput value={item.slug ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, slug: v } : x))} placeholder="tourisme-medical" />
          </Field>
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, { slug: '', label: 'Nouvelle filière', blurb: '', face: '', tag: '' }])}
      >
        <Plus size={14} /> Ajouter une filière
      </button>
    </div>
  )
}

function DiversifyEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<DiversifyPoint>(value, [])
  const update = (next: DiversifyPoint[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Points de diversification (titre + description).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Point" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={2} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { title: '', desc: '' }])}>
        <Plus size={14} /> Ajouter un point
      </button>
    </div>
  )
}

/** Flat string lists used by groupement pages: `[{ text: "…" }]`. */
function TextItemsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const raw = parseArray<string | { text?: string }>(value, [])
  const items = raw.map((row) => (typeof row === 'string' ? { text: row } : { text: String(row?.text ?? '') }))
  const update = (next: { text: string }[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Liste de textes (une ligne par élément).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Élément" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Texte">
            <textarea
              className="wc-field-input"
              rows={2}
              value={item.text}
              onChange={(e) => update(items.map((x, j) => (j === i ? { text: e.target.value } : x)))}
            />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { text: '' }])}>
        <Plus size={14} /> Ajouter une ligne
      </button>
    </div>
  )
}

interface BoardMember { name: string; role: string; image: string }
interface StaffMember { initials: string; name: string; role: string }
interface RegionItem { name: string; region: string }

function BoardEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<BoardMember>(value, [])
  const update = (next: BoardMember[]) => onChange(JSON.stringify(next))
  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Composition du bureau (nom, rôle, photo).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Membre" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Nom">
            <TextInput value={item.name ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, name: v } : x))} />
          </Field>
          <Field label="Rôle">
            <TextInput value={item.role ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, role: v } : x))} />
          </Field>
          <ImageField value={item.image ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, image: v } : x))} label="Photo" />
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { name: '', role: '', image: '' }])}>
        <Plus size={14} /> Ajouter un membre
      </button>
    </div>
  )
}

function StaffEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<StaffMember>(value, [])
  const update = (next: StaffMember[]) => onChange(JSON.stringify(next))
  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Équipe du siège (initiales, nom, fonction).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Collaborateur" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Initiales">
            <TextInput value={item.initials ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, initials: v } : x))} />
          </Field>
          <Field label="Nom">
            <TextInput value={item.name ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, name: v } : x))} />
          </Field>
          <Field label="Fonction">
            <TextInput value={item.role ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, role: v } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { initials: '', name: '', role: '' }])}>
        <Plus size={14} /> Ajouter un collaborateur
      </button>
    </div>
  )
}

function RegionsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<RegionItem>(value, [])
  const update = (next: RegionItem[]) => onChange(JSON.stringify(next))
  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Bureaux régionaux (responsable + région).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Bureau" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Responsable">
            <TextInput value={item.name ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, name: v } : x))} />
          </Field>
          <Field label="Région">
            <TextInput value={item.region ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, region: v } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { name: '', region: '' }])}>
        <Plus size={14} /> Ajouter un bureau
      </button>
    </div>
  )
}

function BenefitsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<DiversifyPoint>(value, [])
  const update = (next: DiversifyPoint[]) => onChange(JSON.stringify(next))
  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Avantages d’adhésion (titre + description).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Avantage" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Description">
            <textarea className="wc-field-input" rows={2} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
        </ItemCard>
      ))}
      <button type="button" className="wc-add-item-btn" onClick={() => update([...items, { title: '', desc: '' }])}>
        <Plus size={14} /> Ajouter un avantage
      </button>
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

const EDITOR_LABELS: Record<string, string> = {
  'rooms.cards': 'Cartes chambres',
  'restaurants.cards': 'Cartes restaurants',
  'gallery.photos': 'Photos galerie',
  'testimonials.reviews': 'Avis clients',
  'weddings.cards': 'Cartes mariages',
  'services.items': 'Services & Confort',
  'objectifs.items': 'Objectifs',
  'groupements.items': 'Groupements',
  'adherer.reasons': 'Raisons d’adhérer',
  'actualites.items': 'Actualités',
  'values.items': 'Valeurs / Objectifs',
  'diversify.items': 'Diversification',
  'board.members': 'Bureau — Membres',
  'headquarters.staff': 'Siège — Équipe',
  'regional.items': 'Bureaux régionaux',
  'grid.items': 'Actualités',
  'benefits.items': 'Avantages adhésion',
  'types.items': 'Typologies',
  'growth.stats': 'Chiffres de croissance',
  'diag.items': 'Diagnostic stratégique',
  'stats.items': 'Chiffres clés',
  'atouts.items': 'Atouts',
  'roadmap.items': 'Feuille de route',
  'pillars.items': 'Piliers',
  'grid.children': 'Filières du pôle',
  'diagnostic.items': 'Diagnostic économique',
  'defis.items': 'Défis',
  'plan.items': 'Plan de relance',
  'pourquoi.items': 'Pourquoi',
  'pot.items': 'Potentiel',
  'places.items': 'Sites',
  'freins.items': 'Freins',
  'mondial.items': 'Contexte mondial',
  'axes.items': 'Axes stratégiques',
  'adv.items': 'Avantages',
  'market.items': 'Marché',
  'impact.items': 'Impact',
  'prob.items': 'Problématiques',
  'actions.items': 'Actions',
  'challenges.items': 'Défis',
  'real.items': 'Atouts',
  'bars.items': 'Répartition',
  'etat.stats': 'État — Stats',
  'wealth.items': 'Richesses',
  'photos.items': 'Galerie',
}

type EditorType =
  | 'rooms'
  | 'restaurants'
  | 'gallery'
  | 'testimonials'
  | 'weddings'
  | 'services'
  | 'objectifs'
  | 'groupements'
  | 'reasons'
  | 'news'
  | 'values'
  | 'diversify'
  | 'board'
  | 'staff'
  | 'regions'
  | 'benefits'
  | 'hebTypes'
  | 'hebStats'
  | 'hebDiag'
  | 'cultStats'
  | 'iconCards'
  | 'hubChildren'
  | 'pageTree'
  | 'textItems'
  | 'simple'

function peekSample(value: string): unknown {
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed[0] : undefined
  } catch {
    return undefined
  }
}

function resolveEditor(section: string, blockKey: string, value = ''): EditorType {
  const c = `${section}.${blockKey}`
  const sample = peekSample(value)
  const obj = sample && typeof sample === 'object' && !Array.isArray(sample)
    ? (sample as Record<string, unknown>)
    : null

  // Figma groupement bands: one `<band>.data` document per section.
  if (blockKey === 'data') return 'pageTree'
  if (c === 'rooms.cards' || (blockKey === 'cards' && section.includes('room'))) return 'rooms'
  if (c === 'restaurants.cards' || (blockKey === 'cards' && section.includes('restaurant'))) return 'restaurants'
  if (c === 'weddings.cards' || (blockKey === 'cards' && section === 'weddings')) return 'weddings'
  // Hotel services use `{ title, icons: { base } }`; FI2T senior services use icon cards.
  if (c === 'services.items' || (blockKey === 'items' && section === 'services')) {
    if (obj && obj.icons && typeof obj.icons === 'object') return 'services'
    return 'iconCards'
  }
  if (c === 'gallery.photos' || blockKey === 'photos') return 'gallery'
  if (c === 'testimonials.reviews' || blockKey === 'reviews') return 'testimonials'
  if (c === 'objectifs.items') return 'objectifs'
  if (c === 'groupements.items') return 'groupements'
  if (c === 'adherer.reasons') return 'reasons'
  if (c === 'actualites.items' || (section === 'grid' && blockKey === 'items')) return 'news'
  if (c === 'values.items') return 'values'
  if (c === 'diversify.items') return 'diversify'
  if (c === 'board.members') return 'board'
  if (c === 'headquarters.staff') return 'staff'
  if (c === 'regional.items') return 'regions'
  if (c === 'benefits.items') return 'benefits'
  if (c === 'types.items') return 'hebTypes'
  if (c === 'growth.stats') return 'hebStats'
  if (c === 'diag.items') return 'hebDiag'
  if (c === 'grid.children') return 'hubChildren'
  if (c === 'grid.items' && section === 'grid') return 'news'

  // Shape-aware routing for flat groupement lists
  if (typeof sample === 'string' || (obj && 'text' in obj && !('title' in obj) && !('desc' in obj) && !('value' in obj))) {
    return 'textItems'
  }
  if (obj && 'value' in obj && ('label' in obj || 'desc' in obj || 'tone' in obj)) {
    return 'cultStats'
  }
  if (
    c === 'stats.items'
    || c === 'diagnostic.items'
    || c === 'etat.stats'
    || c === 'bars.items'
    || blockKey === 'stats'
  ) {
    return 'cultStats'
  }
  if (
    c === 'atouts.items'
    || c === 'pillars.items'
    || c === 'pourquoi.items'
    || c === 'pot.items'
    || c === 'places.items'
    || c === 'freins.items'
    || c === 'mondial.items'
    || c === 'axes.items'
    || c === 'adv.items'
    || c === 'market.items'
    || c === 'impact.items'
    || c === 'prob.items'
    || c === 'defis.items'
    || c === 'plan.items'
    || c === 'roadmap.items'
    || c === 'actions.items'
    || c === 'wealth.items'
    || (obj && 'title' in obj && ('desc' in obj || 'icon' in obj) && !('text' in obj) && !('image' in obj))
  ) {
    // Numbered roadmap / plan rows without icons still use title+desc
    if (obj && 'title' in obj && 'desc' in obj && !('icon' in obj) && (c === 'roadmap.items' || c === 'plan.items' || c === 'defis.items')) {
      return 'diversify'
    }
    if (obj && 'title' in obj && 'desc' in obj && !('icon' in obj) && !('image' in obj)) {
      return 'diversify'
    }
    return 'iconCards'
  }
  if (c === 'challenges.items' || c === 'real.items') return 'textItems'
  if (obj && 'title' in obj && 'text' in obj) return 'simple'
  return 'simple'
}

interface Props {
  section: string
  blockKey: string
  value: string
  onChange: (json: string) => void
}

const EDITOR_TYPE_LABELS: Record<EditorType, string> = {
  rooms: 'Cartes chambres',
  restaurants: 'Cartes restaurants',
  gallery: 'Photos galerie',
  testimonials: 'Avis clients',
  weddings: 'Cartes mariages',
  services: 'Services & Confort',
  objectifs: 'Objectifs',
  groupements: 'Groupements',
  reasons: 'Raisons d’adhérer',
  news: 'Actualités',
  values: 'Valeurs / Objectifs',
  diversify: 'Diversification',
  board: 'Bureau — Membres',
  staff: 'Siège — Équipe',
  regions: 'Bureaux régionaux',
  benefits: 'Avantages adhésion',
  hebTypes: 'Typologies',
  hebStats: 'Chiffres de croissance',
  hebDiag: 'Diagnostic stratégique',
  cultStats: 'Chiffres clés',
  iconCards: 'Cartes avec icône',
  hubChildren: 'Filières du pôle',
  pageTree: 'Contenu de la page',
  textItems: 'Liste de textes',
  simple: 'Liste simple',
}

export default function JsonBlockEditor({ section, blockKey, value, onChange }: Props) {
  const editor = resolveEditor(section, blockKey, value)
  const compound = `${section}.${blockKey}`
  const label = EDITOR_LABELS[compound] ?? EDITOR_TYPE_LABELS[editor]

  return (
    <div className="wc-json-editor">
      {label && <p className="wc-json-editor-type">{label}</p>}
      {editor === 'rooms' && <RoomCardsEditor value={value} onChange={onChange} />}
      {editor === 'restaurants' && <RestaurantCardsEditor value={value} onChange={onChange} />}
      {editor === 'gallery' && <GalleryPhotosEditor value={value} onChange={onChange} />}
      {editor === 'testimonials' && <ReviewsEditor value={value} onChange={onChange} />}
      {editor === 'weddings' && <WeddingCardsEditor value={value} onChange={onChange} />}
      {editor === 'services' && <ServiceItemsEditor value={value} onChange={onChange} />}
      {editor === 'objectifs' && <ObjectifsEditor value={value} onChange={onChange} />}
      {editor === 'groupements' && <GroupementsEditor value={value} onChange={onChange} />}
      {editor === 'reasons' && <ReasonsEditor value={value} onChange={onChange} />}
      {editor === 'news' && section === 'grid' && (
        <div className="wc-articles-redirect">
          <Newspaper size={18} />
          <div>
            <p><strong>Les articles ne s’éditent plus ici.</strong></p>
            <p>
              Cette page Actualités est la liste statique (/actualites). Pour ajouter,
              modifier ou supprimer un article, ouvrez l’onglet <strong>Articles</strong>.
            </p>
            <Link to="/articles" className="wc-add-item-btn" style={{ display: 'inline-flex', marginTop: 8 }}>
              Ouvrir Articles
            </Link>
          </div>
        </div>
      )}
      {editor === 'news' && section !== 'grid' && <NewsCardsEditor value={value} onChange={onChange} />}
      {editor === 'values' && <ValuesEditor value={value} onChange={onChange} />}
      {editor === 'diversify' && <DiversifyEditor value={value} onChange={onChange} />}
      {editor === 'board' && <BoardEditor value={value} onChange={onChange} />}
      {editor === 'staff' && <StaffEditor value={value} onChange={onChange} />}
      {editor === 'regions' && <RegionsEditor value={value} onChange={onChange} />}
      {editor === 'benefits' && <BenefitsEditor value={value} onChange={onChange} />}
      {editor === 'hebTypes' && <HebTypesEditor value={value} onChange={onChange} />}
      {editor === 'hebStats' && <HebStatsEditor value={value} onChange={onChange} />}
      {editor === 'hebDiag' && <HebDiagEditor value={value} onChange={onChange} />}
      {editor === 'cultStats' && <CultStatsEditor value={value} onChange={onChange} />}
      {editor === 'iconCards' && <IconCardsEditor value={value} onChange={onChange} />}
      {editor === 'hubChildren' && <HubChildrenEditor value={value} onChange={onChange} />}
      {editor === 'pageTree' && <PageTreeEditor value={value} onChange={onChange} />}
      {editor === 'textItems' && <TextItemsEditor value={value} onChange={onChange} />}
      {editor === 'simple' && <SimpleCardsEditor value={value} onChange={onChange} />}
    </div>
  )
}

export const JSON_TEMPLATES = [
  { id: 'rooms.cards', label: 'Cartes chambres', section: 'rooms', key: 'cards', defaultValue: '[]' },
  { id: 'restaurants.cards', label: 'Cartes restaurants', section: 'restaurants', key: 'cards', defaultValue: '[]' },
  { id: 'weddings.cards', label: 'Cartes mariages', section: 'weddings', key: 'cards', defaultValue: '[]' },
  { id: 'services.items', label: 'Services & Confort', section: 'services', key: 'items', defaultValue: '[]' },
  { id: 'gallery.photos', label: 'Photos galerie', section: 'gallery', key: 'photos', defaultValue: '[]' },
  { id: 'testimonials.reviews', label: 'Avis clients', section: 'testimonials', key: 'reviews', defaultValue: '[]' },
  { id: 'simple.cards', label: 'Liste simple (titre + texte + image)', section: '', key: 'items', defaultValue: '[]' },
] as const
