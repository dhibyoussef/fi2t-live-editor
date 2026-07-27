import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Eye } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import api from '../../api/client'
import toast from 'react-hot-toast'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
}

export default function RestaurantReservationsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [viewModal, setViewModal] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant-reservations', page, filterStatus],
    queryFn: () => api.get(`/admin/restaurant-reservations?page=${page}&per_page=12${filterStatus ? `&status=${filterStatus}` : ''}`).then(r => r.data),
  })

  const updateM = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/admin/restaurant-reservations/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['restaurant-reservations'] })
      toast.success('Statut mis à jour')
    },
  })

  const columns = [
    {
      key: 'full_name',
      header: 'Client',
      render: (r: any) => <span className="font-medium">{r.full_name}</span>,
    },
    {
      key: 'restaurant',
      header: 'Restaurant',
      render: (r: any) => r.outlet?.name ?? r.restaurant_name ?? '—',
    },
    {
      key: 'reservation_date',
      header: 'Date & heure',
      render: (r: any) => (
        <div>
          <p className="font-medium">{new Date(r.reservation_date).toLocaleDateString('fr-FR')}</p>
          <p className="text-xs text-[#B89E72]">{String(r.reservation_time).slice(0, 5)}</p>
        </div>
      ),
    },
    {
      key: 'guests_count',
      header: 'Pers.',
      render: (r: any) => r.guests_count,
    },
    {
      key: 'phone',
      header: 'Téléphone',
      render: (r: any) => (
        <span className="text-sm">
          {r.country_code ? `${r.country_code} ` : ''}{r.phone}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (r: any) => <Badge status={r.status}>{STATUS_LABELS[r.status] ?? r.status}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      render: (r: any) => (
        <button
          onClick={(e) => { e.stopPropagation(); setViewModal(r) }}
          className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors"
        >
          <Eye size={14} />
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>
          Réservations Restaurant
        </h2>
        <p className="text-sm text-[#B89E72]">{data?.meta?.total ?? 0} réservations</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map(s => (
          <button
            key={s}
            onClick={() => { setFilterStatus(s); setPage(1) }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${filterStatus === s ? 'border-[#D4A017] bg-[#FAF0D0] text-[#6B4F00]' : 'border-[#DDD0B0] text-[#6B6145] hover:bg-[#FAF0D0]'}`}
          >
            {s ? (STATUS_LABELS[s] ?? s) : 'Tous'}
          </button>
        ))}
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
        open={!!viewModal}
        onClose={() => setViewModal(null)}
        title={`Réservation #${viewModal?.id}`}
        size="md"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Client', viewModal.full_name],
                ['Email', viewModal.email],
                ['Téléphone', `${viewModal.country_code ?? ''} ${viewModal.phone}`.trim()],
                ['Restaurant', viewModal.outlet?.name ?? viewModal.restaurant_name],
                ['Date', new Date(viewModal.reservation_date).toLocaleDateString('fr-FR')],
                ['Heure', String(viewModal.reservation_time).slice(0, 5)],
                ['Personnes', viewModal.guests_count],
                ['Table', viewModal.table_type ?? '—'],
                ['Occasion', viewModal.occasion ?? '—'],
                ['Préférences', viewModal.dietary_preferences ?? '—'],
                ['N° chambre', viewModal.room_number ?? '—'],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-[#FDF8EC] px-3 py-2">
                  <p className="text-xs text-[#B89E72] uppercase tracking-wide">{l}</p>
                  <p className="text-sm font-medium text-[#1C1811]">{v}</p>
                </div>
              ))}
            </div>
            {viewModal.message && (
              <div className="rounded-lg bg-[#FDF8EC] px-3 py-2">
                <p className="text-xs text-[#B89E72] uppercase tracking-wide">Message</p>
                <p className="text-sm font-medium text-[#1C1811] whitespace-pre-wrap">{viewModal.message}</p>
              </div>
            )}
            <Select
              label="Changer le statut"
              defaultValue={viewModal.status}
              onChange={(e) => updateM.mutate({ id: viewModal.id, status: e.target.value })}
            >
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Button variant="secondary" onClick={() => setViewModal(null)} className="w-full">
              Fermer
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
