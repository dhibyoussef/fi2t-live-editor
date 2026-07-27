import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { ImageUploader } from '../../components/ui/ImageUploader'
import api from '../../api/client'
import toast from 'react-hot-toast'

const ROLES = ['EXECUTIVE_CHEF', 'SOUS_CHEF', 'CHEF', 'WAITER', 'MANAGER', 'THERAPIST', 'ANIMATOR', 'OTHER'] as const
const CHEF_ROLES = new Set(['EXECUTIVE_CHEF', 'SOUS_CHEF', 'CHEF'])

const ROLE_LABELS: Record<string, string> = {
  EXECUTIVE_CHEF: 'Chef exécutif',
  SOUS_CHEF: 'Sous-chef',
  CHEF: 'Chef',
  WAITER: 'Serveur / Barman',
  MANAGER: 'Manager',
  THERAPIST: 'Thérapeute',
  ANIMATOR: 'Animateur',
  OTHER: 'Autre',
}

function emptyForm() {
  return {
    staff_type_id: '',
    outlet_id: '',
    first_name: '',
    last_name: '',
    title: '',
    slogan: '',
    photo_url: '',
    bio: '',
    role: 'CHEF',
    is_featured: false,
    is_active: true,
  }
}

function formFromStaff(s: any) {
  return {
    staff_type_id: s.staff_type_id ? String(s.staff_type_id) : '',
    outlet_id: s.outlet_id ? String(s.outlet_id) : '',
    first_name: s.first_name ?? '',
    last_name: s.last_name ?? '',
    title: s.title ?? '',
    slogan: s.slogan ?? '',
    photo_url: s.photo_url ?? '',
    bio: s.bio ?? '',
    role: s.role ?? 'CHEF',
    is_featured: !!s.is_featured,
    is_active: s.is_active !== false,
  }
}

function buildPayload(form: ReturnType<typeof emptyForm>) {
  return {
    staff_type_id: Number(form.staff_type_id),
    outlet_id: form.outlet_id ? Number(form.outlet_id) : null,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    title: form.title.trim() || null,
    slogan: form.slogan.trim() || null,
    photo_url: form.photo_url.trim() || null,
    bio: form.bio.trim() || null,
    role: form.role,
    is_featured: !!form.is_featured,
    is_active: !!form.is_active,
  }
}

