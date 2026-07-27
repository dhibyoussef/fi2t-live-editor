import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { AMENITY_CATEGORY_LABELS } from './roomLabels'
import { AmenityIcon } from './AmenityIcon'

interface Amenity {
  id: number
  name: string
  icon?: string
  category: string
}

interface Props {
  amenities: Amenity[]
  selected: number[]
  onChange: (ids: number[]) => void
}

export function AmenityPicker({ amenities, selected, onChange }: Props) {
  const [open, setOpen] = useState<Record<string, boolean>>({})

  const grouped = useMemo(() => {
    const entries = amenities.reduce<Record<string, Amenity[]>>((acc, a) => {
      const cat = a.category ?? 'OTHER'
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(a)
      return acc
    }, {})
    return Object.entries(entries).sort(([a], [b]) =>
      (AMENITY_CATEGORY_LABELS[a] ?? a).localeCompare(AMENITY_CATEGORY_LABELS[b] ?? b),
    )
  }, [amenities])

  const toggleSection = (cat: string) => {
    setOpen(prev => (prev[cat] ? {} : { [cat]: true }))
  }

  const toggleItem = (id: number) => {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id])
  }

  if (!amenities.length) {
    return (
      <div className="room-amenity-empty">
        <p>Aucun équipement disponible.</p>
        <Link to="/room-amenities">Créer des équipements →</Link>
      </div>
    )
  }

  return (
    <div className="room-amenity-accordion">
      <p className="room-amenity-accordion-hint">
        Cliquez sur un type pour l'ouvrir et cocher les équipements (un seul type ouvert à la fois).
        {selected.length > 0 && (
          <span className="room-amenity-accordion-count">
            {selected.length} sélectionné{selected.length > 1 ? 's' : ''}
          </span>
        )}
      </p>

      <div className="room-amenity-accordion-list" role="list">
        {grouped.map(([cat, items]) => {
          const isOpen = !!open[cat]
          const selectedInGroup = items.filter(i => selected.includes(i.id)).length

          return (
            <div key={cat} className={`room-amenity-accordion-item${isOpen ? ' open' : ''}`}>
              <button
                type="button"
                className="room-amenity-accordion-header"
                onClick={() => toggleSection(cat)}
                aria-expanded={isOpen}
              >
                <ChevronDown size={16} className="room-amenity-accordion-chevron" />
                <span className="room-amenity-accordion-title">{AMENITY_CATEGORY_LABELS[cat] ?? cat}</span>
                <span className="room-amenity-accordion-meta">
                  {selectedInGroup > 0 && (
                    <span className="room-amenity-accordion-selected">{selectedInGroup} choisi{selectedInGroup > 1 ? 's' : ''}</span>
                  )}
                  <span className="room-amenity-accordion-total">{items.length}</span>
                </span>
              </button>

              {isOpen && (
                <ul className="room-amenity-accordion-body">
                  {items.map(a => {
                    const isOn = selected.includes(a.id)
                    return (
                      <li key={a.id}>
                        <label className={`room-amenity-accordion-row${isOn ? ' checked' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isOn}
                            onChange={() => toggleItem(a.id)}
                            className="room-amenity-accordion-checkbox"
                          />
                          <span className="room-amenity-accordion-icon">
                        <AmenityIcon icon={a.icon} size={14} />
                      </span>
                          <span className="room-amenity-accordion-name">{a.name}</span>
                        </label>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
