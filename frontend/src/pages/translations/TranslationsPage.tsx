import { useState, useMemo, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Languages, Plus, Save, Trash2, Search, CheckCircle2,
  AlertCircle, Globe, X,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import { applyLocaleOverrides } from '../../i18n/syncFromDB'
import toast from 'react-hot-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LocaleRow {
  code: string
  name: string
  flag: string | null
  direction: 'ltr' | 'rtl'
  is_active: boolean
}

interface TranslationRow {
  id: number
  locale: string
  key: string
  value: string
}

interface ApiResponse {
  locales: LocaleRow[]
  translations: Record<string, Record<string, TranslationRow>>
}

// ─── Key groupings ────────────────────────────────────────────────────────────

const GROUPS: { label: string; prefix: string | null }[] = [
  { label: 'Site FI2T — Navigation', prefix: 'fi2t' },
  { label: 'Navigation admin',       prefix: 'nav' },
  { label: 'Groupes de menu',        prefix: 'navGroups' },
  { label: 'Authentification',       prefix: 'login' },
  { label: 'Tableau de bord',        prefix: 'dashboard' },
  { label: 'Commun',                 prefix: 'common' },
  { label: 'Général',                prefix: null },
]

function groupFor(key: string): string {
  const pfx = key.includes('.') ? key.split('.')[0] : null
  const g = GROUPS.find(g => g.prefix === pfx)
  return g?.label ?? 'Général'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TranslationsPage() {
  const qc = useQueryClient()

  // Current target locale tab
  const [activeLang, setActiveLang]     = useState('en')
  const [search, setSearch]             = useState('')
  // Pending edits: { key → new_value }
  const [changes, setChanges]           = useState<Record<string, string>>({})
  // Add locale modal
  const [addModal, setAddModal]         = useState(false)
  const [newLocale, setNewLocale]       = useState({ code: '', name: '', flag: '', direction: 'ltr', copy_from: 'fr' })
  // Which group is open
  const [openGroups, setOpenGroups]     = useState<Record<string, boolean>>({
    'Site FI2T — Navigation': true,
    'Navigation admin': true,
    'Groupes de menu': true,
    Authentification: true,
    'Tableau de bord': true,
    Commun: true,
    Général: true,
  })

  const searchRef = useRef<HTMLInputElement>(null)

  // ── Data ────────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ['translations'],
    queryFn: () => api.get('/admin/translations').then(r => r.data),
  })

  const locales       = data?.locales ?? []
  const allTranslations = data?.translations ?? {}

  // All unique keys (from FR as reference)
  const allKeys = useMemo(() => {
    const frMap = allTranslations['fr'] ?? {}
    return Object.keys(frMap).sort()
  }, [allTranslations])

  // FR reference map (always readonly)
  const frMap = useMemo(() => {
    const m: Record<string, string> = {}
    const rows = allTranslations['fr'] ?? {}
    for (const [key, row] of Object.entries(rows)) m[key] = row.value
    return m
  }, [allTranslations])

  // Target locale map (current saved values)
  const targetMap = useMemo(() => {
    const m: Record<string, string> = {}
    const rows = allTranslations[activeLang] ?? {}
    for (const [key, row] of Object.entries(rows)) m[key] = row.value
    return m
  }, [allTranslations, activeLang])

  // Effective value = pending change OR saved value
  const effective = (key: string) =>
    key in changes ? changes[key] : (targetMap[key] ?? '')

  // Keys matching search
  const visibleKeys = useMemo(() => {
    if (!search.trim()) return allKeys
    const q = search.toLowerCase()
    return allKeys.filter(k =>
      k.toLowerCase().includes(q) ||
      (frMap[k] ?? '').toLowerCase().includes(q) ||
      effective(k).toLowerCase().includes(q)
    )
  }, [allKeys, search, frMap, changes, activeLang])

  // Stats per locale
  const stats = useMemo(() => {
    const out: Record<string, { total: number; done: number }> = {}
    for (const loc of locales) {
      const rows = allTranslations[loc.code] ?? {}
      const done = Object.values(rows).filter(r => r.value?.trim()).length
      out[loc.code] = { total: allKeys.length, done }
    }
    return out
  }, [locales, allTranslations, allKeys])

  // ── Mutations ────────────────────────────────────────────────────────────────

  const saveM = useMutation({
    mutationFn: () => {
      const payload = Object.entries(changes).map(([key, value]) => ({
        locale: activeLang, key, value,
      }))
      return api.post('/admin/translations/bulk', { changes: payload })
    },
    onSuccess: () => {
      // Apply immediately to i18next for live effect
      const merged = { ...targetMap, ...changes }
      applyLocaleOverrides(activeLang, merged)
      setChanges({})
      qc.invalidateQueries({ queryKey: ['translations'] })
      toast.success(`${Object.keys(changes).length} traduction(s) enregistrée(s)`)
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  })

  const addLocaleM = useMutation({
    mutationFn: () => api.post('/admin/translations/locales', newLocale),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['translations'] })
      setAddModal(false)
      setNewLocale({ code: '', name: '', flag: '', direction: 'ltr', copy_from: 'fr' })
      toast.success('Langue ajoutée')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Erreur'),
  })

  const deleteLocaleM = useMutation({
    mutationFn: (code: string) => api.delete(`/admin/translations/locales/${code}`),
    onSuccess: (_, code) => {
      if (activeLang === code) setActiveLang('en')
      qc.invalidateQueries({ queryKey: ['translations'] })
      toast.success('Langue supprimée')
    },
    onError: (e: any) => toast.error(e.response?.data?.message ?? 'Impossible de supprimer cette langue'),
  })

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const changeCount  = Object.keys(changes).length
  const isFR        = activeLang === 'fr'

  const setChange = (key: string, val: string) => {
    setChanges(p => {
      const next = { ...p, [key]: val }
      // Remove from changes if value matches saved — no real change
      if (val === (targetMap[key] ?? '')) delete next[key]
      return next
    })
  }

  const discardChanges = () => setChanges({})

  const toggleGroup = (g: string) =>
    setOpenGroups(p => ({ ...p, [g]: !p[g] }))

  const groupedKeys = useMemo(() => {
    const out: Record<string, string[]> = {}
    for (const g of GROUPS) out[g.label] = []
    for (const key of visibleKeys) {
      const g = groupFor(key)
      if (!out[g]) out[g] = []
      out[g].push(key)
    }
    return out
  }, [visibleKeys])

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Header */}
      <div className="gc-page-header">
        <div className="gc-page-header-left">
          <div className="gc-page-header-icon"><Languages size={18} /></div>
          <div>
            <p className="gc-page-header-title">Traductions</p>
            <p className="gc-page-header-sub">
              {locales.length} langue{locales.length !== 1 ? 's' : ''} — {allKeys.length} clés
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {changeCount > 0 && (
            <Button variant="secondary" icon={<X size={13} />} onClick={discardChanges}>
              Annuler ({changeCount})
            </Button>
          )}
          <Button
            icon={<Save size={14} />}
            loading={saveM.isPending}
            disabled={changeCount === 0 || isFR}
            onClick={() => saveM.mutate()}
          >
            Enregistrer {changeCount > 0 ? `(${changeCount})` : ''}
          </Button>
          <Button variant="secondary" icon={<Plus size={14} />} onClick={() => setAddModal(true)}>
            Ajouter une langue
          </Button>
        </div>
      </div>

      {/* Language tabs */}
      <div className="tr-lang-tabs">
        {locales.map(loc => {
          const s       = stats[loc.code] ?? { total: 0, done: 0 }
          const pct     = s.total ? Math.round((s.done / s.total) * 100) : 0
          const missing = s.total - s.done
          const isBase  = loc.code === 'fr'

          return (
            <div
              key={loc.code}
              className={`tr-lang-tab${activeLang === loc.code ? ' active' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => { setActiveLang(loc.code); setChanges({}) }}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setActiveLang(loc.code)
                  setChanges({})
                }
              }}
            >
              <span className="tr-lang-flag">{loc.flag ?? '🌐'}</span>
              <span className="tr-lang-name">{loc.name}</span>
              {isBase ? (
                <span className="tr-lang-badge base">Référence</span>
              ) : pct === 100 ? (
                <span className="tr-lang-badge done"><CheckCircle2 size={10} /> 100%</span>
              ) : (
                <span className="tr-lang-badge missing">
                  <AlertCircle size={10} /> {missing} manquant{missing !== 1 ? 's' : ''}
                </span>
              )}
              {!isBase && (
                <button
                  type="button"
                  className="tr-lang-delete"
                  title="Supprimer cette langue"
                  onClick={e => {
                    e.stopPropagation()
                    if (confirm(`Supprimer ${loc.name} et toutes ses traductions ?`)) {
                      deleteLocaleM.mutate(loc.code)
                    }
                  }}
                >
                  <X size={10} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Info banner for FR */}
      {isFR && (
        <div className="carousel-info-bar">
          <span className="carousel-info-dot" />
          Le français est la langue de référence. Pour modifier ses valeurs, éditez directement
          les fichiers <code>fr.ts</code> puis relancez le seeder.
        </div>
      )}

      {/* Unsaved changes notice */}
      {changeCount > 0 && !isFR && (
        <div className="tr-changes-bar">
          <Save size={13} />
          {changeCount} modification{changeCount !== 1 ? 's' : ''} non sauvegardée{changeCount !== 1 ? 's' : ''}.
          Cliquez sur <strong>Enregistrer</strong> pour appliquer.
        </div>
      )}

      {/* Search + progress */}
      <div className="tr-toolbar">
        <div style={{ flex: 1, maxWidth: 360 }}>
          <Input
            ref={searchRef}
            placeholder="Rechercher une clé ou une valeur…"
            icon={<Search size={13} />}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {!isFR && (
          <div className="tr-progress-wrap">
            {(() => {
              const s   = stats[activeLang] ?? { total: 0, done: 0 }
              const pct = s.total ? Math.round((s.done / s.total) * 100) : 0
              return (
                <>
                  <span className="tr-progress-label">{s.done}/{s.total} traduits</span>
                  <div className="tr-progress-bar">
                    <div className="tr-progress-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tr-progress-pct">{pct}%</span>
                </>
              )
            })()}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div className="gc-spinner" />
        </div>
      )}

      {/* Translation table — grouped */}
      {!isLoading && (
        <div className="tr-table-wrap">
          {GROUPS.map(group => {
            const keys = groupedKeys[group.label] ?? []
            if (keys.length === 0) return null
            const isOpen = openGroups[group.label] !== false

            return (
              <div key={group.label} className="tr-group">
                {/* Group header */}
                <button
                  className="tr-group-header"
                  onClick={() => toggleGroup(group.label)}
                >
                  <span className="tr-group-chevron">{isOpen ? '▾' : '▸'}</span>
                  <span className="tr-group-name">{group.label}</span>
                  <span className="tr-group-count">{keys.length} clés</span>
                </button>

                {isOpen && (
                  <table className="tr-table">
                    <thead>
                      <tr>
                        <th className="tr-th-key">Clé</th>
                        <th className="tr-th-ref">
                          🇫🇷 Référence (FR)
                        </th>
                        {!isFR && (
                          <th className="tr-th-edit">
                            {locales.find(l => l.code === activeLang)?.flag ?? '🌐'}{' '}
                            {locales.find(l => l.code === activeLang)?.name}
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {keys.map(key => {
                        const refValue    = frMap[key] ?? ''
                        const savedValue  = targetMap[key] ?? ''
                        const editValue   = effective(key)
                        const isDirty     = key in changes
                        const isEmpty     = !isFR && !editValue.trim()

                        return (
                          <tr
                            key={key}
                            className={`tr-row${isDirty ? ' dirty' : ''}${isEmpty ? ' empty' : ''}`}
                          >
                            {/* Key */}
                            <td className="tr-td-key">
                              <code className="tr-key-code">{key}</code>
                            </td>

                            {/* Reference (FR) — always readonly */}
                            <td className="tr-td-ref">
                              {isFR ? (
                                <span className="tr-ref-value">{refValue}</span>
                              ) : (
                                <span className="tr-ref-value" dir="ltr">{refValue}</span>
                              )}
                            </td>

                            {/* Edit cell (only when not on FR tab) */}
                            {!isFR && (
                              <td className="tr-td-edit">
                                <input
                                  className={`tr-edit-input${isDirty ? ' changed' : ''}${isEmpty ? ' missing' : ''}`}
                                  value={editValue}
                                  placeholder={refValue}
                                  dir={locales.find(l => l.code === activeLang)?.direction ?? 'ltr'}
                                  onChange={e => setChange(key, e.target.value)}
                                />
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add language modal */}
      <Modal
        open={addModal}
        onClose={() => setAddModal(false)}
        title="Ajouter une langue"
        subtitle="Créez une nouvelle langue pour l'interface"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddModal(false)}>Annuler</Button>
            <Button
              icon={<Globe size={13} />}
              loading={addLocaleM.isPending}
              disabled={!newLocale.code.trim() || !newLocale.name.trim()}
              onClick={() => addLocaleM.mutate()}
            >
              Créer la langue
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="gc-grid-2">
            <Input
              label="Code ISO *"
              value={newLocale.code}
              onChange={e => setNewLocale(p => ({ ...p, code: e.target.value.toLowerCase().slice(0, 10) }))}
              placeholder="de, it, es, zh…"
            />
            <Input
              label="Nom de la langue *"
              value={newLocale.name}
              onChange={e => setNewLocale(p => ({ ...p, name: e.target.value }))}
              placeholder="Deutsch, Italiano…"
            />
          </div>
          <div className="gc-grid-2">
            <Input
              label="Emoji drapeau"
              value={newLocale.flag}
              onChange={e => setNewLocale(p => ({ ...p, flag: e.target.value }))}
              placeholder="🇩🇪"
            />
            <div>
              <label className="gc-label">Direction du texte</label>
              <div className="citem-pos-btns" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {(['ltr', 'rtl'] as const).map(d => (
                  <button
                    key={d}
                    type="button"
                    className={`citem-pos-btn${newLocale.direction === d ? ' active' : ''}`}
                    onClick={() => setNewLocale(p => ({ ...p, direction: d }))}
                  >
                    {d === 'ltr' ? '→ LTR' : '← RTL'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="gc-label">Pré-remplir depuis</label>
            <select
              className="gc-field"
              value={newLocale.copy_from}
              onChange={e => setNewLocale(p => ({ ...p, copy_from: e.target.value }))}
            >
              <option value="">— Vide (aucune pré-population) —</option>
              {locales.map(l => (
                <option key={l.code} value={l.code}>{l.flag} {l.name} ({l.code})</option>
              ))}
            </select>
            <p className="gc-field-hint">
              Copie toutes les clés comme placeholders vides à traduire.
            </p>
          </div>
        </div>
      </Modal>
    </>
  )
}
