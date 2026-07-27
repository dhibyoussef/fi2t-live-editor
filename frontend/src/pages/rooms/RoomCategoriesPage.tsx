import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ArrowLeft, Users, Maximize2, ImageIcon, Loader2, BedDouble, Crown } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'
import {
  ROOM_CATEGORY_ENUM_LABELS,
  ACCOMMODATION_TYPE_LABELS,
  filterByAccommodationKind,
  type AccommodationDisplayKind,
} from './roomLabels'
import { AmenityPicker } from './AmenityPicker'
import { RoomImagesEditor, type RoomImage } from './RoomImagesEditor'
import { syncMedia } from './syncMedia'

const CATEGORY_ENUMS = Object.keys(ROOM_CATEGORY_ENUM_LABELS)
const ACCOMMODATION_TYPES = Object.keys(ACCOMMODATION_TYPE_LABELS) as ('ROOM' | 'APARTMENT')[]
const CATEGORY_MEDIABLE = 'App\\Models\\RoomCategory'
type CatTab = 'general' | 'details' | 'amenities' | 'photos'
type AccommodationType = 'ROOM' | 'APARTMENT'

function parseAccommodationType(v: string | null): AccommodationType {
  return v === 'APARTMENT' ? 'APARTMENT' : 'ROOM'
}

function typeOfApi(v: any): AccommodationType {
  if (v == null) return 'ROOM'
  if (typeof v === 'object' && 'value' in v) return (v.value as AccommodationType) || 'ROOM'
  return (v as AccommodationType) || 'ROOM'
}

const TABS: { id: CatTab; label: string }[] = [
  { id: 'general', label: 'Présentation' },
  { id: 'details', label: 'Détails' },
  { id: 'amenities', label: 'Équipements' },
  { id: 'photos', label: 'Photos' },
]

function parseAccommodationKind(type: AccommodationType, raw: string | null): AccommodationDisplayKind {
  if (type === 'APARTMENT') return 'apartment'
  if (raw === 'suite') return 'suite'
  return 'chambre'
}

function defaultCategoryForKind(kind: AccommodationDisplayKind): string {
  if (kind === 'suite') return 'SUITE_JUNIOR'
  return 'STANDARD'
}

function emptyForm(accommodationType: AccommodationType = 'ROOM', kind: AccommodationDisplayKind = 'chambre') {
  const isSuite = kind === 'suite'
  return {
    name: '', accommodation_type: accommodationType, category: defaultCategoryForKind(kind), description: '',
    price_from: '', discount_percent: '', surface_m2: '', max_adults: 2, max_children: 1, is_active: true,
    room_count: isSuite ? 0 : 0,
    suite_count: isSuite ? 1 : 0,
    siteminder_room_type_id: '',
  }
}

function inventoryLabel(roomCount: number, suiteCount: number, accommodationType: AccommodationType): string {
  const parts: string[] = []
  if (accommodationType === 'APARTMENT') {
    if (roomCount > 0) parts.push(`${roomCount} appartement${roomCount > 1 ? 's' : ''}`)
  } else {
    if (roomCount > 0) parts.push(`${roomCount} chambre${roomCount > 1 ? 's' : ''}`)
    if (suiteCount > 0) parts.push(`${suiteCount} suite${suiteCount > 1 ? 's' : ''}`)
  }
  return parts.length ? parts.join(' · ') : 'Aucun inventaire'
}

function enumVal(v: any): string {
  if (v == null) return ''
  if (typeof v === 'object' && 'value' in v) return v.value
  return String(v)
}

function formFromApi(c: any) {
  return {
    name: c.name ?? '',
    accommodation_type: typeOfApi(c.accommodation_type),
    category: enumVal(c.category) || 'STANDARD',
    description: c.description ?? '',
    price_from: c.price_from ?? '',
    discount_percent: c.discount_percent ?? '',
    surface_m2: c.surface_m2 ?? '',
    max_adults: c.max_adults ?? 2,
    max_children: c.max_children ?? 1,
    is_active: c.is_active !== false,
    room_count: c.room_count ?? 0,
    suite_count: c.suite_count ?? 0,
    siteminder_room_type_id: c.siteminder_room_type_id ?? '',
  }
}