export default function StaffPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState(emptyForm())
  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const { data, isLoading } = useQuery({
    queryKey: ['staff', page],
    queryFn: () => api.get('/admin/staff', { params: { page, per_page: 12 } }).then(r => r.data),
  })

  const { data: staffTypes = [] } = useQuery({
    queryKey: ['staff-types'],
    queryFn: () => api.get('/admin/staff-types').then(r => r.data),
  })

  const { data: outletsData } = useQuery({
    queryKey: ['outlets-restaurants'],
    queryFn: () => api.get('/admin/outlets', { params: { type: 'RESTAURANT', per_page: 100, is_active: 1 } }).then(r => r.data),
  })

  const restaurants = outletsData?.data ?? []
  const isChefRole = CHEF_ROLES.has(form.role)

  const createM = useMutation({
    mutationFn: (d: ReturnType<typeof buildPayload>) => api.post('/admin/staff', d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      setModal(null)
      toast.success('Membre créé')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur lors de la création'),
  })

  const updateM = useMutation({
    mutationFn: (d: ReturnType<typeof buildPayload>) => api.put(`/admin/staff/${selected?.id}`, d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      setModal(null)
      toast.success('Mis à jour')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur lors de la mise à jour'),
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/staff/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staff'] })
      toast.success('Supprimé')
    },
  })

  const openCreate = () => {
    setSelected(null)
    const kitchenType = staffTypes.find((t: any) => t.department === 'KITCHEN')
    setForm({
      ...emptyForm(),
      staff_type_id: kitchenType ? String(kitchenType.id) : '',
      role: 'CHEF',
    })
    setModal('create')
  }

  const openEdit = (s: any) => {
    setSelected(s)
    setForm(formFromStaff(s))
    setModal('edit')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.staff_type_id) {
      toast.error('Veuillez sélectionner un type de personnel')
      return
    }
    if (isChefRole && !form.outlet_id) {
      toast.error('Veuillez affecter le chef à un restaurant')
      return
    }
    const payload = buildPayload(form)
    if (modal === 'create') createM.mutate(payload)
    else updateM.mutate(payload)
  }

  const columns = [
    {
      key: 'name',
      header: 'Membre',
      render: (s: any) => (
        <div className="flex items-center gap-3">
          {s.photo_url ? (
            <img
              src={s.photo_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover border border-[#E8DFC8]"
            />
          ) : (
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-[#3D2D00]"
              style={{ background: 'var(--gradient-gold)' }}
            >
              {s.first_name?.[0]}{s.last_name?.[0]}
            </div>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium text-[#1C1811]">{s.first_name} {s.last_name}</p>
              {s.is_featured && <Star size={12} className="text-[#D4A017] fill-[#D4A017]" />}
            </div>
            <p className="text-xs text-[#B89E72]">{s.title ?? '—'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      render: (s: any) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0EAD6] text-[#5A4628]">
          {ROLE_LABELS[s.role] ?? s.role}
        </span>
      ),
    },
    { key: 'department', header: 'Département', render: (s: any) => s.staffType?.name ?? '—' },
    { key: 'outlet', header: 'Restaurant', render: (s: any) => s.outlet?.name ?? '—' },
    { key: 'is_active', header: 'Statut', render: (s: any) => <Badge status={s.is_active ? 'CONFIRMED' : 'CANCELLED'} /> },
    {
      key: 'actions',
      header: '',
      render: (s: any) => (
        <div className="flex gap-1 justify-end">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openEdit(s) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ?')) deleteM.mutate(s.id) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>
            Personnel
          </h2>
          <p className="text-sm text-[#B89E72]">{data?.meta?.total ?? 0} membres</p>
        </div>
        <Button onClick={openCreate}><Plus size={15} /> Nouveau membre</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns as any} data={data?.data ?? []} loading={isLoading} />
          {data?.meta && (
            <div className="px-5 pb-4">
              <Pagination {...data.meta} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Nouveau membre' : 'Modifier le membre'}
        size="lg"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prénom" required value={form.first_name} onChange={e => f('first_name', e.target.value)} />
            <Input label="Nom" required value={form.last_name} onChange={e => f('last_name', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Type de personnel"
              required
              value={form.staff_type_id}
              onChange={e => f('staff_type_id', e.target.value)}
            >
              <option value="">— Sélectionner —</option>
              {staffTypes.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </Select>
            <Select label="Rôle" value={form.role} onChange={e => f('role', e.target.value)}>
              {ROLES.map(r => (
                <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>
              ))}
            </Select>
          </div>

          <Select
            label={isChefRole ? 'Restaurant affecté' : 'Restaurant (optionnel)'}
            required={isChefRole}
            value={form.outlet_id}
            onChange={e => f('outlet_id', e.target.value)}
          >
            <option value="">— Aucun —</option>
            {restaurants.map((o: any) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </Select>

          {isChefRole && (
            <p className="text-xs text-[#B89E72] -mt-2">
              Le chef mis en avant et affecté à un restaurant apparaîtra sur la page du restaurant.
            </p>
          )}

          <Input
            label="Titre"
            value={form.title}
            onChange={e => f('title', e.target.value)}
            placeholder="Chef exécutif"
          />

          <Input
            label="Slogan"
            value={form.slogan}
            onChange={e => f('slogan', e.target.value)}
            placeholder="« L'authenticité italienne, simplement »"
          />

          <div>
            <label className="gc-label">Photo</label>
            <ImageUploader
              value={form.photo_url}
              onChange={url => f('photo_url', url)}
              hint="Photo du chef — JPEG, PNG, WebP…"
            />
          </div>

          <Textarea
            label="Description / Bio"
            value={form.bio}
            onChange={e => f('bio', e.target.value)}
            rows={4}
            placeholder="Présentation du chef affichée sur la page restaurant…"
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={e => f('is_featured', e.target.checked)}
                className="accent-[#D4A017]"
              />
              Chef mis en avant sur le restaurant
            </label>
            <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={e => f('is_active', e.target.checked)}
                className="accent-[#D4A017]"
              />
              Actif
            </label>
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
