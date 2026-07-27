import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { ImageUploader } from '../../components/ui/ImageUploader'
import { AmenityIcon, isImageIcon } from './AmenityIcon'
import { Table } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'
import { AMENITY_CATEGORY_LABELS } from './roomLabels'

const AMENITY_CATEGORIES = Object.keys(AMENITY_CATEGORY_LABELS)

function emptyForm() {
  return { name: '', icon: '', category: 'TECH' }
}

export default function RoomAmenitiesPage() {
  const qc = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filterCat, setFilterCat] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState(emptyForm())
  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const { data, isLoading } = useQuery({
    queryKey: ['room-amenities'],
    queryFn: () => api.get('/admin/room-amenities').then(r => r.data),
  })

  const amenities = Array.isArray(data) ? data : (data?.data ?? [])

  const filtered = useMemo(() => {
    if (!filterCat) return amenities
    return amenities.filter((a: any) => a.category === filterCat)
  }, [amenities, filterCat])

  useEffect(() => {
    if (searchParams.get('add') === '1') {
      setForm(emptyForm())
      setModal('create')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const createM = useMutation({
    mutationFn: (d: any) => api.post('/admin/room-amenities', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['room-amenities'] }); setModal(null); toast.success('Équipement créé') },
  })
  const updateM = useMutation({
    mutationFn: (d: any) => api.put(`/admin/room-amenities/${selected?.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['room-amenities'] }); setModal(null); toast.success('Mis à jour') },
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/room-amenities/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['room-amenities'] }); toast.success('Supprimé') },
  })

  const columns = [
    {
      key: 'name', header: 'Équipement',
      render: (a: any) => (
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#FAF0D0] overflow-hidden">
            <AmenityIcon icon={a.icon} size={isImageIcon(a.icon) ? 28 : 18} />
          </span>
          <p className="font-medium text-[#1C1811]">{a.name}</p>
        </div>
      ),
    },
    {
      key: 'category', header: 'Catégorie',
      render: (a: any) => (
        <span className="text-xs px-2 py-0.5 rounded-full bg-[#F0EAD6] text-[#5A4628]">
          {AMENITY_CATEGORY_LABELS[a.category] ?? a.category}
        </span>
      ),
    },
    {
      key: 'actions', header: '',
      render: (a: any) => (
        <div className="flex gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); setSelected(a); setForm(a); setModal('edit') }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"><Edit size={14} /></button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer cet équipement ?')) deleteM.mutate(a.id) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Link to="/accommodation" className="inline-flex items-center gap-1 text-sm text-[#B89E72] hover:text-[#D4A017] transition-colors">
        <ArrowLeft size={14} /> Hébergement
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>Équipements des chambres</h2>
          <p className="text-sm text-[#B89E72]">{amenities.length} équipements — sélectionnables lors de la création d'une chambre</p>
        </div>
        <Button onClick={() => { setForm(emptyForm()); setModal('create') }}><Plus size={15} /> Nouvel équipement</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterCat('')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${!filterCat ? 'border-[#D4A017] bg-[#FAF0D0] text-[#6B4F00]' : 'border-[#DDD0B0] text-[#6B6145] hover:bg-[#FAF0D0]'}`}>
          Tous
        </button>
        {AMENITY_CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${filterCat === c ? 'border-[#D4A017] bg-[#FAF0D0] text-[#6B4F00]' : 'border-[#DDD0B0] text-[#6B6145] hover:bg-[#FAF0D0]'}`}>
            {AMENITY_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns as any} data={filtered} loading={isLoading} />
        </CardContent>
      </Card>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nouvel équipement' : 'Modifier l\'équipement'}>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); modal === 'create' ? createM.mutate(form) : updateM.mutate(form) }}>
          <Input label="Nom" required value={form.name} onChange={e => f('name', e.target.value)} placeholder="Wi-Fi haut débit" />
          <div>
            <label className="gc-label">Icône (image)</label>
            <p className="text-xs text-[#B89E72] mb-2">Tous formats image acceptés — 64×64 px recommandé</p>
            <ImageUploader
              value={isImageIcon(form.icon) ? form.icon : ''}
              onChange={url => f('icon', url)}
            />
          </div>
          <Input
            label="Ou icône emoji"
            value={!isImageIcon(form.icon) ? (form.icon ?? '') : ''}
            onChange={e => f('icon', e.target.value)}
            placeholder="📶"
            hint={isImageIcon(form.icon) ? 'Supprimez l\'image pour utiliser un emoji' : undefined}
          />
          <Select label="Catégorie" value={form.category} onChange={e => f('category', e.target.value)}>
            {AMENITY_CATEGORIES.map(c => <option key={c} value={c}>{AMENITY_CATEGORY_LABELS[c]}</option>)}
          </Select>
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
