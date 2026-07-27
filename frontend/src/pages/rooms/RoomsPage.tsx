import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ArrowLeft, ImageIcon, Loader2 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { ROOM_TYPE_LABELS, ROOM_STATUS_LABELS } from './roomLabels'
import { AmenityPicker } from './AmenityPicker'
import { RoomImagesEditor, type RoomImage } from './RoomImagesEditor'

const ROOM_TYPES = Object.keys(ROOM_TYPE_LABELS)
const ROOM_STATUSES = Object.keys(ROOM_STATUS_LABELS)
const ROOM_MEDIABLE = 'App\\Models\\Room'
type RoomTab = 'general' | 'pricing' | 'amenities' | 'photos'

const ROOM_TABS: { id: RoomTab; label: string }[] = [
  { id: 'general', label: 'Général' },
  { id: 'pricing', label: 'Tarifs' },
  { id: 'amenities', label: 'Équipements' },
  { id: 'photos', label: 'Photos' },
]

function emptyForm() {
  return {
    category_id: '', name: '', description: '', type: 'DOUBLE', status: 'AVAILABLE',
    floor: 1, room_number: '', price_per_night: '', weekend_price: '', flexible_rate: '',
    surface_m2: 25, height_m: 2.7, width_m: 5, max_adults: 2, max_children: 1,
    has_balcony: false, smoking: false,
  }
}

function enumVal(v: any): string {
  if (v == null) return ''
  if (typeof v === 'object' && 'value' in v) return v.value
  return String(v)
}

function roomFormFromApi(full: any) {
  return {
    category_id: String(full.category_id ?? ''),
    name: full.name ?? '',
    description: full.description ?? '',
    type: enumVal(full.type) || 'DOUBLE',
    status: enumVal(full.status) || 'AVAILABLE',
    floor: full.floor ?? 1,
    room_number: full.room_number ?? '',
    price_per_night: full.price_per_night ?? '',
    weekend_price: full.weekend_price ?? '',
    flexible_rate: full.flexible_rate ?? '',
    surface_m2: full.surface_m2 ?? 25,
    height_m: full.height_m ?? 2.7,
    width_m: full.width_m ?? 5,
    max_adults: full.max_adults ?? 2,
    max_children: full.max_children ?? 1,
    has_balcony: !!full.has_balcony,
    smoking: !!full.smoking,
  }
}

function buildRoomPayload(form: any, amenityIds: number[]) {
  return {
    category_id: Number(form.category_id),
    name: form.name,
    description: form.description || null,
    type: form.type,
    status: form.status,
    floor: Number(form.floor),
    room_number: form.room_number,
    price_per_night: form.price_per_night,
    weekend_price: form.weekend_price || null,
    flexible_rate: form.flexible_rate || null,
    surface_m2: Number(form.surface_m2),
    height_m: Number(form.height_m),
    width_m: Number(form.width_m),
    max_adults: Number(form.max_adults),
    max_children: Number(form.max_children),
    has_balcony: !!form.has_balcony,
    smoking: !!form.smoking,
    amenities: amenityIds,
  }
}

async function syncRoomMedia(roomId: number, images: RoomImage[], removedIds: number[]) {
  for (const id of removedIds) {
    await api.delete(`/admin/media/${id}`)
  }
  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    if (img.id) {
      await api.put(`/admin/media/${img.id}`, {
        alt_text: img.alt_text ?? '',
        is_cover: !!img.is_cover,
        sort_order: i,
      })
    } else if (img.url) {
      await api.post('/admin/media', {
        mediable_type: ROOM_MEDIABLE,
        mediable_id: roomId,
        url: img.url,
        alt_text: img.alt_text ?? '',
        type: 'IMAGE',
        sort_order: i,
        is_cover: !!img.is_cover,
      })
    }
  }
}

