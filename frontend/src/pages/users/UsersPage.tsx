import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, ToggleLeft, ToggleRight, Users } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import type { User, Role } from '../../types'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  first_name: '', last_name: '', email: '',
  password: '', password_confirmation: '',
  roles: [] as string[], is_active: true,
}

export default function UsersPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | 'edit' | null>(null)
  const [selected, setSelected] = useState<User | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => api.get(`/admin/users?page=${page}&search=${search}&per_page=12`).then(r => r.data),
  })
  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/admin/roles').then(r => r.data),
  })
  const roles: Role[] = rolesData ?? []
  const users: User[] = data?.data ?? []

  const createM = useMutation({
    mutationFn: (d: typeof EMPTY_FORM) => api.post('/admin/users', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null); toast.success('Utilisateur créé') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur'),
  })
  const updateM = useMutation({
    mutationFn: (d: Partial<typeof EMPTY_FORM>) => api.put(`/admin/users/${selected?.id}`, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setModal(null); toast.success('Utilisateur mis à jour') },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur'),
  })
  const toggleM = useMutation({
    mutationFn: (id: number) => api.patch(`/admin/users/${id}/toggle-status`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Utilisateur supprimé') },
  })

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create') }
  const openEdit   = (u: User) => {
    setSelected(u)
    setForm({
      first_name: u.first_name, last_name: u.last_name, email: u.email,
      password: '', password_confirmation: '',
      roles: u.roles?.map((r: any) => r.name ?? r) ?? [],
      is_active: u.is_active,
    })
    setModal('edit')
  }

  const columns = [
    {
      key: 'user', header: 'Utilisateur',
      render: (u: User) => (
        <div className="gc-user-cell">
          <div className="gc-avatar gc-avatar-sm">
            {u.first_name?.[0]}{u.last_name?.[0]}
          </div>
          <div>
            <p className="gc-user-cell-name">{u.first_name} {u.last_name}</p>
            <p className="gc-user-cell-email">{u.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'roles', header: 'Rôle',
      render: (u: User) => (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const }}>
          {(u.roles ?? []).map((r: any) => (
            <Badge key={r.name ?? r} status={(r.name ?? r).replace('-', '_')} size="xs">
              {r.name ?? r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: 'status', header: 'Statut',
      render: (u: User) => (
        <Badge status={u.is_active ? 'active' : 'inactive'} dot>
          {u.is_active ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      key: 'actions', header: '', align: 'right' as const,
      render: (u: User) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="xs"
            icon={u.is_active ? <ToggleRight size={13}/> : <ToggleLeft size={13}/>}
            onClick={() => toggleM.mutate(u.id)}
          >
            {u.is_active ? 'Désactiver' : 'Activer'}
          </Button>
          <Button variant="secondary" size="xs" icon={<Edit size={12}/>} onClick={() => openEdit(u)}>
            Modifier
          </Button>
          <Button
            variant="danger" size="xs" iconOnly
            icon={<Trash2 size={12}/>}
            onClick={() => { if (confirm(`Supprimer ${u.first_name} ${u.last_name} ?`)) deleteM.mutate(u.id) }}
          />
        </div>
      ),
    },
  ]

  return (
    <>
      {/* Page header */}
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <div className="gc-page-header-icon"><Users size={18}/></div>
          <div>
            <p className="gc-page-header-title">Utilisateurs</p>
            <p className="gc-page-header-sub">{data?.total ?? 0} compte{(data?.total ?? 0) !== 1 ? 's' : ''} au total</p>
          </div>
        </div>
        <Button icon={<Plus size={14}/>} onClick={openCreate}>Nouvel utilisateur</Button>
      </div>

      {/* Search */}
      <div className="gc-search-wrap">
        <Input
          placeholder="Rechercher un utilisateur..."
          icon={<Search size={14}/>}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {/* Table */}
      <Table columns={columns} data={users} loading={isLoading} rowKey={u => u.id} emptyText="Aucun utilisateur trouvé" />

      {/* Pagination */}
      {data?.last_page > 1 && (
        <Pagination current_page={page} last_page={data.last_page} onPageChange={setPage} />
      )}

      {/* Modal */}
      <Modal
        open={modal !== null}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Nouvel utilisateur' : "Modifier l'utilisateur"}
        subtitle="Remplissez les informations du compte"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(null)}>Annuler</Button>
            <Button
              loading={createM.isPending || updateM.isPending}
              onClick={() => modal === 'create' ? createM.mutate(form) : updateM.mutate(form)}
            >
              {modal === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="gc-grid-2">
            <Input label="Prénom" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} placeholder="Ahmed" />
            <Input label="Nom"    value={form.last_name}  onChange={e => setForm(f => ({ ...f, last_name:  e.target.value }))} placeholder="Mansour" />
          </div>
          <Input label="Adresse e-mail" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="ahmed@goldencarthage.com" />
          <div className="gc-grid-2">
            <Input label={modal === 'edit' ? 'Nouveau mot de passe' : 'Mot de passe'} type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" />
            <Input label="Confirmation" type="password" value={form.password_confirmation} onChange={e => setForm(f => ({ ...f, password_confirmation: e.target.value }))} placeholder="••••••••" />
          </div>
          <Select label="Rôle" value={form.roles[0] ?? ''} onChange={e => setForm(f => ({ ...f, roles: e.target.value ? [e.target.value] : [] }))}>
            <option value="">— Sélectionner un rôle —</option>
            {roles.map((r: any) => <option key={r.id} value={r.name}>{r.name}</option>)}
          </Select>
          <Select label="Statut" value={form.is_active ? 'active' : 'inactive'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'active' }))}>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </Select>
        </div>
      </Modal>
    </>
  )
}
