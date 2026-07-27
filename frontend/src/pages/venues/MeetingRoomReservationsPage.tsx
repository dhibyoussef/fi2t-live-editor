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

function formatTime(value: string | null | undefined) {
  if (!value) return '—'
  return String(value).slice(0, 5)
}

export default function MeetingRoomReservationsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [viewModal, setViewModal] = useState<any>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['meeting-room-bookings', page, filterStatus],
    queryFn: () =>
      api
        .get(`/admin/meeting-room-bookings?page=${page}&per_page=12${filterStatus ? `&status=${filterStatus}` : ''}`)
        .then(r => r.data),
  })

  const updateM = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.put(`/admin/meeting-room-bookings/${id}`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['meeting-room-bookings'] })
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
      key: 'room_name',
      header: 'Salle',
      render: (r: any) => r.meeting_room?.name ?? r.room_name ?? '—',
    },
    {
      key: 'disposition',
      header: 'Disposition',
      render: (r: any) => r.disposition ?? '—',
    },
    {
      key: 'event_date',
      header: 'Événement',
      render: (r: any) => (
        <div>
          <p className="font-medium">{new Date(r.event_date).toLocaleDateString('fr-FR')}</p>
          <p className="text-xs text-[#B89E72]">
            {formatTime(r.start_time)}
            {r.end_time ? ` → ${formatTime(r.end_time)}` : ''}
          </p>
        </div>
      ),
    },
    {
      key: 'participants',
      header: 'Part.',
      render: (r: any) => r.participants,
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
          Réservations Salles & Événements
        </h2>
        <p className="text-sm text-[#B89E72]">{data?.meta?.total ?? 0} demandes (site web)</p>
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
        title={`Réservation salle #${viewModal?.id}`}
        size="md"
      >
        {viewModal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Client', viewModal.full_name],
                ['Email', viewModal.email],
                ['Téléphone', `${viewModal.country_code ?? ''} ${viewModal.phone}`.trim()],
                ['Société', viewModal.company_name ?? '—'],
                ['Salle', viewModal.meeting_room?.name ?? viewModal.room_name],
                ['Disposition', viewModal.disposition ?? '—'],
                ['Type événement', viewModal.event_type ?? '—'],
                ['Date', new Date(viewModal.event_date).toLocaleDateString('fr-FR')],
                ['Début', formatTime(viewModal.start_time)],
                ['Fin', formatTime(viewModal.end_time)],
                ['Participants', viewModal.participants],
                ['Traiteur', viewModal.needs_catering ?? '—'],
                ['Audiovisuel', viewModal.needs_av_equipment ?? '—'],
                ['Résident hôtel', viewModal.is_hotel_resident ?? '—'],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-[#FDF8EC] px-3 py-2">
                  <p className="text-xs text-[#B89E72] uppercase tracking-wide">{l}</p>
                  <p className="text-sm font-medium text-[#1C1811]">{v}</p>
                </div>
              ))}
            </div>
            {viewModal.comments && (
              <div className="rounded-lg bg-[#FDF8EC] px-3 py-2">
                <p className="text-xs text-[#B89E72] uppercase tracking-wide">Commentaires</p>
                <p className="text-sm font-medium text-[#1C1811] whitespace-pre-wrap">{viewModal.comments}</p>
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