export default function RoomsPage() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState<any>(emptyForm())
  const [amenityIds, setAmenityIds] = useState<number[]>([])
  const [images, setImages] = useState<RoomImage[]>([])
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [loadingRoom, setLoadingRoom] = useState(false)
  const [activeTab, setActiveTab] = useState<RoomTab>('general')

  const { data, isLoading } = useQuery({
    queryKey: ['rooms', page, filterStatus, filterCategory],
    queryFn: () => {
      let url = `/admin/rooms?page=${page}&per_page=12`
      if (filterStatus) url += `&status=${filterStatus}`
      if (filterCategory) url += `&category_id=${filterCategory}`
      return api.get(url).then(r => r.data)
    },
  })
  const { data: cats } = useQuery({
    queryKey: ['room-categories'],
    queryFn: () => api.get('/admin/room-categories').then(r => r.data),
  })
  const { data: amenitiesData } = useQuery({
    queryKey: ['room-amenities'],
    queryFn: () => api.get('/admin/room-amenities').then(r => r.data),
  })

  const categories = Array.isArray(cats) ? cats : (cats?.data ?? [])
  const amenities = Array.isArray(amenitiesData) ? amenitiesData : (amenitiesData?.data ?? [])

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      resetForm()
      setModal('create')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const resetForm = () => {
    setForm(emptyForm())
    setAmenityIds([])
    setImages([])
    setRemovedMediaIds([])
    setSelected(null)
    setActiveTab('general')
    setLoadingRoom(false)
  }

  const openEdit = async (room: any) => {
    setModal('edit')
    setLoadingRoom(true)
    setActiveTab('general')
    try {
      const { data: full } = await api.get(`/admin/rooms/${room.id}`)
      setSelected(full)
      setForm(roomFormFromApi(full))
      setAmenityIds(full.amenities?.map((a: any) => a.id) ?? [])
      setImages((full.media ?? []).map((m: any) => ({
        id: m.id,
        url: m.url,
        alt_text: m.alt_text ?? '',
        is_cover: !!m.is_cover,
      })))
      setRemovedMediaIds([])
    } catch {
      toast.error('Impossible de charger la chambre')
      setModal(null)
      resetForm()
    } finally {
      setLoadingRoom(false)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/rooms/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rooms'] }); toast.success('Supprimé') },
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
      const payload = buildRoomPayload(form, amenityIds)

      let roomId = selected?.id
      if (modal === 'create') {
        const { data: created } = await api.post('/admin/rooms', payload)
        roomId = created.id
        toast.success('Chambre créée')
      } else {
        await api.put(`/admin/rooms/${roomId}`, payload)
        toast.success('Mis à jour')
      }

      if (roomId) {
        await syncRoomMedia(roomId, images, removedMediaIds)
      }

      qc.invalidateQueries({ queryKey: ['rooms'] })
      setModal(null)
      resetForm()
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Erreur lors de l\'enregistrement')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    {
      key: 'room_number', header: 'N°',
      render: (r: any) => <span className="font-mono font-semibold text-[#D4A017]">#{r.room_number}</span>,
    },
    {
      key: 'name', header: 'Chambre',
      render: (r: any) => {
        const cover = r.media?.find((m: any) => m.is_cover) ?? r.media?.[0]
        return (
        <div className="flex items-center gap-3">
          {cover?.url ? (
            <img src={cover.url} alt="" className="h-9 w-9 rounded-lg object-cover" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-[#F0EAD6] flex items-center justify-center">
              <ImageIcon size={14} className="text-[#B89E72]" />
            </div>
          )}
          <div>
            <p className="font-medium text-[#1C1811]">{r.name}</p>
            <p className="text-xs text-[#B89E72]">{r.category?.name} · Étage {r.floor}</p>
          </div>
        </div>
        )
      },
    },
    {
      key: 'type', header: 'Type',
      render: (r: any) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0EAD6] text-[#5A4628]">
          {ROOM_TYPE_LABELS[r.type] ?? r.type}
        </span>
      ),
    },
    {
      key: 'amenities', header: 'Équipements',
      render: (r: any) => (
        <span className="text-xs text-[#6B6145]">
          {r.amenities?.length ? `${r.amenities.length} équip.` : '—'}
        </span>
      ),
    },
    { key: 'status', header: 'Statut', render: (r: any) => <Badge status={r.status} /> },
    {
      key: 'price_per_night', header: 'Prix/nuit',
      render: (r: any) => (
        <span className="font-semibold text-[#1C1811]">
          {parseFloat(r.price_per_night).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND
        </span>
      ),
    },
    { key: 'surface_m2', header: 'Surface', render: (r: any) => `${r.surface_m2} m²` },
    {
      key: 'actions', header: '',
      render: (r: any) => (
        <div className="flex gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); openEdit(r) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors">
            <Edit size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ?')) deleteMutation.mutate(r.id) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  return (
    <div className="space-y-5">
      <Link to="/accommodation" className="inline-flex items-center gap-1 text-sm text-[#B89E72] hover:text-[#D4A017] transition-colors">
        <ArrowLeft size={14} /> Hébergement
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>Chambres</h2>
          <p className="text-sm text-[#B89E72]">{data?.meta?.total ?? 0} chambres</p>
        </div>
        <Button onClick={() => { resetForm(); setModal('create'); setActiveTab('general') }}><Plus size={15} /> Nouvelle chambre</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(1) }} className="w-auto min-w-[160px]">
          <option value="">Toutes catégories</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        {['', ...ROOM_STATUSES].map(s => (
          <button key={s || 'all'} onClick={() => { setFilterStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterStatus === s ? 'border-[#D4A017] bg-[#FAF0D0] text-[#6B4F00]' : 'border-[#DDD0B0] text-[#6B6145] hover:bg-[#FAF0D0]'}`}>
            {s ? (ROOM_STATUS_LABELS[s] ?? s) : 'Tous statuts'}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns as any} data={data?.data ?? []} loading={isLoading} />
          {data?.meta && <div className="px-5 pb-4"><Pagination {...data.meta} onPageChange={setPage} /></div>}
        </CardContent>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); resetForm() }}
        title={modal === 'create' ? 'Nouvelle chambre' : `Modifier — ${form.name || selected?.name || 'Chambre'}`}
        subtitle={modal === 'edit' && form.room_number ? `Chambre #${form.room_number}` : undefined}
        size="2xl"
        bodyClassName="room-modal-body"
        footer={!loadingRoom ? (
          <>
            <Button variant="secondary" type="button" onClick={() => { setModal(null); resetForm() }}>Annuler</Button>
            <Button type="submit" form="room-form" loading={saving}>
              {modal === 'create' ? 'Créer la chambre' : 'Enregistrer'}
            </Button>
          </>
        ) : undefined}
      >
        {loadingRoom ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '40px 0' }}>
            <Loader2 size={32} className="room-images-spinner" />
            <p style={{ fontSize: 13, color: '#B89E72' }}>Chargement de la chambre…</p>
          </div>
        ) : (
          <form id="room-form" onSubmit={handleSubmit}>
            <div className="room-modal-tabs">
              {ROOM_TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`room-modal-tab${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                  {tab.id === 'amenities' && amenityIds.length > 0 && ` (${amenityIds.length})`}
                  {tab.id === 'photos' && images.length > 0 && ` (${images.length})`}
                </button>
              ))}
            </div>

            <div className={`room-modal-panel${activeTab === 'amenities' ? ' room-modal-panel--amenities' : ''}`}>
            {activeTab === 'general' && (
              <div className="room-modal-section">
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Catégorie" required value={form.category_id} onChange={e => f('category_id', e.target.value)}>
                    <option value="">Choisir une catégorie</option>
                    {categories.map((c: any) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                  </Select>
                  <Input label="Nom de la chambre" required value={form.name} onChange={e => f('name', e.target.value)} placeholder="Suite Junior 301" />
                </div>
                <div>
                  <label className="gc-label">Description</label>
                  <textarea
                    value={form.description ?? ''}
                    onChange={e => f('description', e.target.value)}
                    rows={4}
                    className="gc-textarea"
                    placeholder="Décrivez la chambre pour le site web..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="N° Chambre" required value={form.room_number} onChange={e => f('room_number', e.target.value)} placeholder="301" />
                  <Input label="Étage" type="number" required value={form.floor} onChange={e => f('floor', +e.target.value)} />
                  <Select label="Type de lit" value={form.type} onChange={e => f('type', e.target.value)}>
                    {ROOM_TYPES.map(t => <option key={t} value={t}>{ROOM_TYPE_LABELS[t]}</option>)}
                  </Select>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="room-modal-section">
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Prix / nuit (TND)" type="number" step="0.001" required value={form.price_per_night} onChange={e => f('price_per_night', e.target.value)} />
                  <Input label="Prix week-end (TND)" type="number" step="0.001" value={form.weekend_price ?? ''} onChange={e => f('weekend_price', e.target.value)} />
                  <Input label="Tarif flexible (TND)" type="number" step="0.001" value={form.flexible_rate ?? ''} onChange={e => f('flexible_rate', e.target.value)} />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  <Input label="Surface (m²)" type="number" value={form.surface_m2} onChange={e => f('surface_m2', +e.target.value)} />
                  <Input label="Hauteur (m)" type="number" step="0.01" value={form.height_m} onChange={e => f('height_m', +e.target.value)} />
                  <Input label="Largeur (m)" type="number" step="0.01" value={form.width_m} onChange={e => f('width_m', +e.target.value)} />
                  <Input label="Adultes max" type="number" value={form.max_adults} onChange={e => f('max_adults', +e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Enfants max" type="number" value={form.max_children} onChange={e => f('max_children', +e.target.value)} />
                  <Select label="Statut" value={form.status} onChange={e => f('status', e.target.value)}>
                    {ROOM_STATUSES.map(s => <option key={s} value={s}>{ROOM_STATUS_LABELS[s]}</option>)}
                  </Select>
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
                    <input type="checkbox" checked={form.has_balcony} onChange={e => f('has_balcony', e.target.checked)} className="accent-[#D4A017]" />
                    Balcon
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
                    <input type="checkbox" checked={form.smoking} onChange={e => f('smoking', e.target.checked)} className="accent-[#D4A017]" />
                    Fumeur
                  </label>
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
