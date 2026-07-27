import { useQuery } from '@tanstack/react-query'
import {
  Type, Image as ImageIcon, Layers, LayoutTemplate, Star,
  Utensils, Camera, MessageSquare, Heading, Columns,
} from 'lucide-react'
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
  sections: 'Sections',
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
  spa_gallery: Camera,
  weddings_cards: LayoutTemplate,
  services_list: Layers,
  simple_list: Layers,
}

interface Props {
  active: boolean
  onPick: (patternId: string) => void
  loading?: boolean
}

export default function ComponentPalette({ active, onPick, loading }: Props) {
  const { data: patterns = [] } = useQuery<Pattern[]>({
    queryKey: ['content-patterns'],
    queryFn: () => api.get('/admin/content/patterns').then(r => r.data),
  })

  const grouped = patterns.reduce<Record<string, Pattern[]>>((acc, p) => {
    const cat = p.category || 'autre'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <aside className={`pb-palette${active ? ' pb-palette--active' : ''}`}>
      <div className="pb-palette__head">
        <h3>Composants</h3>
        {active ? (
          <p className="pb-palette__hint pb-palette__hint--active">Choisissez un composant à insérer ici</p>
        ) : (
          <p className="pb-palette__hint">Cliquez sur <strong>+ Ajouter une zone</strong> dans la page, puis sélectionnez un composant</p>
        )}
      </div>
      <div className="pb-palette__scroll">
        {Object.entries(grouped).map(([cat, items]) => (
          <div key={cat} className="pb-palette__group">
            <h4>{CATEGORY_LABELS[cat] ?? cat}</h4>
            <div className="pb-palette__list">
              {items.map(p => {
                const Icon = PATTERN_ICONS[p.id] ?? Layers
                return (
                  <button
                    key={p.id}
                    type="button"
                    className="pb-palette__item"
                    disabled={!active || loading}
                    onClick={() => onPick(p.id)}
                  >
                    <span className="pb-palette__item-icon"><Icon size={18} /></span>
                    <span className="pb-palette__item-text">
                      <strong>{p.title}</strong>
                      <small>{p.description}</small>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
