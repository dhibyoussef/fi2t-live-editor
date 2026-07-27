import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Type, Image as ImageIcon, Layers, LayoutTemplate, Star,
  Utensils, Camera, MessageSquare, Heading, Columns,
} from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Modal } from '../../../components/ui/Modal'
import api from '../../../api/client'

interface Pattern {
  id: string
  title: string
  description: string
  category: string
  block_count: number
}

const CATEGORY_LABELS: Record<string, string> = {
  texte: 'Texte',
  media: 'Médias',
  mise_en_page: 'Mise en page',
  sections: 'Sections complètes',
  listes: 'Listes & cartes',
}

const PATTERN_ICONS: Record<string, typeof Type> = {
  heading: Heading,
  text: Type,
  image: ImageIcon,
  text_image: Columns,
  hero: Star,
  rooms_cards: LayoutTemplate,
  restaurants_cards: Utensils,
  gallery: Camera,
  testimonials: MessageSquare,
  simple_list: Layers,
}

interface Props {
  open: boolean
  pageTitle: string
  pageSlug: string
  onClose: () => void
  onInsert: (pattern: string, sectionTitle: string) => void
  loading?: boolean
}

export default function BlockInserter({ open, pageTitle, pageSlug, onClose, onInsert, loading }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [sectionTitle, setSectionTitle] = useState('')

  const { data: patterns = [] } = useQuery<Pattern[]>({
    queryKey: ['content-patterns'],
    queryFn: () => api.get('/admin/content/patterns').then(r => r.data),
    enabled: open,
  })

  const grouped = patterns.reduce<Record<string, Pattern[]>>((acc, p) => {
    const cat = p.category || 'autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  const selectedPattern = patterns.find(p => p.id === selected)

  const handleSelect = (id: string) => {
    setSelected(id)
    const p = patterns.find(x => x.id === id)
    if (p) setSectionTitle(p.title)
  }

  const handleInsert = () => {
    if (!selected) return
    onInsert(selected, sectionTitle.trim() || selectedPattern?.title || '')
    setSelected(null)
    setSectionTitle('')
  }

  return (
    <Modal
      open={open}
      onClose={() => { onClose(); setSelected(null); setSectionTitle('') }}
      title="Ajouter un bloc"
      subtitle={`Page : ${pageTitle} — choisissez un type de contenu`}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={() => { onClose(); setSelected(null) }}>Annuler</Button>
          <Button
            disabled={!selected}
            loading={loading}
            onClick={handleInsert}
          >
            Insérer le bloc
          </Button>
        </>
      }
    >
      <div className="wc-inserter">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="wc-inserter-group">
            <h4 className="wc-inserter-cat">{CATEGORY_LABELS[cat] ?? cat}</h4>
            <div className="wc-inserter-grid">
              {items.map(p => {
                const Icon = PATTERN_ICONS[p.id] ?? Layers
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`wc-inserter-card${selected === p.id ? ' selected' : ''}`}
                    onClick={() => handleSelect(p.id)}
                  >
                    <div className="wc-inserter-card-icon"><Icon size={22} /></div>
                    <strong>{p.title}</strong>
                    <span>{p.description}</span>
                    <em>{p.block_count} champ{p.block_count > 1 ? 's' : ''}</em>
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {selected && (
          <div className="wc-inserter-options">
            <Input
              label="Titre de la section (optionnel)"
              value={sectionTitle}
              onChange={e => setSectionTitle(e.target.value)}
              placeholder={selectedPattern?.title ?? 'Nom affiché dans l\'éditeur'}
            />
            <p className="gc-field-hint">
              Ce titre apparaît dans l'éditeur pour identifier la section. Le contenu sera ajouté à la page <code>/{pageSlug}</code>.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