function buildPayload(form: any, amenityIds: number[]) {
  return {
    name: form.name,
    accommodation_type: form.accommodation_type,
    category: form.category,
    description: form.description || null,
    price_from: form.price_from || null,
    discount_percent: form.discount_percent !== '' && form.discount_percent != null
      ? Number(form.discount_percent)
      : null,
    surface_m2: form.surface_m2 ? Number(form.surface_m2) : null,
    max_adults: Number(form.max_adults),
    max_children: Number(form.max_children),
    is_active: !!form.is_active,
    room_count: Number(form.room_count) || 0,
    suite_count: Number(form.suite_count) || 0,
    siteminder_room_type_id: form.siteminder_room_type_id?.trim() || null,
    amenities: amenityIds,
  }
}

export default function RoomCategoriesPage() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const listType = parseAccommodationType(searchParams.get('type'))
  const listKind = parseAccommodationKind(listType, searchParams.get('kind'))
  const isApartment = listType === 'APARTMENT'
  const isSuite = listKind === 'suite'
  const pageTitle = isApartment ? 'Appartements' : isSuite ? 'Suites' : 'Chambres'
  const pageSubtitle = isApartment
    ? 'Studios et appartements avec catégories (Standard, Deluxe…)'
    : isSuite
      ? 'Junior Suite, Prestige, Présidentielle…'
      : 'Standard, Supérieure, Deluxe…'
  const createLabel = isApartment ? 'Nouvel appartement' : isSuite ? 'Nouvelle suite' : 'Nouvelle chambre'
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState(emptyForm(listType, listKind))
  const [amenityIds, setAmenityIds] = useState<number[]>([])
  const [images, setImages] = useState<RoomImage[]>([])
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<CatTab>('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const { data, isLoading } = useQuery({
    queryKey: ['room-categories', listType],
    queryFn: () => api.get('/admin/room-categories', { params: { accommodation_type: listType } }).then(r => r.data),
  })
  const { data: amenitiesData } = useQuery({
    queryKey: ['room-amenities'],
    queryFn: () => api.get('/admin/room-amenities').then(r => r.data),
  })

  const categories = filterByAccommodationKind(
    Array.isArray(data) ? data : (data?.data ?? []),
    listKind,
  )
  const amenities = Array.isArray(amenitiesData) ? amenitiesData : (amenitiesData?.data ?? [])

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      reset()
      setModal('create')
      const next = new URLSearchParams()
      if (listType !== 'ROOM') next.set('type', listType)
      else if (listKind !== 'chambre') next.set('kind', listKind)
      setSearchParams(next, { replace: true })
    }
  }, [searchParams, setSearchParams, listType, listKind])

  const reset = () => {
    setForm(emptyForm(listType, listKind))
    setAmenityIds([])
    setImages([])
    setRemovedMediaIds([])
    setSelected(null)
    setActiveTab('general')
  }

  const openEdit = async (cat: any) => {
    setModal('edit')
    setLoading(true)
    setActiveTab('general')
    try {
      const { data: full } = await api.get(`/admin/room-categories/${cat.id}`)
      setSelected(full)
      setForm(formFromApi(full))
      setAmenityIds(full.amenities?.map((a: any) => a.id) ?? [])
      setImages((full.media ?? []).map((m: any) => ({
        id: m.id, url: m.url, alt_text: m.alt_text ?? '', is_cover: !!m.is_cover,
      })))
      setRemovedMediaIds([])
    } catch {
      toast.error('Impossible de charger le type de chambre')
      setModal(null)
      reset()
    } finally {
      setLoading(false)
    }
  }

  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/room-categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['room-categories'] })
      toast.success('Supprimé')
    },
  })

  const handleImagesChange = (next: RoomImage[]) => {
    const removed = images.filter(img => img.id && !next.find(n => n.id === img.id))
    setRemovedMediaIds(prev => [...prev, ...removed.map(r => r.id!).filter(Boolean)])
    setImages(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = buildPayload(form, amenityIds)
      let id = selected?.id
      if (modal === 'create') {
        const { data: created } = await api.post('/admin/room-categories', payload)
        id = created.id
        toast.success(isApartment ? 'Appartement créé' : isSuite ? 'Suite créée' : 'Chambre créée')
      } else {
        await api.put(`/admin/room-categories/${id}`, payload)
        toast.success('Mis à jour')
      }
      if (id) await syncMedia(CATEGORY_MEDIABLE, id, images, removedMediaIds)
      qc.invalidateQueries({ queryKey: ['room-categories'] })
      setModal(null)
      reset()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const coverOf = (c: any) => c.media?.find((m: any) => m.is_cover) ?? c.media?.[0]

  return (
    <div className="space-y-5">
      <Link to="/accommodation" className="inline-flex items-center gap-1 text-sm text-[#B89E72] hover:text-[#D4A017] transition-colors">
        <ArrowLeft size={14} /> Hébergement
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>
            {pageTitle}
          </h2>
          <p className="text-sm text-[#B89E72]">
            {categories.length} {isApartment ? 'appartement(s)' : 'type(s)'} — {pageSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {!isApartment && listKind !== 'chambre' && (
            <Link to="/room-categories?type=ROOM&kind=chambre">
              <Button variant="secondary" size="sm">Voir chambres</Button>
            </Link>
          )}
          {!isApartment && listKind !== 'suite' && (
            <Link to="/room-categories?type=ROOM&kind=suite">
              <Button variant="secondary" size="sm">Voir suites</Button>
            </Link>
          )}
          {listKind !== 'apartment' && (
            <Link to="/room-categories?type=APARTMENT">
              <Button variant="secondary" size="sm">Voir appartements</Button>
            </Link>
          )}
          <Button onClick={() => { reset(); setModal('create') }}><Plus size={15} /> {createLabel}</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="gc-spinner" /></div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-[#B89E72] mb-4">
              {isApartment ? 'Aucun appartement défini.' : isSuite ? 'Aucune suite définie.' : 'Aucune chambre définie.'}
            </p>
            <Button onClick={() => { reset(); setModal('create') }}><Plus size={15} /> Créer le premier type</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="room-type-grid">
          {categories.map((c: any) => {
            const cover = coverOf(c)
            return (
              <div key={c.id} className={`room-type-card${c.is_active === false ? ' inactive' : ''}`}>
                <div className="room-type-card-img">
                  {cover?.url ? (
                    <img src={cover.url} alt={c.name} />
                  ) : (
                    <div className="room-type-card-placeholder"><ImageIcon size={28} /></div>
                  )}
                  <span className="room-type-card-badge">{ROOM_CATEGORY_ENUM_LABELS[c.category] ?? c.category}</span>
                </div>
                <div className="room-type-card-body">
                  <div className="room-type-card-head">
                    <h3>{c.name}</h3>
                    {c.is_active === false && <Badge status="CANCELLED" />}
                  </div>
                  <p className="room-type-card-desc">{c.description || 'Aucune description'}</p>
                  <div className="room-type-card-meta">
                    <span><BedDouble size={12} /> {inventoryLabel(c.room_count ?? 0, c.suite_count ?? 0, typeOfApi(c.accommodation_type))}</span>
                    {c.price_from && (
                      <span>
                        {c.discount_percent > 0 ? (
                          <>
                            <Badge status="warning" size="xs">-{c.discount_percent}%</Badge>
                            {' '}
                            <s>{parseFloat(c.price_from).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</s>
                            {' → '}
                            <strong>
                              {(parseFloat(c.price_from) * (1 - c.discount_percent / 100)).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND
                            </strong>
                          </>
                        ) : (
                          <>À partir de <strong>{parseFloat(c.price_from).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</strong></>
                        )}
                      </span>
                    )}
                    {c.surface_m2 && <span><Maximize2 size={12} /> {c.surface_m2} m²</span>}
                    <span><Users size={12} /> {c.max_adults} adultes</span>
                    {c.siteminder_room_type_id && (
                      <span title="SiteMinder roomTypeId">SM: {c.siteminder_room_type_id}</span>
                    )}
                    {c.amenities?.length > 0 && <span>{c.amenities.length} équip.</span>}
                  </div>
                  <div className="room-type-card-actions">
                    <button type="button" onClick={() => openEdit(c)} className="room-type-card-edit">
                      <Edit size={14} /> Modifier
                    </button>
                    <button type="button" onClick={() => { if (confirm('Supprimer ce type ?')) deleteM.mutate(c.id) }} className="room-type-card-delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); reset() }}
        title={modal === 'create' ? createLabel : `Modifier — ${form.name || selected?.name}`}
        size="2xl"
        bodyClassName="room-modal-body"
        footer={!loading ? (
          <>
            <Button variant="secondary" type="button" onClick={() => { setModal(null); reset() }}>Annuler</Button>
            <Button type="submit" form="category-form" loading={saving}>
              {modal === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </>
        ) : undefined}
      >
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
            <Loader2 size={32} className="room-images-spinner" />
            <p style={{ fontSize: 13, color: '#B89E72' }}>Chargement…</p>
          </div>
        ) : (
          <form id="category-form" onSubmit={handleSubmit}>
            <div className="room-modal-tabs">
              {TABS.map(tab => (
                <button key={tab.id} type="button"
                  className={`room-modal-tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                  {tab.id === 'amenities' && amenityIds.length > 0 && ` (${amenityIds.length})`}
                  {tab.id === 'photos' && images.length > 0 && ` (${images.length})`}
                </button>
              ))}
            </div>

            <div className={`room-modal-panel${activeTab === 'amenities' ? ' room-modal-panel--amenities' : ''}`}>
            {activeTab === 'general' && (
              <div className="room-modal-section">
                <Select
                  label="Type d'hébergement"
                  value={form.accommodation_type}
                  onChange={e => f('accommodation_type', e.target.value)}
                  disabled={modal === 'edit'}
                >
                  {ACCOMMODATION_TYPES.map(t => <option key={t} value={t}>{ACCOMMODATION_TYPE_LABELS[t]}</option>)}
                </Select>
                <Input
                  label="Nom affiché"
                  required
                  value={form.name}
                  onChange={e => f('name', e.target.value)}
                  placeholder={form.accommodation_type === 'APARTMENT' ? 'Appart 2 chambres, Studio…' : 'Suite Junior, Suite Parentale…'}
                />
                <Input
                  label="SiteMinder roomTypeId"
                  value={form.siteminder_room_type_id ?? ''}
                  onChange={e => f('siteminder_room_type_id', e.target.value)}
                  placeholder="ex. 484085"
                  hint="ID type de chambre sur direct-book.com — utilisé pour la redirection « Réserver »"
                />
                <Select label="Classification" value={form.category} onChange={e => f('category', e.target.value)}>
                  {CATEGORY_ENUMS.map(c => <option key={c} value={c}>{ROOM_CATEGORY_ENUM_LABELS[c]}</option>)}
                </Select>
                <div>
                  <label className="gc-label">Description (site web)</label>
                  <textarea className="gc-textarea" rows={5} value={form.description ?? ''}
                    onChange={e => f('description', e.target.value)}
                    placeholder="Décrivez ce type de chambre pour les visiteurs du site…" />
                </div>
                <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e => f('is_active', e.target.checked)} className="accent-[#D4A017]" />
                  Visible sur le site
                </label>
              </div>
            )}

            {activeTab === 'details' && (
              <div className="room-modal-section">
                <div>
                  <p className="gc-label mb-2">Inventaire de ce type</p>
                  <p className="text-xs text-[#B89E72] mb-3">
                    {form.accommodation_type === 'APARTMENT'
                      ? "Indiquez combien d'appartements de ce type sont disponibles."
                      : "Indiquez combien de chambres et de suites de ce type sont disponibles dans l'hôtel."}
                  </p>
                  <div className={`grid gap-3 ${form.accommodation_type === 'APARTMENT' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <Input
                      label={form.accommodation_type === 'APARTMENT' ? "Nombre d'appartements" : 'Nombre de chambres'}
                      type="number"
                      min={0}
                      value={form.room_count}
                      onChange={e => f('room_count', Math.max(0, +e.target.value || 0))}
                    />
                    {form.accommodation_type !== 'APARTMENT' && (
                      <Input
                        label="Nombre de suites"
                        type="number"
                        min={0}
                        value={form.suite_count}
                        onChange={e => f('suite_count', Math.max(0, +e.target.value || 0))}
                      />
                    )}
                  </div>
                  {(form.room_count > 0 || form.suite_count > 0) && (
                    <p className="text-sm text-[#6B6145] mt-2 flex items-center gap-1.5">
                      <Crown size={13} className="text-[#D4A017]" />
                      Total : {inventoryLabel(form.room_count, form.suite_count, form.accommodation_type)}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Prix à partir de (TND)" type="number" step="0.001" value={form.price_from ?? ''} onChange={e => f('price_from', e.target.value)} />
                  <Input
                    label="Remise (%)"
                    type="number"
                    min={0}
                    max={100}
                    value={form.discount_percent ?? ''}
                    onChange={e => f('discount_percent', e.target.value)}
                    placeholder="Ex. 15"
                  />
                  <Input label="Surface (m²)" type="number" value={form.surface_m2 ?? ''} onChange={e => f('surface_m2', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Adultes max" type="number" value={form.max_adults} onChange={e => f('max_adults', +e.target.value)} />
                  <Input label="Enfants max" type="number" value={form.max_children} onChange={e => f('max_children', +e.target.value)} />
                </div>
              </div>
            )}

            {activeTab === 'amenities' && (
              <AmenityPicker amenities={amenities} selected={amenityIds} onChange={setAmenityIds} />
            )}

            {activeTab === 'photos' && (
              <RoomImagesEditor images={images} onChange={handleImagesChange} />
            )}
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
