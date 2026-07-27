import { ReactNode } from 'react'
import { Plus, Trash2, Upload, GripVertical, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { uploadImageFile } from '../../../lib/uploadImageFile'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseArray<T extends Record<string, unknown>>(raw: string, fallback: T[]): T[] {
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

function editorKind(section: string, key: string): string {
  return `${section}.${key}`
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
    } catch {
      toast.error('Erreur lors du téléversement')
    }
  }

  return (
    <Field label={label}>
      <div className="wc-card-image-row">
        <div className="wc-card-image-preview">
          {value ? <img src={value} alt="" /> : <span>Aucune image</span>}
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

interface ObjectifItem { num: string; title: string; desc: string }
interface GroupementCard { label: string; slug: string; icon: string }
interface ReasonItem { title: string; desc: string }
interface NewsCard { slug: string; title: string; desc: string; date: string; img: string }

function ObjectifsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<ObjectifItem>(value, [])
  const update = (next: ObjectifItem[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Objectifs (numéro, titre, description). 4 par page sur le site.</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Objectif" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Numéro">
            <TextInput value={item.num ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, num: v } : x))} placeholder="01" />
          </Field>
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
          num: String(items.length + 1).padStart(2, '0'),
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
        onClick={() => update([...items, { label: 'Nouveau groupement', slug: '', icon: '/images/icon1.png' }])}
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

function NewsCardsEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseArray<NewsCard>(value, [])
  const update = (next: NewsCard[]) => onChange(JSON.stringify(next))

  return (
    <div className="wc-list-editor">
      <p className="wc-list-hint">Cartes actualités (titre, extrait, date, image, slug).</p>
      {items.map((item, i) => (
        <ItemCard key={i} index={i} title="Article" onRemove={() => update(items.filter((_, j) => j !== i))}>
          <Field label="Titre">
            <TextInput value={item.title ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, title: v } : x))} />
          </Field>
          <Field label="Extrait">
            <textarea className="wc-field-input" rows={2} value={item.desc ?? ''} onChange={e => update(items.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} />
          </Field>
          <Field label="Date">
            <TextInput value={item.date ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, date: v } : x))} />
          </Field>
          <Field label="Slug">
            <TextInput value={item.slug ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, slug: v } : x))} />
          </Field>
          <ImageField value={item.img ?? ''} onChange={v => update(items.map((x, j) => j === i ? { ...x, img: v } : x))} />
        </ItemCard>
      ))}
      <button
        type="button"
        className="wc-add-item-btn"
        onClick={() => update([...items, { slug: '', title: '', desc: '', date: '', img: '/images/act1.jpg' }])}
      >
        <Plus size={14} /> Ajouter une actualité
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
  | 'simple'

function resolveEditor(section: string, blockKey: string): EditorType {
  const c = `${section}.${blockKey}`
  if (c === 'rooms.cards' || (blockKey === 'cards' && section.includes('room'))) return 'rooms'
  if (c === 'restaurants.cards' || (blockKey === 'cards' && section.includes('restaurant'))) return 'restaurants'
  if (c === 'weddings.cards' || (blockKey === 'cards' && section === 'weddings')) return 'weddings'
  if (c === 'services.items' || (blockKey === 'items' && section === 'services')) return 'services'
  if (c === 'gallery.photos' || blockKey === 'photos') return 'gallery'
  if (c === 'testimonials.reviews' || blockKey === 'reviews') return 'testimonials'
  if (c === 'objectifs.items') return 'objectifs'
  if (c === 'groupements.items') return 'groupements'
  if (c === 'adherer.reasons') return 'reasons'
  if (c === 'actualites.items' || (section === 'grid' && blockKey === 'items')) return 'news'
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
  simple: 'Liste simple',
}

export default function JsonBlockEditor({ section, blockKey, value, onChange }: Props) {
  const editor = resolveEditor(section, blockKey)
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
      {editor === 'news' && <NewsCardsEditor value={value} onChange={onChange} />}
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
