import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Building2, Phone, Share2, FileText, Save, Mail } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { ImageUploader } from '../../components/ui/ImageUploader'
import api from '../../api/client'
import { notifyContentSaved } from '../../lib/contentSync'
import toast from 'react-hot-toast'

const PAGE = 'global'
const LOCALES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
] as const

type Tab = 'identity' | 'contact' | 'social' | 'footer' | 'forms'

interface BlockRow {
  key: string
  type: 'text' | 'image' | 'json'
  locales: Record<string, { value: string | null }>
}

interface SectionGroup {
  name: string
  blocks: BlockRow[]
}

type Values = Record<string, Record<string, string>>

const FIELD_DEFS: Record<Tab, { section: string; key: string; label: string; type: 'text' | 'image' | 'textarea'; locales: string[]; placeholder?: string; help?: string }[]> = {
  identity: [
    { section: 'settings', key: 'logo', label: 'Logo du site', type: 'image', locales: ['_all'] },
    { section: 'settings', key: 'hotel_name', label: 'Nom du site', type: 'text', locales: ['fr', 'en', 'ar'], placeholder: 'FI2T' },
    { section: 'settings', key: 'tagline', label: 'Sous-titre / baseline', type: 'text', locales: ['fr', 'en', 'ar'], placeholder: 'Fédération Interprofessionnelle du Tourisme Tunisien' },
  ],
  contact: [
    { section: 'settings', key: 'address', label: 'Adresse (réglages)', type: 'textarea', locales: ['fr', 'en', 'ar'], placeholder: 'Résidence MERIEM - Appt N°2 - Les Berges du Lac 1, 1053 Tunis' },
    { section: 'settings', key: 'phone', label: 'Téléphone principal', type: 'text', locales: ['_all'], placeholder: '+216 29 710 507' },
    { section: 'settings', key: 'phone_secondary', label: 'Téléphone secondaire', type: 'text', locales: ['_all'], placeholder: '+216 24 940 022' },
    { section: 'settings', key: 'email', label: 'E-mail principal', type: 'text', locales: ['_all'], placeholder: 'contact.fi2t@fit-tunisie.org' },
  ],
  social: [
    { section: 'settings', key: 'social_facebook', label: 'Facebook', type: 'text', locales: ['_all'], placeholder: 'https://facebook.com/...' },
    { section: 'settings', key: 'social_instagram', label: 'Instagram', type: 'text', locales: ['_all'], placeholder: 'https://instagram.com/...' },
    { section: 'settings', key: 'social_linkedin', label: 'LinkedIn', type: 'text', locales: ['_all'], placeholder: 'https://linkedin.com/...' },
    { section: 'settings', key: 'social_x', label: 'X (Twitter)', type: 'text', locales: ['_all'], placeholder: 'https://x.com/...' },
  ],
  footer: [
    { section: 'footer', key: 'about', label: 'Description (colonne 1)', type: 'textarea', locales: ['fr', 'en', 'ar'] },
    { section: 'footer', key: 'address', label: 'Adresse (pied de page)', type: 'textarea', locales: ['fr', 'en', 'ar'] },
    { section: 'footer', key: 'phone_1', label: 'Téléphone 1', type: 'text', locales: ['fr', 'en', 'ar'], placeholder: '+216 29 710 507' },
    { section: 'footer', key: 'phone_2', label: 'Téléphone 2', type: 'text', locales: ['fr', 'en', 'ar'], placeholder: '+216 24 940 022' },
    { section: 'footer', key: 'email', label: 'E-mail (pied de page)', type: 'text', locales: ['fr', 'en', 'ar'], placeholder: 'contact.fi2t@fit-tunisie.org' },
    { section: 'footer', key: 'newsletter', label: 'Texte newsletter', type: 'text', locales: ['fr', 'en', 'ar'], placeholder: 'Restez informé de nos dernières initiatives.' },
  ],
  forms: [
    {
      section: 'forms',
      key: 'notify_contact',
      label: 'Contact — e-mail de réception',
      type: 'text',
      locales: ['_all'],
      placeholder: 'contact.fi2t@fit-tunisie.org',
      help: 'Boîte officielle Contact. Pas une adresse personnelle.',
    },
    {
      section: 'forms',
      key: 'notify_newsletter',
      label: 'Newsletter — e-mail de réception',
      type: 'text',
      locales: ['_all'],
      placeholder: 'newsletter.fi2t@fit-tunisie.org',
      help: 'Boîte officielle Newsletter (pied de page).',
    },
    {
      section: 'forms',
      key: 'notify_adhesion',
      label: 'Demande d’adhésion — e-mail de réception',
      type: 'text',
      locales: ['_all'],
      placeholder: 'adhesion.fi2t@fit-tunisie.org',
      help: 'Boîte officielle Fiche adhésion.',
    },
  ],
}

const TABS: { id: Tab; label: string; icon: typeof Settings }[] = [
  { id: 'identity', label: 'Identité', icon: Building2 },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'forms', label: 'Formulaires', icon: Mail },
  { id: 'social', label: 'Réseaux & apps', icon: Share2 },
  { id: 'footer', label: 'Pied de page', icon: FileText },
]

function blockValue(sections: SectionGroup[], section: string, key: string, locale: string): string {
  const sec = sections.find(s => s.name === section)
  const block = sec?.blocks.find(b => b.key === key)
  return block?.locales[locale]?.value ?? ''
}

