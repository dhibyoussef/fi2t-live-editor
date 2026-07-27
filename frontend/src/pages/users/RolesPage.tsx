import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit, Trash2, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function RolesPage() {
  const qc = useQueryClient()
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [form, setForm] = useState({ name: '', permissions: [] as string[] })

  const { data: roles, isLoading } = useQuery({ queryKey: ['roles'], queryFn: () => api.get('/admin/roles').then(r => r.data) })
  const { data: allPerms } = useQuery({ queryKey: ['permissions'], queryFn: () => api.get('/admin/permissions').then(r => r.data) })

  const createM = useMutation({ mutationFn: (d: any) => api.post('/admin/roles', d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setModal(null); toast.success('Rôle créé') } })
  const updateM = useMutation({ mutationFn: (d: any) => api.put(`/admin/roles/${selected?.id}`, d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); setModal(null); toast.success('Mis à jour') } })
  const deleteM = useMutation({ mutationFn: (id: number) => api.delete(`/admin/roles/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['roles'] }); toast.success('Supprimé') } })

  const togglePerm = (name: string) => {
    setForm(f => ({ ...f, permissions: f.permissions.includes(name) ? f.permissions.filter(p => p !== name) : [...f.permissions, name] }))
  }

  const permsGrouped: Record<string, any[]> = allPerms ?? {}

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>Rôles & Permissions</h2>
          <p className="text-sm text-[#B89E72]">{(roles ?? []).length} rôles</p>
        </div>
        <Button onClick={() => { setForm({ name: '', permissions: [] }); setModal('create') }}><Plus size={15} /> Nouveau rôle</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-[#D4A017] border-t-transparent" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(roles ?? []).map((role: any) => (
            <Card key={role.id} variant="sand">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#D4A017]" />
                    <span className="font-semibold text-[#1C1811]">{role.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setSelected(role); setForm({ name: role.name, permissions: role.permissions?.map((p: any) => p.name) ?? [] }); setModal('edit') }}
                      className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"><Edit size={13} /></button>
                    {!['super-admin','admin'].includes(role.name) && (
                      <button onClick={() => { if(confirm('Supprimer ce rôle ?')) deleteM.mutate(role.id) }}
                        className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors"><Trash2 size={13} /></button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1.5">
                  {(role.permissions ?? []).slice(0, 8).map((p: any) => (
                    <span key={p.id} className="px-2 py-0.5 rounded-full text-xs bg-[#FAF0D0] text-[#6B4F00]">{p.name}</span>
                  ))}
                  {(role.permissions ?? []).length > 8 && (
                    <span className="px-2 py-0.5 rounded-full text-xs bg-[#F0EAD6] text-[#5A4628]">+{role.permissions.length - 8}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal === 'create' ? 'Nouveau rôle' : 'Modifier le rôle'} size="lg">
        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); modal === 'create' ? createM.mutate(form) : updateM.mutate(form) }}>
          <Input label="Nom du rôle" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="ex: receptionist" />

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#6B6145] mb-3">Permissions</p>
            <div className="space-y-4 max-h-72 overflow-y-auto">
              {Object.entries(permsGrouped).map(([group, perms]) => (
                <div key={group}>
                  <p className="text-xs font-semibold text-[#D4A017] uppercase mb-2">{group}</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(perms as any[]).map((p: any) => (
                      <label key={p.id} className="flex items-center gap-2 text-sm text-[#6B6145] cursor-pointer hover:text-[#1C1811]">
                        <input type="checkbox" checked={form.permissions.includes(p.name)}
                          onChange={() => togglePerm(p.name)} className="accent-[#D4A017]" />
                        {p.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
