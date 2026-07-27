import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import api from '../../api/client'

export default function ClientsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [viewModal, setViewModal] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['clients', page, search],
    queryFn: () => api.get(`/admin/clients?page=${page}&search=${search}&per_page=12`).then(r => r.data),
  })

  const { data: clientDetail } = useQuery({
    queryKey: ['client-detail', viewModal?.id],
    queryFn: () => api.get(`/admin/clients/${viewModal.id}`).then(r => r.data),
    enabled: !!viewModal,
  })

  const columns = [
    { key: 'full_name', header: 'Client',
      render: (c: any) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold text-[#3D2D00]"
            style={{ background: 'var(--gradient-gold)' }}>
            {c.first_name?.[0]}{c.last_name?.[0]}
          </div>
          <div>
            <p className="font-medium text-[#1C1811]">{c.first_name} {c.last_name}</p>
            <p className="text-xs text-[#B89E72]">{c.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', header: 'Téléphone', render: (c: any) => c.phone ?? '—' },
    { key: 'country', header: 'Pays', render: (c: any) => c.country ?? '—' },
    { key: 'city', header: 'Ville', render: (c: any) => c.city ?? '—' },
    { key: 'reservations_count', header: 'Réservations',
      render: (c: any) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#FAF0D0] text-[#6B4F00]">
          {c.reservations_count ?? 0}
        </span>
      )
    },
    { key: 'created_at', header: 'Client depuis',
      render: (c: any) => new Date(c.created_at).toLocaleDateString('fr-FR')
    },
    { key: 'actions', header: '',
      render: (c: any) => (
        <button onClick={(e) => { e.stopPropagation(); setViewModal(c) }}
          className="p-1.5 rounded-lg text-[#B5AE98] hover:bg-[#FAF0D0] hover:text-[#D4A017] transition-colors">
          <Eye size={14} />
        </button>
      )
    },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>Clients</h2>
        <p className="text-sm text-[#B89E72]">{data?.meta?.total ?? 0} clients</p>
      </div>
      <Card>
        <CardHeader>
          <Input icon={<Search size={14} />} placeholder="Nom, email..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="max-w-xs" />
        </CardHeader>
        <CardContent className="p-0">
          <Table columns={columns as any} data={data?.data ?? []} loading={isLoading} />
          {data?.meta && <div className="px-5 pb-4"><Pagination {...data.meta} onPageChange={setPage} /></div>}
        </CardContent>
      </Card>

      <Modal open={!!viewModal} onClose={() => setViewModal(null)} title={`${viewModal?.first_name} ${viewModal?.last_name}`} size="lg">
        {clientDetail && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[['Email', clientDetail.email], ['Téléphone', clientDetail.phone ?? '—'], ['Pays', clientDetail.country ?? '—'], ['Ville', clientDetail.city ?? '—']].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-[#FDF8EC] px-3 py-2">
                  <p className="text-xs text-[#B89E72] uppercase tracking-wide">{l}</p>
                  <p className="text-sm font-medium text-[#1C1811]">{v}</p>
                </div>
              ))}
            </div>
            {clientDetail.reservations?.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#6B6145] mb-2">Réservations récentes</p>
                <div className="space-y-2">
                  {clientDetail.reservations.slice(0, 4).map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between rounded-lg bg-[#FAF7F2] px-3 py-2">
                      <span className="text-sm text-[#1C1811]">#{r.room?.room_number} — {r.nights} nuits</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#D4A017]">{parseFloat(r.total_price).toLocaleString('fr-TN', { minimumFractionDigits: 3 })} TND</span>
                        <Badge status={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
