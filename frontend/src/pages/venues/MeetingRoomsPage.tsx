import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Presentation, PartyPopper, ArrowLeft, Users, Maximize2 } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'
import {
  MEETING_TYPES, EVENT_TYPES,
  MEETING_ROOM_TYPE_LABELS,
} from './venueTypes'

type Mode = 'meeting' | 'event'

const MODE_CONFIG: Record<Mode, {
  title: string
  subtitle: string
  icon: typeof Presentation
  types: readonly string[]
  defaultType: string
  addLabel: string
}> = {
  meeting: {
    title: 'Salles de réunion',
    subtitle: 'Conférences, conseils et ateliers',
    icon: Presentation,
    types: MEETING_TYPES,
    defaultType: 'CONFERENCE',
    addLabel: 'Nouvelle salle de réunion',
  },
  event: {
    title: 'Salles d\'événement',
    subtitle: 'Banquets, cérémonies et espaces extérieurs',
    icon: PartyPopper,
    types: EVENT_TYPES,
    defaultType: 'BANQUET',
    addLabel: 'Nouvelle salle d\'événement',
  },
}

const DISPOSITION_CAPACITIES = [
  { key: 'capacity_theatre', label: 'Théâtre' },
  { key: 'capacity_classroom', label: 'Salle de classe' },
  { key: 'capacity_banquet', label: 'Banquet' },
  { key: 'capacity_cocktail', label: 'Cocktail' },
  { key: 'capacity_en_u', label: 'En U' },
  { key: 'capacity_conference', label: 'Conférence' },
  { key: 'capacity_cabaret', label: 'Cabaret' },
] as const

function emptyForm(defaultType: string) {
  return {
    name: '',
    type: defaultType,
    surface_m2: '',
    height_m: '',
    capacity_theatre: '',
    capacity_classroom: '',
    capacity_banquet: '',
    capacity_cocktail: '',
    capacity_en_u: '',
    capacity_conference: '',
    capacity_cabaret: '',
    capacity_boardroom: '',
    width_m: '',
    length_m: '',
    price_half_day: '',
    price_full_day: '',
    price_per_hour: '',
    description: '',
    has_natural_light: false,
    has_av_equipment: false,
    has_wifi: true,
    has_catering: false,
    is_active: true,
  }
}

function preparePayload(form: any) {
  const numeric = [
    'surface_m2', 'height_m',
    'capacity_theatre', 'capacity_classroom', 'capacity_banquet',
    'capacity_cocktail', 'capacity_en_u', 'capacity_conference', 'capacity_cabaret',
    'capacity_boardroom', 'width_m', 'length_m',
    'price_half_day', 'price_full_day', 'price_per_hour',
  ]
  const payload: any = { ...form }
  for (const key of numeric) {
    if (payload[key] === '' || payload[key] == null) payload[key] = null
    else payload[key] = Number(payload[key])
  }
  return payload
}

function roomToForm(room: any, defaultType: string) {
  const form = { ...emptyForm(room.type ?? defaultType), ...room }
  if (!form.capacity_en_u && room.capacity_boardroom) {
    form.capacity_en_u = room.capacity_boardroom
  }
  if (!form.capacity_conference && room.capacity_boardroom) {
    form.capacity_conference = room.capacity_boardroom
  }
  return form
}

interface Props { mode: Mode }