function valuesFromSections(sections: SectionGroup[]): Values {
  const out: Values = {}
  for (const tab of Object.values(FIELD_DEFS)) {
    for (const field of tab) {
      out[field.key] = {}
      for (const loc of field.locales) {
        let value = blockValue(sections, field.section, field.key, loc)
        // Legacy key used before Global settings rename
        if (!value && field.key === 'tagline') {
          value = blockValue(sections, 'settings', 'hotel_tagline', loc)
        }
        out[field.key][loc] = value
      }
    }
  }
  return out
}

function valuesToBlocks(values: Values): { page: string; section: string; key: string; locale: string; type: string; value: string }[] {
  const blocks: { page: string; section: string; key: string; locale: string; type: string; value: string }[] = []
  for (const tab of Object.values(FIELD_DEFS)) {
    for (const field of tab) {
      for (const loc of field.locales) {
        blocks.push({
          page: PAGE,
          section: field.section,
          key: field.key,
          locale: loc,
          type: field.type === 'image' ? 'image' : 'text',
          value: values[field.key]?.[loc] ?? '',
        })
      }
    }
  }
  return blocks
}

export default function SiteSettingsEditor({ initialTab = 'identity' }: { initialTab?: Tab }) {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>(initialTab)
  const [values, setValues] = useState<Values>({})
  const [dirty, setDirty] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['content-matrix', PAGE],
    queryFn: () => api.get('/admin/content/matrix', { params: { page: PAGE } }).then(r => r.data),
  })

  const sections: SectionGroup[] = data?.sections ?? []

  useEffect(() => {
    if (sections.length && !dirty) {
      setValues(valuesFromSections(sections))
    }
  }, [sections, dirty])

  const setVal = (key: string, locale: string, value: string) => {
    setDirty(true)
    setValues(prev => ({
      ...prev,
      [key]: { ...prev[key], [locale]: value },
    }))
  }

  const saveM = useMutation({
    mutationFn: () => api.post('/admin/content/bulk', { blocks: valuesToBlocks(values) }),
    onSuccess: () => {
      setDirty(false)
      qc.invalidateQueries({ queryKey: ['content-matrix', PAGE] })
      notifyContentSaved(PAGE, 'dashboard')
      toast.success('Paramètres du site enregistrés')
    },
    onError: () => toast.error('Erreur lors de la sauvegarde'),
  })

  const fields = FIELD_DEFS[tab]

  return (
    <div className="site-settings-editor">
      <div className="site-settings-editor-head">
        <div className="site-settings-editor-title">
          <Settings size={20} />
          <div>
            <h3>Paramètres du site</h3>
            <p>Logo, coordonnées, formulaires, réseaux sociaux et textes du site</p>
          </div>
        </div>
        <Button icon={<Save size={14} />} loading={saveM.isPending} disabled={!dirty} onClick={() => saveM.mutate()}>
          Enregistrer
        </Button>
      </div>

      <div className="site-settings-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            className={`site-settings-tab${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="site-settings-loading"><div className="gc-spinner" /></div>
      ) : (
        <div className="site-settings-panel">
          {tab === 'forms' && (
            <div className="site-settings-field" style={{ marginBottom: '1.25rem' }}>
              <p className="wc-page-settings-help" style={{ margin: 0 }}>
                L’<strong>expéditeur</strong> affiché est la boîte officielle (Contact / Adhésion / Newsletter).
                Le <strong>destinataire</strong> de test est votre inbox perso. Chaque envoi est aussi enregistré dans Administration → Formulaires.
                Envoi via Brevo (pas de SMTP installé sur le serveur).
              </p>
            </div>
          )}
          {fields.map(field => (
            <div key={field.key} className="site-settings-field">
              <label className="gc-label">{field.label}</label>
              {'help' in field && field.help ? (
                <p className="wc-page-settings-help" style={{ marginTop: 0 }}>{field.help}</p>
              ) : null}

              {field.type === 'image' ? (
                <ImageUploader
                  value={values[field.key]?.['_all'] ?? ''}
                  onChange={url => setVal(field.key, '_all', url)}
                  hint={
                    field.key === 'logo' && field.section === 'footer'
                      ? 'Logo affiché dans la 1ère colonne du pied de page — SVG recommandé (ex. GCH.svg)'
                      : 'Logo affiché dans le header — SVG, PNG recommandé'
                  }
                />
              ) : field.locales.length === 1 ? (
                field.type === 'textarea' ? (
                  <textarea
                    className="gc-textarea"
                    rows={3}
                    value={values[field.key]?.[field.locales[0]] ?? ''}
                    placeholder={field.placeholder}
                    onChange={e => setVal(field.key, field.locales[0], e.target.value)}
                  />
                ) : (
                  <Input
                    value={values[field.key]?.[field.locales[0]] ?? ''}
                    placeholder={field.placeholder}
                    onChange={e => setVal(field.key, field.locales[0], e.target.value)}
                  />
                )
              ) : (
                <div className="site-settings-locales">
                  {LOCALES.filter(l => field.locales.includes(l.code)).map(loc => (
                    <div key={loc.code}>
                      <span className="site-settings-locale-tag">{loc.label}</span>
                      {field.type === 'textarea' ? (
                        <textarea
                          className="gc-textarea"
                          rows={3}
                          value={values[field.key]?.[loc.code] ?? ''}
                          placeholder={field.placeholder}
                          onChange={e => setVal(field.key, loc.code, e.target.value)}
                        />
                      ) : (
                        <Input
                          value={values[field.key]?.[loc.code] ?? ''}
                          placeholder={field.placeholder}
                          onChange={e => setVal(field.key, loc.code, e.target.value)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
