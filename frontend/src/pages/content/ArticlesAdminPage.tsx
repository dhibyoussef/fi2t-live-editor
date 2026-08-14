import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Languages, Newspaper, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/client'
import { Button } from '../../components/ui/Button'
import { notifyContentSaved } from '../../lib/contentSync'
import ArticlesPageEditor from './ArticlesPageEditor'

type LocaleCode = 'fr' | 'en' | 'ar'

interface PendingChange {
  page: string
  section: string
  key: string
  locale: string
  type: 'json'
  value: string
  label?: string
}

export default function ArticlesAdminPage() {
  const qc = useQueryClient()
  const [changes, setChanges] = useState<Record<string, PendingChange>>({})
  const [createNonce, setCreateNonce] = useState(0)

  const { data: articlesMatrix } = useQuery({
    queryKey: ['content-matrix', 'actualites'],
    queryFn: () => api.get('/admin/content/matrix', { params: { page: 'actualites' } }).then(r => r.data),
    staleTime: 0,
  })

  const pendingByLocale = useMemo(() => {
    const out: Partial<Record<LocaleCode, string>> = {}
    for (const loc of ['fr', 'en', 'ar'] as const) {
      const id = `grid.items.${loc}`
      if (changes[id]) out[loc] = changes[id].value
    }
    return out
  }, [changes])

  const changeCount = Object.keys(changes).length
  const [sourceLocale, setSourceLocale] = useState<LocaleCode>('fr')

  const saveM = useMutation({
    mutationFn: () => api.post('/admin/content/bulk', {
      blocks: Object.values(changes),
      source_locale: sourceLocale,
      translate: true,
    }, { timeout: 120000 }),
    onSuccess: () => {
      setChanges({})
      qc.invalidateQueries({ queryKey: ['content-matrix', 'actualites'] })
      notifyContentSaved('actualites', 'dashboard')
      toast.success('Articles enregistrés (FR / EN / AR)')
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  })

  const count = (() => {
    const pending = changes['grid.items.fr']?.value
    const raw = pending
      ?? articlesMatrix?.sections
        ?.find((s: { name: string }) => s.name === 'grid')
        ?.blocks?.find((b: { key: string }) => b.key === 'items')
        ?.locales?.fr?.value
    if (!raw) return 0
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed.length : 0
    } catch {
      return 0
    }
  })()

  return (
    <div className="articles-admin">
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <div className="gc-page-header-icon"><Newspaper size={18} /></div>
          <div>
            <p className="gc-page-header-title">Articles</p>
            <p className="gc-page-header-sub">
              {count} article{count !== 1 ? 's' : ''} — photo et URL identiques en FR / EN / AR.
              Traduisez seulement les textes. Enregistrer applique les 3 langues.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            variant="secondary"
            icon={<Languages size={13} />}
            onClick={() => {
              api.post('/admin/content/sync-locales', {
                page: 'actualites',
                translate: true,
                deep: true,
                source_locale: sourceLocale,
              }, { timeout: 180000 })
                .then(() => {
                  qc.invalidateQueries({ queryKey: ['content-matrix', 'actualites'] })
                  toast.success('Articles alignés et traduits (FR / EN / AR)')
                })
                .catch(() => toast.error('Impossible d’aligner les langues'))
            }}
          >
            Aligner + traduire
          </Button>
          {changeCount > 0 && (
            <Button variant="secondary" icon={<X size={13} />} onClick={() => setChanges({})}>
              Annuler ({changeCount})
            </Button>
          )}
          <Button
            icon={<Save size={14} />}
            loading={saveM.isPending}
            disabled={changeCount === 0}
            onClick={() => saveM.mutate()}
          >
            Enregistrer {changeCount > 0 ? `(${changeCount})` : ''}
          </Button>
          <Button variant="secondary" onClick={() => setCreateNonce(n => n + 1)}>
            Nouvel article
          </Button>
        </div>
      </div>

      {changeCount > 0 && (
        <div className="tr-changes-bar">
          <Save size={13} />
          {changeCount} modification{changeCount !== 1 ? 's' : ''} non sauvegardée{changeCount !== 1 ? 's' : ''}.
        </div>
      )}

      <ArticlesPageEditor
        preferredLocale="fr"
        pendingByLocale={pendingByLocale}
        createNonce={createNonce}
        onSourceLocale={setSourceLocale}
        onItemsChange={(locale, json) => {
          setChanges(prev => ({
            ...prev,
            [`grid.items.${locale}`]: {
              page: 'actualites',
              section: 'grid',
              key: 'items',
              locale,
              type: 'json',
              value: json,
              label: 'Articles',
            },
          }))
        }}
        onPersist={async (blocks, locale) => {
          await api.post('/admin/content/bulk', {
            blocks,
            source_locale: locale,
            translate: true,
          }, { timeout: 120000 })
          setChanges(prev => {
            const next = { ...prev }
            for (const b of blocks) delete next[`grid.items.${b.locale}`]
            return next
          })
          qc.invalidateQueries({ queryKey: ['content-matrix', 'actualites'] })
          notifyContentSaved('actualites', 'dashboard')
        }}
      />
    </div>
  )
}
