import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Inbox, Search, Trash2, Mail, MailOpen, Archive, CheckCheck } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Table, Pagination } from '../../components/ui/Table'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'

export type FormType = 'contact' | 'newsletter' | 'adhesion'
export type FormStatus = 'new' | 'read' | 'archived'

export type FormSubmission = {
  id: number
  type: FormType
  status: FormStatus
  name: string | null
  email: string
  subject: string | null
  payload: Record<string, string> | null
  ip: string | null
  mailed_at: string | null
  mail_error: string | null
  created_at: string
}

const FIELD_KEY: Record<string, string> = {
  name: 'forms.field_name',
  email: 'forms.field_email',
  subject: 'forms.field_subject',
  message: 'forms.field_message',
  org: 'forms.field_org',
  contact: 'forms.field_contact',
  phone: 'forms.field_phone',
  activity: 'forms.field_activity',
}

function formatDate(iso: string, locale: string) {
  const tag = locale.startsWith('ar') ? 'ar' : locale.startsWith('en') ? 'en-GB' : 'fr-FR'
  try {
    return new Date(iso).toLocaleString(tag, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function FormulairesAdminPage() {
  const { t, i18n } = useTranslation()
  const qc = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'' | FormType>('')
  const [status, setStatus] = useState<'' | FormStatus>('')
  const [selected, setSelected] = useState<FormSubmission | null>(null)

  const typeLabel = (value: FormType) => t(`forms.${value}`)
  const statusLabel = (value: FormStatus) =>
    value === 'new' ? t('forms.label_new') : value === 'archived' ? t('forms.label_archived') : t('forms.label_read')

  const previewOf = (row: FormSubmission) => {
    const p = row.payload || {}
    if (row.type === 'adhesion') return p.org || row.subject || row.email
    if (row.type === 'newsletter') return t('forms.newsletter_signup')
    return p.subject || row.subject || (p.message ? String(p.message).slice(0, 80) : row.email)
  }

  const { data, isLoading } = useQuery({
    queryKey: ['form-submissions', page, search, type, status],
    queryFn: () =>
      api
        .get('/admin/form-submissions', {
          params: { page, search, type: type || undefined, status: status || undefined, per_page: 12 },
        })
        .then((r) => r.data),
  })

  const rows: FormSubmission[] = data?.data ?? []
  const counts = data?.counts ?? { all: 0, contact: 0, newsletter: 0, adhesion: 0, new: 0 }

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['form-submissions'] })
    qc.invalidateQueries({ queryKey: ['form-submissions-unread'] })
  }

  const openM = useMutation({
    mutationFn: (id: number) => api.get(`/admin/form-submissions/${id}`).then((r) => r.data as FormSubmission),
    onSuccess: (row) => {
      setSelected(row)
      invalidate()
    },
  })

  const statusM = useMutation({
    mutationFn: ({ id, status: next }: { id: number; status: FormStatus }) =>
      api.patch(`/admin/form-submissions/${id}`, { status: next }),
    onSuccess: () => {
      invalidate()
      toast.success(t('forms.toast_status'))
    },
  })

  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/form-submissions/${id}`),
    onSuccess: () => {
      setSelected(null)
      invalidate()
      toast.success(t('forms.toast_deleted'))
    },
  })

  const markAllM = useMutation({
    mutationFn: () => api.post('/admin/form-submissions/mark-all-read'),
    onSuccess: () => {
      invalidate()
      toast.success(t('forms.toast_mark_all'))
    },
  })

  const tabs: { id: '' | FormType; label: string; count: number }[] = [
    { id: '', label: t('forms.all'), count: counts.all },
    { id: 'contact', label: t('forms.contact'), count: counts.contact },
    { id: 'adhesion', label: t('forms.adhesion'), count: counts.adhesion },
    { id: 'newsletter', label: t('forms.newsletter'), count: counts.newsletter },
  ]

  const columns = [
    {
      key: 'type',
      header: t('forms.type'),
      render: (row: FormSubmission) => (
        <Badge variant={row.type === 'contact' ? 'info' : row.type === 'adhesion' ? 'gold' : 'success'} size="xs">
          {typeLabel(row.type)}
        </Badge>
      ),
    },
    {
      key: 'from',
      header: t('forms.sender'),
      render: (row: FormSubmission) => (
        <div>
          <p className="gc-user-cell-name">{row.name || row.email}</p>
          {row.name ? <p className="gc-user-cell-email">{row.email}</p> : null}
        </div>
      ),
    },
    {
      key: 'preview',
      header: t('forms.subject'),
      render: (row: FormSubmission) => (
        <span className={row.status === 'new' ? 'forms-preview forms-preview--new' : 'forms-preview'}>
          {previewOf(row)}
        </span>
      ),
    },
    {
      key: 'date',
      header: t('forms.date'),
      render: (row: FormSubmission) => <span className="forms-date">{formatDate(row.created_at, i18n.language)}</span>,
    },
    {
      key: 'status',
      header: t('forms.status'),
      render: (row: FormSubmission) => (
        <Badge
          variant={row.status === 'new' ? 'warning' : row.status === 'archived' ? 'neutral' : 'success'}
          dot={row.status === 'new'}
          size="xs"
        >
          {statusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right' as const,
      render: (row: FormSubmission) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="xs" onClick={() => openM.mutate(row.id)}>
            {t('forms.view')}
          </Button>
          <Button
            variant="danger"
            size="xs"
            iconOnly
            icon={<Trash2 size={12} />}
            onClick={() => {
              if (confirm(t('forms.delete_confirm'))) deleteM.mutate(row.id)
            }}
          />
        </div>
      ),
    },
  ]

  const payload = selected?.payload || {}
  const newLabel = counts.new > 1
    ? t('forms.new_many', { count: counts.new })
    : t('forms.new_one', { count: counts.new })
  const totalLabel = counts.all !== 1
    ? t('forms.total_many', { count: counts.all })
    : t('forms.total_one', { count: counts.all })

  return (
    <>
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <div className="gc-page-header-icon"><Inbox size={18} /></div>
          <div>
            <p className="gc-page-header-title">{t('forms.title')}</p>
            <p className="gc-page-header-sub">
              {counts.new > 0 ? `${newLabel} · ` : ''}
              {totalLabel}
            </p>
          </div>
        </div>
        {counts.new > 0 && (
          <Button variant="secondary" icon={<CheckCheck size={14} />} onClick={() => markAllM.mutate()} loading={markAllM.isPending}>
            {t('forms.mark_all_read')}
          </Button>
        )}
      </div>

      <div className="forms-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id || 'all'}
            type="button"
            className={`forms-tab${type === tab.id ? ' active' : ''}`}
            onClick={() => { setType(tab.id); setPage(1) }}
          >
            {tab.label}
            <span className="forms-tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="gc-search-wrap forms-filters">
        <Input
          placeholder={t('forms.search')}
          icon={<Search size={14} />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
        <select
          className="gc-select forms-status-filter"
          value={status}
          onChange={(e) => { setStatus(e.target.value as '' | FormStatus); setPage(1) }}
        >
          <option value="">{t('forms.all_statuses')}</option>
          <option value="new">{t('forms.status_new')}</option>
          <option value="read">{t('forms.status_read')}</option>
          <option value="archived">{t('forms.status_archived')}</option>
        </select>
      </div>

      <Table
        columns={columns}
        data={rows}
        loading={isLoading}
        rowKey={(row) => row.id}
        emptyText={t('forms.empty')}
        onRowClick={(row) => openM.mutate(row.id)}
      />

      {data?.last_page > 1 && (
        <Pagination current_page={page} last_page={data.last_page} onPageChange={setPage} />
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected ? typeLabel(selected.type) : ''}
        subtitle={selected ? formatDate(selected.created_at, i18n.language) : undefined}
        size="lg"
        footer={selected ? (
          <>
            {selected.status !== 'archived' && (
              <Button
                variant="secondary"
                icon={<Archive size={14} />}
                onClick={() => { statusM.mutate({ id: selected.id, status: 'archived' }); setSelected(null) }}
              >
                {t('forms.archive')}
              </Button>
            )}
            <Button
              variant="danger"
              icon={<Trash2 size={14} />}
              onClick={() => { if (confirm(t('forms.delete_confirm'))) deleteM.mutate(selected.id) }}
            >
              {t('delete')}
            </Button>
          </>
        ) : undefined}
      >
        {selected && (
          <div className="forms-detail">
            <div className="forms-detail-meta">
              <Badge variant={selected.status === 'new' ? 'warning' : 'success'} dot={selected.status === 'new'} size="xs">
                {statusLabel(selected.status)}
              </Badge>
              {selected.mailed_at ? (
                <span className="forms-mail-ok"><Mail size={12} /> {t('forms.mailed')}</span>
              ) : (
                <span className="forms-mail-warn"><MailOpen size={12} /> {t('forms.not_mailed')}{selected.mail_error ? ` (${selected.mail_error})` : ''}</span>
              )}
            </div>
            <dl className="forms-dl">
              {Object.entries(payload).map(([key, value]) => (
                <div key={key} className="forms-dl-row">
                  <dt>{FIELD_KEY[key] ? t(FIELD_KEY[key]) : key}</dt>
                  <dd>{String(value || '—')}</dd>
                </div>
              ))}
              {!Object.keys(payload).length && (
                <div className="forms-dl-row">
                  <dt>{t('forms.field_email')}</dt>
                  <dd>{selected.email}</dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </Modal>
    </>
  )
}
