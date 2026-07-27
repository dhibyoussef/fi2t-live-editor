import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'

export default function ReservationsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [viewModal, setViewModal] = useState<any>(null)
  const [editModal, setEditModal] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['reservations', page, filterStatus],
    queryFn: () => api.get(`/admin/reservations?page=${page}&per_page=12${filterStatus ? `&status=${filterStatus}` : ''}`).then(r => r.data),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => api.put(`/admin/reservations/${id}`, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); setEditModal(null); toast.success('Statut mis à jour') },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/reservations/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reservations'] }); toast.success('Supprimé') },
  })

  const columns = [
    { key: 'id', header: '#', render: (r: any) => <span className="font-mono text-[#D4A017] font-semibold">#{r.id}</span> },
    { key: 'client', header: 'Client',
      render: (r: any) => (
        <div>
          <p className="font-medium text-[#1C1811]">{r.client?.first_name} {r.client?.last_name}</p>
          <p className="text-xs text-[#B89E72]">{r.client?.email}</p>
        </div>
      )
    },
    { key: 'room', header: 'Chambre',
      render: (r: any) => <span className="font-medium">#{r.room?.room_number} — {r.room?.name}</span>
    },
    { key: 'dates', header: 'Séjour',
      render: (r: any) => (
        <div className="text-sm">
          <p>{new Date(r.check_in).toLocaleDateString('fr-FR')} → {new Date(r.check_out).toLocaleDateString('fr-FR')}</p>
          <p className="text-xs text-[#B89E72]">{r.nights} nuit{r.nights > 1 ? 's' : ''}</p>
        </div>
      )
    },
    { key: 'total_price', header: 'Total',
      render: (r: any) => <span className="font-semibold">{parseFloat(r.total_price).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
    },
    { key: 'status', header: 'Statut', render: (r: any) => <Badge status={r.status} /> },
    { key: 'actions', header: '',
      render: (r: any) => (
        <div className="flex gap-1 justify-end">
          <button onClick={(e) => { e.stopPropagation(); setViewModal(r) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors">
            <Eye size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setEditModal(r) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors">
            <Edit size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ?')) deleteMutation.mutate(r.id) }}
            className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FCEBEB] hover:text-[#C0392B] transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      )
    },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>Réservations</h2>
          <p className="text-sm text-[#B89E72]">{data?.meta?.total ?? 0} réservations</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map((s) => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filterStatus === s ? 'border-[#D4A017] bg-[#FAF0D0] text-[#6B4F00]' : 'border-[#DDD0B0] text-[#6B6145] hover:bg-[#FAF0D0]'}`}>
            {s || 'Tous'}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns as any} data={data?.data ?? []} loading={isLoading} />
          {data?.meta && <div className="px-5 pb-4"><Pagination {...data.meta} onPageChange={setPage} /></div>}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={`Réservation #${viewModal?.id}`}>
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Client', `${viewModal.client?.first_name} ${viewModal.client?.last_name}`],
                ['Email', viewModal.client?.email],
                ['Chambre', `#${viewModal.room?.room_number} — ${viewModal.room?.name}`],
                ['Arrivée', new Date(viewModal.check_in).toLocaleDateString('fr-FR')],
                ['Départ', new Date(viewModal.check_out).toLocaleDateString('fr-FR')],
                ['Nuits', viewModal.nights],
                ['Adultes / Enfants', `${viewModal.adults} / ${viewModal.children}`],
                ['Prix / nuit', `${parseFloat(viewModal.price_per_night).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND`],
                ['Total', `${parseFloat(viewModal.total_price).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND`],
                ['Statut', ''],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg bg-[#FDF8EC] px-3 py-2">
                  <p className="text-xs text-[#B89E72] uppercase tracking-wide">{label}</p>
                  {label === 'Statut' ? <Badge status={viewModal.status} /> : <p className="text-sm font-medium text-[#1C1811]">{val}</p>}
                </div>
              ))}
            </div>
            {viewModal.special_requests && (
              <div className="rounded-lg bg-[#FAF7F2] p-3">
                <p className="text-xs text-[#B89E72] uppercase tracking-wide mb-1">Demandes spéciales</p>
                <p className="text-sm text-[#1C1811]">{viewModal.special_requests}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Status Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Changer le statut" size="sm">
        {editModal && (
          <div className="space-y-4">
            <Select label="Nouveau statut" defaultValue={editModal.status}
              onChange={(e) => updateMutation.mutate({ id: editModal.id, status: e.target.value })}>
              {['PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
            <Button variant="secondary" onClick={() => setEditModal(null)} className="w-full">Fermer</Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