export default function MeetingRoomsPage({ mode }: Props) {
  const config = MODE_CONFIG[mode]
  const Icon = config.icon
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState<any>(() => emptyForm(config.defaultType))
  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const { data, isLoading } = useQuery({
    queryKey: ['meeting-rooms', mode],
    queryFn: () => api.get('/admin/meeting-rooms?per_page=200').then(r => r.data),
  })

  const rooms = useMemo(() => {
    const all: any[] = data?.data ?? []
    return all.filter(r => (config.types as readonly string[]).includes(r.type))
  }, [data, config.types])

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setForm(emptyForm(config.defaultType))
      setModal('create')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, config.defaultType])

  const createM = useMutation({
    mutationFn: (d: any) => api.post('/admin/meeting-rooms', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meeting-rooms'] })
      qc.invalidateQueries({ queryKey: ['venues-count-rooms'] })
      setModal(null)
      toast.success('Salle créée')
    },
  })
  const updateM = useMutation({
    mutationFn: (d: any) => api.put(`/admin/meeting-rooms/${selected?.id}`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meeting-rooms'] })
      qc.invalidateQueries({ queryKey: ['venues-count-rooms'] })
      setModal(null)
      toast.success('Mis à jour')
    },
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/meeting-rooms/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meeting-rooms'] })
      qc.invalidateQueries({ queryKey: ['venues-count-rooms'] })
      toast.success('Supprimé')
    },
  })

  const columns = [
    {
      key: 'name', header: 'Salle',
      render: (r: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#FAF0D0]">
            <Icon size={16} className="text-[#D4A017]" />
          </div>
          <div>
            <p className="font-medium text-[#1C1811]">{r.name}</p>
            <p className="text-xs text-[#B89E72]">{MEETING_ROOM_TYPE_LABELS[r.type] ?? r.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'surface_m2', header: 'Surface',
      render: (r: any) => (
        <span className="flex items-center gap-1 text-sm text-[#6B6145]">
          <Maximize2 size={12} className="text-[#D4A017]" />
          {r.surface_m2} m²
        </span>
      ),
    },
    {
      key: 'capacity', header: 'Capacité',
      render: (r: any) => {
        const cap = r.capacity_banquet || r.capacity_theatre || r.capacity_cocktail || r.capacity_boardroom
        return cap ? (
          <span className="flex items-center gap-1 text-sm"><Users size={12} className="text-[#D4A017]" />{cap} pers.</span>
        ) : '—'
      },
    },
    {
      key: 'price_full_day', header: 'Tarif jour',
      render: (r: any) => r.price_full_day
        ? <span className="font-semibold text-[#1C1811]">{parseFloat(r.price_full_day).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
        : '—',
    },
    { key: 'is_active', header: 'Statut', render: (r: any) => <Badge status={r.is_active ? 'CONFIRMED' : 'CANCELLED'} /> },
    {
      key: 'actions', header: '',
      render: (r: any) => (
        <div className="flex gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); setSelected(r); setForm(roomToForm(r, config.defaultType)); setModal('edit') }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"><Edit size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer cette salle ?')) deleteM.mutate(r.id) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Link to="/venues" className="inline-flex items-center gap-1 text-sm text-[#B89E72] hover:text-[#D4A017] transition-colors">
        <ArrowLeft size={14} /> Espaces & Lieux
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>{config.title}</h2>
          <p className="text-sm text-[#B89E72]">{rooms.length} {rooms.length <= 1 ? 'salle' : 'salles'} — {config.subtitle}</p>
        </div>
        <Button onClick={() => { setForm(emptyForm(config.defaultType)); setModal('create') }}>
          <Plus size={15} /> {config.addLabel}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns as any} data={rooms} loading={isLoading} />
        </CardContent>
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? config.addLabel : 'Modifier la salle'}>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault()
          const payload = preparePayload(form)
          modal === 'create' ? createM.mutate(payload) : updateM.mutate(payload)
        }}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nom de la salle" required value={form.name} onChange={e => f('name', e.target.value)} />
            <Select label="Type" value={form.type} onChange={e => f('type', e.target.value)}>
              {config.types.map(t => (
                <option key={t} value={t}>{MEETING_ROOM_TYPE_LABELS[t] ?? t}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Surface (m²)" type="number" step="0.01" required value={form.surface_m2} onChange={e => f('surface_m2', e.target.value)} />
            <Input label="Hauteur sous plafond (m)" type="number" step="0.01" value={form.height_m ?? ''} onChange={e => f('height_m', e.target.value)} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B6145] mb-2">Capacités par disposition</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {DISPOSITION_CAPACITIES.map(({ key, label }) => (
                <Input
                  key={key}
                  label={label}
                  type="number"
                  min={0}
                  value={form[key] ?? ''}
                  onChange={e => f(key, e.target.value)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Tarif demi-journée (TND)" type="number" step="0.001" value={form.price_half_day ?? ''} onChange={e => f('price_half_day', e.target.value)} />
            <Input label="Tarif journée (TND)" type="number" step="0.001" value={form.price_full_day ?? ''} onChange={e => f('price_full_day', e.target.value)} />
            <Input label="Tarif / heure (TND)" type="number" step="0.001" value={form.price_per_hour ?? ''} onChange={e => f('price_per_hour', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#6B6145] mb-1.5">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={e => f('description', e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-[#DDD0B0] bg-white px-3 py-2 text-sm text-[#1C1811] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/30"
            />
          </div>
          <div className="flex flex-wrap gap-4">
            {[
              ['has_natural_light', 'Lumière naturelle'],
              ['has_av_equipment', 'Équipement AV'],
              ['has_wifi', 'Wi-Fi'],
              ['has_catering', 'Restauration'],
              ['is_active', 'Actif'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form[key]}
                  onChange={e => f(key, e.target.checked)}
                  className="accent-[#D4A017]"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Annuler</Button>
            <Button type="submit" loading={createM.isPending || updateM.isPending}>
              {modal === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
