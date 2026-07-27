import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, UtensilsCrossed, Clock, ArrowLeft, ImageIcon } from 'lucide-react'
import { OUTLET_TYPE_LABELS } from '../venues/venueTypes'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { RoomImagesEditor, type RoomImage } from '../rooms/RoomImagesEditor'
import { syncMedia } from '../rooms/syncMedia'
import api from '../../api/client'
import toast from 'react-hot-toast'

const OUTLET_MEDIABLE = 'App\\Models\\Outlet'
type OutletTab = 'general' | 'photos'
type TypeFilter = 'RESTAURANT' | 'ALL'

const TABS: { id: OutletTab; label: string }[] = [
  { id: 'general', label: 'Informations' },
  { id: 'photos', label: 'Photos' },
]

function emptyForm() {
  return {
    name: '',
    type: 'RESTAURANT',
    description: '',
    location: '',
    opening_time: '',
    closing_time: '',
    capacity: '',
    accepts_reservation: true,
    is_active: true,
  }
}

/** DB returns "12:00:00" — HTML time inputs need "12:00" */
function normalizeTime(value: string | null | undefined): string {
  if (!value) return ''
  const match = String(value).match(/^(\d{1,2}):(\d{2})/)
  if (!match) return ''
  return `${match[1].padStart(2, '0')}:${match[2]}`
}

function formFromApi(o: any) {
  return {
    name: o.name ?? '',
    type: o.type?.value ?? o.type ?? 'RESTAURANT',
    description: o.description ?? '',
    location: o.location ?? '',
    opening_time: normalizeTime(o.opening_time),
    closing_time: normalizeTime(o.closing_time),
    capacity: o.capacity ?? '',
    accepts_reservation: o.accepts_reservation !== false,
    is_active: o.is_active !== false,
  }
}

function buildPayload(form: ReturnType<typeof emptyForm>) {
  const opening = normalizeTime(form.opening_time)
  const closing = normalizeTime(form.closing_time)
  return {
    name: form.name,
    type: form.type,
    description: form.description || null,
    location: form.location || null,
    opening_time: opening || null,
    closing_time: closing || null,
    capacity: form.capacity ? Number(form.capacity) : null,
    accepts_reservation: !!form.accepts_reservation,
    is_active: !!form.is_active,
  }
}

function coverOf(o: any) {
  return o.media?.find((m: any) => m.is_cover) ?? o.media?.[0]
}

