import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, Clock, Users, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'

const SPA_CATEGORIES = ['MASSAGE','FACIAL','BODY_WRAP','HAMMAM','HYDROTHERAPY','MANICURE','PEDICURE','PACKAGE']

export default function SpaPage() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const empty = { name: '', category: 'MASSAGE', description: '', duration_min: 60, price: '', is_couples: false, is_active: true }
  const [form, setForm] = useState<any>(empty)
  const f = (k: string, v: any) => setForm((p: any) => ({ ...p, [k]: v }))

  const { data, isLoading } = useQuery({ queryKey: ['spa-services'], queryFn: () => api.get('/admin/spa-services').then(r => r.data) })

  const createM = useMutation({ mutationFn: (d: any) => api.post('/admin/spa-services', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['spa-services'] }); setModal(null); toast.success('Service créé') } })
  const updateM = useMutation({ mutationFn: (d: any) => api.put(`/admin/spa-services/${selected?.id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['spa-services'] }); setModal(null); toast.success('Mis à jour') } })
  const deleteM = useMutation({ mutationFn: (id: number) => api.delete(`/admin/spa-services/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['spa-services'] }); toast.success('Supprimé') } })

  const columns = [
    { key: 'name', header: 'Service',
      render: (s: any) => (
        <div>
          <p className="font-medium text-[#1C1811]">{s.name}</p>
          <p className="text-xs text-[#B89E72]">{s.category}</p>
        </div>
      )
    },
    { key: 'duration_min', header: 'Durée',
      render: (s: any) => <span className="flex items-center gap-1 text-sm"><Clock size={12} className="text-[#D4A017]" />{s.duration_min} min</span>
    },
    { key: 'price', header: 'Prix',
      render: (s: any) => <span className="font-semibold text-[#1C1811]">{parseFloat(s.price).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
    },
    { key: 'is_couples', header: 'Duo',
      render: (s: any) => s.is_couples ? <span className="flex items-center gap-1 text-xs text-[#D4A017]"><Users size={12} />Duo</span> : '—'
    },
    { key: 'is_active', header: 'Statut', render: (s: any) => <Badge status={s.is_active ? 'CONFIRMED' : 'CANCELLED'} /> },
    { key: 'actions', header: '',
      render: (s: any) => (
        <div className="flex gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); setSelected(s); setForm(s); setModal('edit') }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"><Edit size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ?')) deleteM.mutate(s.id) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5">
      <Link to="/venues" className="inline-flex items-center gap-1 text-sm text-[#B89E72] hover:text-[#D4A017] transition-colors">
        <ArrowLeft size={14} /> Espaces & Lieux
      </Link>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>Services Spa</h2>
          <p className="text-sm text-[#B89E72]">{(data?.data ?? data ?? []).length} services</p>
        </div>
        <Button onClick={() => { setForm(empty); setModal('create') }}><Plus size={15} /> Nouveau service</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table columns={columns as any} data={data?.data ?? data ?? []} loading={isLoading} />
        </CardContent>
      </Card>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nouveau service' : 'Modifier'}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); modal === 'create' ? createM.mutate(form) : updateM.mutate(form) }}>
          <Input label="Nom du soin" required value={form.name} onChange={e => f('name', e.target.value)} />
          <Select label="Catégorie" value={form.category} onChange={e => f('category', e.target.value)}>
            {SPA_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Durée (min)" type="number" value={form.duration_min} onChange={e => f('duration_min', +e.target.value)} />
            <Input label="Prix (TND)" type="number" step="0.001" required value={form.price} onChange={e => f('price', e.target.value)} />
          </div>
          <Input label="Description" value={form.description ?? ''} onChange={e => f('description', e.target.value)} />
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
              <input type="checkbox" checked={form.is_couples} onChange={e => f('is_couples', e.target.checked)} className="accent-[#D4A017]" /> Soin duo
            </label>
            <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => f('is_active', e.target.checked)} className="accent-[#D4A017]" /> Actif
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Annuler</Button>
            <Button type="submit" loading={createM.isPending || updateM.isPending}>{modal === 'create' ? 'Créer' : 'Enregistrer'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
