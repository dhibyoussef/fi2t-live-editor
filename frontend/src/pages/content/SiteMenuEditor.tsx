import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus, Edit, Trash2, ChevronDown, ChevronUp, Menu, Link2, ExternalLink,
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import api from '../../api/client'
import toast from 'react-hot-toast'

interface NavItem {
  id: number
  parent_id?: number | null
  label_fr: string
  label_en?: string | null
  label_ar?: string | null
  url: string
  sort_order: number
  is_active: boolean
  open_in_new_tab: boolean
  children?: NavItem[]
}

const LOCALES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
] as const

function emptyForm(parentId: number | null = null) {
  return {
    parent_id: parentId,
    label_fr: '',
    label_en: '',
    label_ar: '',
    url: '/',
    is_active: true,
    open_in_new_tab: false,
  }
}

export default function SiteMenuEditor() {
  const qc = useQueryClient()
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({})
  const [modal, setModal] = useState<'section' | 'child' | 'edit' | null>(null)
  const [selected, setSelected] = useState<NavItem | null>(null)
  const [_parentId, setParentId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm())
  const f = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }))

  const { data: sections = [], isLoading } = useQuery<NavItem[]>({
    queryKey: ['site-nav'],
    queryFn: () => api.get('/admin/site-nav').then(r => r.data),
  })

  const invalidate = () => qc.invalidateQueries({ queryKey: ['site-nav'] })

  const createM = useMutation({
    mutationFn: (d: any) => api.post('/admin/site-nav', d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Élément ajouté') },
  })
  const updateM = useMutation({
    mutationFn: ({ id, ...d }: any) => api.put(`/admin/site-nav/${id}`, d),
    onSuccess: () => { invalidate(); setModal(null); toast.success('Mis à jour') },
  })
  const deleteM = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/site-nav/${id}`),
    onSuccess: () => { invalidate(); toast.success('Supprimé') },
  })

  const reorder = async (items: { id: number; sort_order: number; parent_id: number | null }[]) => {
    await api.post('/admin/site-nav/reorder', { items })
    invalidate()
  }

  const moveSection = (index: number, dir: -1 | 1) => {
    const next = [...sections]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    reorder(next.map((s, i) => ({ id: s.id, sort_order: i, parent_id: null })))
  }

  const moveChild = (parent: NavItem, childIndex: number, dir: -1 | 1) => {
    const kids = [...(parent.children ?? [])]
    const target = childIndex + dir
    if (target < 0 || target >= kids.length) return
    ;[kids[childIndex], kids[target]] = [kids[target], kids[childIndex]]
    reorder(kids.map((c, i) => ({ id: c.id, sort_order: i, parent_id: parent.id })))
  }

  const openCreateSection = () => {
    setForm(emptyForm(null))
    setSelected(null)
    setParentId(null)
    setModal('section')
  }

  const openCreateChild = (sectionId: number) => {
    setForm(emptyForm(sectionId))
    setSelected(null)
    setParentId(sectionId)
    setOpenSections(p => ({ ...p, [sectionId]: true }))
    setModal('child')
  }

  const openEdit = (item: NavItem) => {
    setSelected(item)
    setForm({
      parent_id: item.parent_id ?? null,
      label_fr: item.label_fr,
      label_en: item.label_en ?? '',
      label_ar: item.label_ar ?? '',
      url: item.url,
      is_active: item.is_active !== false,
      open_in_new_tab: !!item.open_in_new_tab,
    })
    setModal('edit')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      parent_id: form.parent_id || null,
      label_en: form.label_en || null,
      label_ar: form.label_ar || null,
    }
    if (modal === 'edit' && selected) {
      updateM.mutate({ id: selected.id, ...payload })
    } else {
      createM.mutate(payload)
    }
  }

  const toggleSection = (id: number) => {
    setOpenSections(p => ({ ...p, [id]: !p[id] }))
  }

  return (
    <div className="site-menu-editor">
      <div className="site-menu-editor-head">
        <div className="site-menu-editor-title">
          <Menu size={18} />
          <div>
            <h3>Menu du site</h3>
            <p>Sections et sous-liens affichés dans la navigation du site public</p>
          </div>
        </div>
        <Button onClick={openCreateSection}><Plus size={14} /> Nouvelle section</Button>
      </div>

      {isLoading ? (
        <div className="site-menu-loading"><div className="gc-spinner" /></div>
      ) : sections.length === 0 ? (
        <div className="site-menu-empty">
          <p>Aucune entrée de menu.</p>
          <Button onClick={openCreateSection}><Plus size={14} /> Créer la première section</Button>
        </div>
      ) : (
        <div className="site-menu-sections">
          {sections.map((section, si) => {
            const isOpen = !!openSections[section.id]
            const children = section.children ?? []
            return (
              <div key={section.id} className={`site-menu-section${!section.is_active ? ' inactive' : ''}`}>
                <div className="site-menu-section-row">
                  <button type="button" className="site-menu-section-toggle" onClick={() => toggleSection(section.id)}>
                    <ChevronDown size={16} className={isOpen ? 'open' : ''} />
                  </button>
                  <div className="site-menu-section-info">
                    <strong>{section.label_fr}</strong>
                    <span className="site-menu-url"><Link2 size={11} />{section.url}</span>
                  </div>
                  <div className="site-menu-section-actions">
                    <button type="button" title="Monter" onClick={() => moveSection(si, -1)} disabled={si === 0}><ChevronUp size={14} /></button>
                    <button type="button" title="Descendre" onClick={() => moveSection(si, 1)} disabled={si === sections.length - 1}><ChevronDown size={14} /></button>
                    <button type="button" title="Modifier" onClick={() => openEdit(section)}><Edit size={14} /></button>
                    <button type="button" title="Supprimer" onClick={() => { if (confirm('Supprimer cette section et ses sous-liens ?')) deleteM.mutate(section.id) }}><Trash2 size={14} /></button>
                  </div>
                </div>

                {isOpen && (
                  <div className="site-menu-children">
                    {children.map((child, ci) => (
                      <div key={child.id} className={`site-menu-child${!child.is_active ? ' inactive' : ''}`}>
                        <span className="site-menu-child-label">{child.label_fr}</span>
                        <span className="site-menu-url"><Link2 size={11} />{child.url}</span>
                        <div className="site-menu-child-actions">
                          <button type="button" onClick={() => moveChild(section, ci, -1)} disabled={ci === 0}><ChevronUp size={13} /></button>
                          <button type="button" onClick={() => moveChild(section, ci, 1)} disabled={ci === children.length - 1}><ChevronDown size={13} /></button>
                          <button type="button" onClick={() => openEdit(child)}><Edit size={13} /></button>
                          <button type="button" onClick={() => { if (confirm('Supprimer ce sous-lien ?')) deleteM.mutate(child.id) }}><Trash2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                    <button type="button" className="site-menu-add-child" onClick={() => openCreateChild(section.id)}>
                      <Plus size={13} /> Ajouter un sous-lien
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          modal === 'section' ? 'Nouvelle section du menu'
            : modal === 'child' ? 'Nouveau sous-lien'
            : 'Modifier l\'élément du menu'
        }
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>Annuler</Button>
            <Button type="submit" form="site-menu-form" loading={createM.isPending || updateM.isPending}>
              {modal === 'edit' ? 'Enregistrer' : 'Ajouter'}
            </Button>
          </>
        }
      >
        <form id="site-menu-form" className="site-menu-form" onSubmit={handleSubmit}>
          {LOCALES.map(loc => (
            <Input
              key={loc.code}
              label={`Libellé (${loc.label})${loc.code === 'fr' ? ' *' : ''}`}
              required={loc.code === 'fr'}
              value={(form as any)[`label_${loc.code}`] ?? ''}
              onChange={e => f(`label_${loc.code}`, e.target.value)}
              placeholder={loc.code === 'fr' ? 'Hébergement' : ''}
            />
          ))}
          <Input
            label="URL"
            required
            value={form.url}
            onChange={e => f('url', e.target.value)}
            placeholder="/chambres ou https://..."
            icon={<Link2 size={13} />}
          />
          <div className="site-menu-form-checks">
            <label>
              <input type="checkbox" checked={form.is_active} onChange={e => f('is_active', e.target.checked)} />
              Visible dans le menu
            </label>
            <label>
              <input type="checkbox" checked={form.open_in_new_tab} onChange={e => f('open_in_new_tab', e.target.checked)} />
              <ExternalLink size={12} /> Ouvrir dans un nouvel onglet
            </label>
          </div>
        </form>
      </Modal>
    </div>
  )
}