export default function OutletsPage() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('RESTAURANT')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState(emptyForm())
  const [images, setImages] = useState<RoomImage[]>([])
  const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState<OutletTab>('general')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const queryKey = ['outlets', page, typeFilter]
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get('/admin/outlets', {
      params: {
        page,
        per_page: 12,
        ...(typeFilter !== 'ALL' ? { type: typeFilter } : {}),
      },
    }).then(r => r.data),
  })

  const outlets = data?.data ?? []

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      reset()
      setModal('create')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const reset = () => {
    setForm(emptyForm())
    setImages([])
    setRemovedMediaIds([])
    setSelected(null)
    setActiveTab('general')
  }

  const openEdit = async (outlet: any) => {
    setModal('edit')
    setLoading(true)
    setActiveTab('general')
    try {
      const { data: full } = await api.get(`/admin/outlets/${outlet.id}`)
      setSelected(full)
      setForm(formFromApi(full))
      setImages((full.media ?? []).map((m: any) => ({
        id: m.id,
        url: m.url,
        alt_text: m.alt_text ?? '',
        is_cover: !!m.is_cover,
      })))
      setRemovedMediaIds([])
    } catch {
      toast.error('Impossible de charger le restaurant')
      setModal(null)
      reset()
    } finally {
      setLoading(false)
    }
  }

  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/outlets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['outlets'] })
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
      const payload = buildPayload(form)
      let id = selected?.id
      if (modal === 'create') {
        const { data: created } = await api.post('/admin/outlets', payload)
        id = created.id
        toast.success('Restaurant créé')
      } else {
        await api.put(`/admin/outlets/${id}`, payload)
        toast.success('Mis à jour')
      }
      if (id) await syncMedia(OUTLET_MEDIABLE, id, images, removedMediaIds)
      qc.invalidateQueries({ queryKey: ['outlets'] })
      setModal(null)
      reset()
    } catch (err: any) {
      const errors = err.response?.data?.errors
      const first = errors && Object.values(errors).flat()[0]
      toast.error(typeof first === 'string' ? first : (err.response?.data?.message ?? 'Erreur lors de l\'enregistrement'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/venues" className="inline-flex items-center gap-1 text-sm text-[#B89E72] hover:text-[#D4A017] transition-colors">
        <ArrowLeft size={14} /> Espaces & Lieux
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>
            Restaurants & Bars
          </h2>
          <p className="text-sm text-[#B89E72]">
            {data?.meta?.total ?? 0} lieux — cartes affichées sur le site et la page réservation
          </p>
        </div>
        <Button onClick={() => { reset(); setModal('create') }}>
          <Plus size={15} /> Nouveau restaurant ou bar
        </Button>
      </div>

      <div className="flex gap-2">
        {([
          ['RESTAURANT', 'Restaurants'],
          ['ALL', 'Tous les lieux'],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => { setTypeFilter(value); setPage(1) }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              typeFilter === value
                ? 'bg-[#D4A017] text-white'
                : 'bg-[#F0EAD6] text-[#5A4628] hover:bg-[#FAF0D0]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="gc-spinner" /></div>
      ) : outlets.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-[#B89E72] mb-4">Aucun restaurant défini.</p>
            <Button onClick={() => { reset(); setModal('create') }}>
              <Plus size={15} /> Créer le premier restaurant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="room-type-grid">
          {outlets.map((o: any) => {
            const cover = coverOf(o)
            const photoCount = o.media?.length ?? 0
            return (
              <div key={o.id} className={`room-type-card${o.is_active === false ? ' inactive' : ''}`}>
                <div className="room-type-card-img">
                  {cover?.url ? (
                    <img src={cover.url} alt={o.name} />
                  ) : (
                    <div className="room-type-card-placeholder"><ImageIcon size={28} /></div>
                  )}
                  <span className="room-type-card-badge">{OUTLET_TYPE_LABELS[o.type] ?? o.type}</span>
                </div>
                <div className="room-type-card-body">
                  <div className="room-type-card-head">
                    <h3>{o.name}</h3>
                    <Badge status={o.is_active ? 'CONFIRMED' : 'CANCELLED'} />
                  </div>
                  <p className="room-type-card-desc">{o.description || 'Aucune description'}</p>
                  <div className="room-type-card-meta">
                    {o.location && <span><strong>Lieu</strong> {o.location}</span>}
                    {o.opening_time && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {o.opening_time} – {o.closing_time}
                      </span>
                    )}
                    <span><strong>Photos</strong> {photoCount}</span>
                    {o.accepts_reservation && <span>Réservations</span>}
                  </div>
                  <div className="room-type-card-actions">
                    <button type="button" onClick={() => openEdit(o)} className="room-type-card-edit">
                      <Edit size={14} /> Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm('Supprimer ce lieu ?')) deleteM.mutate(o.id) }}
                      className="room-type-card-delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {data?.meta && data.meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</Button>
          <span className="text-sm text-[#B89E72] self-center">Page {page} / {data.meta.last_page}</span>
          <Button variant="secondary" disabled={page >= data.meta.last_page} onClick={() => setPage(p => p + 1)}>Suivant</Button>
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => { setModal(null); reset() }}
        title={modal === 'create' ? 'Nouveau restaurant ou bar' : `Modifier — ${selected?.name ?? ''}`}
        size="lg"
      >
        {loading ? (
          <div className="flex justify-center py-12"><div className="gc-spinner" /></div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex gap-2 border-b border-[#EDE4D0] pb-2">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#FAF0D0] text-[#1C1811] font-medium'
                      : 'text-[#B89E72] hover:text-[#1C1811]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'general' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Nom" required value={form.name} onChange={e => f('name', e.target.value)} />
                  <Select label="Type" value={form.type} onChange={e => f('type', e.target.value)}>
                    {Object.entries(OUTLET_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </Select>
                </div>
                <Input label="Localisation" value={form.location} onChange={e => f('location', e.target.value)} placeholder="Niveau 0 – Terrasse" />
                <div>
                  <label className="block text-xs font-medium text-[#6B6145] mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => f('description', e.target.value)}
                    rows={3}
                    className="w-full rounded-xl border border-[#DDD0B0] bg-white px-3 py-2 text-sm text-[#1C1811] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input label="Ouverture" type="time" value={form.opening_time} onChange={e => f('opening_time', e.target.value)} />
                  <Input label="Fermeture" type="time" value={form.closing_time} onChange={e => f('closing_time', e.target.value)} />
                  <Input label="Capacité" type="number" value={form.capacity} onChange={e => f('capacity', e.target.value)} />
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
                    <input type="checkbox" checked={form.accepts_reservation} onChange={e => f('accepts_reservation', e.target.checked)} className="accent-[#D4A017]" />
                    Réservations en ligne
                  </label>
                  <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={e => f('is_active', e.target.checked)} className="accent-[#D4A017]" />
                    Actif sur le site
                  </label>
                </div>
              </>
            )}

            {activeTab === 'photos' && (
              <div>
                <p className="text-sm text-[#B89E72] mb-3">
                  La photo principale s&apos;affiche sur les cartes du site. Les autres photos sont utilisées dans le carrousel de la page réservation.
                </p>
                <RoomImagesEditor images={images} onChange={handleImagesChange} />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-[#EDE4D0]">
              <Button variant="secondary" type="button" onClick={() => { setModal(null); reset() }}>Annuler</Button>
              <Button type="submit" loading={saving}>
                {modal === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
