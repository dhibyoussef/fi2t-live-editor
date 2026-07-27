import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Edit, Trash2, Eye, EyeOff, MoveUp, MoveDown, Handshake,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { ImageUploader } from '../../components/ui/ImageUploader'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface Partner {
  id: number
  name: string
  logo_url: string | null
  sort_order: number
  is_active: boolean
}

const EMPTY = {
  name: '',
  logo_url: '',
  is_active: true,
}

export default function PartenairesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [selected, setSelected] = useState<Partner | null>(null)
  const [form, setForm] = useState(EMPTY)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const { data: partners = [], isLoading } = useQuery<Partner[]>({
    queryKey: ['partners'],
    queryFn: () => api.get('/admin/partners').then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['partners'] })

  const parseErrors = (e: any) => {
    const errs = e.response?.data?.errors ?? {}
    const flat: Record<string, string> = {}
    Object.entries(errs).forEach(([k, v]) => {
      flat[k] = Array.isArray(v) ? (v[0] as string) : String(v)
    })
    return flat
  }

  const addM = useMutation({
    mutationFn: (d: typeof EMPTY) => api.post('/admin/partners', {
      ...d,
      logo_url: d.logo_url || null,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Partenaire ajouté') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const updateM = useMutation({
    mutationFn: (d: typeof EMPTY) => api.put(`/admin/partners/${selected?.id}`, {
      ...d,
      logo_url: d.logo_url || null,
    }),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Partenaire mis à jour') },
    onError: (e: any) => { setFormErrors(parseErrors(e)); toast.error(e.response?.data?.message ?? 'Erreur') },
  })

  const toggleM = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/partners/${id}/toggle`),
    onSuccess: invalidate,
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/partners/${id}`),
    onSuccess: () => { invalidate(); toast.success('Partenaire supprimé') },
  })

  const reorderM = useMutation({
    mutationFn: (order: number[]) => api.post('/admin/partners/reorder', { order }),
    onSuccess: invalidate,
  })

  const f = (key: keyof typeof EMPTY, val: unknown) =>
    setForm(p => ({ ...p, [key]: val }))

  const openAdd = () => {
    setForm(EMPTY)
    setFormErrors({})
    setSelected(null)
    setModal('add')
  }

  const openEdit = (partner: Partner) => {
    setSelected(partner)
    setFormErrors({})
    setForm({
      name: partner.name,
      logo_url: partner.logo_url ?? '',
      is_active: partner.is_active,
    })
    setModal('edit')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Le nom est requis')
      return
    }
    if (modal === 'add') addM.mutate(form)
    else updateM.mutate(form)
  }

  const move = (index: number, direction: -1 | 1) => {
    const next = index + direction
    if (next < 0 || next >= partners.length) return
    const order = partners.map(p => p.id)
    ;[order[index], order[next]] = [order[next], order[index]]
    reorderM.mutate(order)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>
            Partenaires
          </h2>
          <p className="text-sm text-[#B89E72]">{partners.length} partenaire{partners.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={openAdd}><Plus size={15} /> Nouveau partenaire</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><div className="gc-spinner" /></div>
      ) : partners.length === 0 ? (
        <div className="text-center py-16 text-[#B89E72]">
          <Handshake size={32} className="mx-auto mb-3 opacity-40" />
          <p>Aucun partenaire pour le moment</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {partners.map((partner, index) => (
            <div
              key={partner.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-[#E8DFC8] bg-white"
            >
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  disabled={index === 0 || reorderM.isPending}
                  onClick={() => move(index, -1)}
                  className="p-1 rounded text-[#B5AE98] hover:text-[#D4A017] disabled:opacity-30"
                  aria-label="Monter"
                >
                  <MoveUp size={14} />
                </button>
                <button
                  type="button"
                  disabled={index === partners.length - 1 || reorderM.isPending}
                  onClick={() => move(index, 1)}
                  className="p-1 rounded text-[#B5AE98] hover:text-[#D4A017] disabled:opacity-30"
                  aria-label="Descendre"
                >
                  <MoveDown size={14} />
                </button>
              </div>

              <div className="h-14 w-28 flex-shrink-0 rounded-lg border border-[#E8DFC8] bg-[#FAF7F0] flex items-center justify-center overflow-hidden">
                {partner.logo_url ? (
                  <img src={partner.logo_url} alt="" className="max-h-10 max-w-[100px] object-contain" />
                ) : (
                  <Handshake size={20} className="text-[#D4C9A8]" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1C1811] truncate">{partner.name}</p>
              </div>

              <Badge status={partner.is_active ? 'CONFIRMED' : 'CANCELLED'} />

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => toggleM.mutate(partner.id)}
                  className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"
                  title={partner.is_active ? 'Désactiver' : 'Activer'}
                >
                  {partner.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(partner)}
                  className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"
                >
                  <Edit size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => { if (confirm('Supprimer ce partenaire ?')) deleteM.mutate(partner.id) }}
                  className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'add' ? 'Nouveau partenaire' : 'Modifier le partenaire'}
        size="md"
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Nom"
            required
            value={form.name}
            onChange={e => f('name', e.target.value)}
            error={formErrors.name}
            placeholder="Nom du partenaire"
          />

          <div>
            <label className="gc-label">Logo</label>
            <ImageUploader
              value={form.logo_url}
              onChange={url => f('logo_url', url)}
              hint="Logo du partenaire — JPEG, PNG, WebP, SVG…"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => f('is_active', e.target.checked)}
              className="accent-[#D4A017]"
            />
            Actif (visible sur le site)
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Annuler</Button>
            <Button type="submit" loading={addM.isPending || updateM.isPending}>
              {modal === 'add' ? 'Créer' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
