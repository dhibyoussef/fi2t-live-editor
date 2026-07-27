import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Sparkles, Plus, ChevronRight, ImageIcon, Building2, BedDouble, Crown } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import api from '../../api/client'
import {
  ROOM_CATEGORY_ENUM_LABELS,
  accommodationInventoryLabel,
  enumVal,
  splitAccommodationTypes,
  type AccommodationDisplayKind,
} from './roomLabels'

function CategoryPreview({
  items,
  kind,
  manageLink,
  emptyLabel,
}: {
  items: any[]
  kind: AccommodationDisplayKind
  manageLink: string
  emptyLabel: string
}) {
  const coverOf = (c: any) => c.media?.find((m: any) => m.is_cover) ?? c.media?.[0]
  const addLink = `${manageLink}${manageLink.includes('?') ? '&' : '?'}add=1`

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-[#B89E72] text-sm">
          {emptyLabel}{' '}
          <Link to={addLink} className="text-[#D4A017]">Créer →</Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="room-type-grid room-type-grid-compact">
      {items.map((c: any) => {
        const cover = coverOf(c)
        return (
          <Link key={c.id} to={manageLink} className="room-type-card room-type-card-link">
            <div className="room-type-card-img">
              {cover?.url ? <img src={cover.url} alt="" /> : <div className="room-type-card-placeholder"><ImageIcon size={22} /></div>}
            </div>
            <div className="room-type-card-body">
              <h3>{c.name}</h3>
              <p className="room-type-card-tag">
                {ROOM_CATEGORY_ENUM_LABELS[enumVal(c.category)] ?? enumVal(c.category)}
                {' · '}{accommodationInventoryLabel(c, kind)}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

const HUB_SECTIONS = [
  {
    key: 'chambre' as const,
    title: 'Chambres',
    icon: BedDouble,
    manageLink: '/room-categories?type=ROOM&kind=chambre',
    addLink: '/room-categories?add=1&type=ROOM&kind=chambre',
    emptyLabel: 'Aucune chambre définie.',
    previewTitle: 'Aperçu — Chambres',
  },
  {
    key: 'suite' as const,
    title: 'Suites',
    icon: Crown,
    manageLink: '/room-categories?type=ROOM&kind=suite',
    addLink: '/room-categories?add=1&type=ROOM&kind=suite',
    emptyLabel: 'Aucune suite définie.',
    previewTitle: 'Aperçu — Suites',
  },
  {
    key: 'apartment' as const,
    title: 'Appartements',
    icon: Building2,
    manageLink: '/room-categories?type=APARTMENT',
    addLink: '/room-categories?add=1&type=APARTMENT',
    emptyLabel: 'Aucun appartement défini.',
    previewTitle: 'Aperçu — Appartements',
  },
]

export default function AccommodationHubPage() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['room-categories'],
    queryFn: () => api.get('/admin/room-categories').then(r => r.data),
  })
  const { data: amenities } = useQuery({
    queryKey: ['room-amenities'],
    queryFn: () => api.get('/admin/room-amenities').then(r => r.data),
  })

  const types = Array.isArray(categories) ? categories : []
  const amenityCount = Array.isArray(amenities) ? amenities.length : 0
  const split = splitAccommodationTypes(types)
  const itemsByKind = {
    chambre: split.chambres,
    suite: split.suites,
    apartment: split.apartments,
  }
  const activeByKind = {
    chambre: split.activeChambres,
    suite: split.activeSuites,
    apartment: split.activeApartments,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>
          Hébergement
        </h2>
        <p className="text-sm text-[#B89E72] mt-1">
          Gérez les chambres, suites et appartements proposés sur le site
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {HUB_SECTIONS.map(section => {
          const Icon = section.icon
          const items = itemsByKind[section.key]
          const active = activeByKind[section.key]
          return (
            <Card key={section.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#FAF0D0] shrink-0">
                    <Icon size={22} className="text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#1C1811]">{section.title}</h3>
                    <p className="text-sm text-[#B89E72] mt-1">{active.length} actif{active.length !== 1 ? 's' : ''} sur {items.length}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Link to={section.manageLink}>
                        <Button variant="secondary" size="sm">Gérer <ChevronRight size={14} /></Button>
                      </Link>
                      <Link to={section.addLink}>
                        <Button size="sm"><Plus size={14} /> Ajouter</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#FAF0D0] shrink-0">
                <Sparkles size={22} className="text-[#D4A017]" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#1C1811]">Équipements</h3>
                <p className="text-sm text-[#B89E72] mt-1">{amenityCount} dans le catalogue</p>
                <Link to="/room-amenities" className="inline-flex items-center gap-1 text-sm font-medium text-[#D4A017] mt-3 hover:text-[#A67C00]">
                  Gérer les équipements <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10"><div className="gc-spinner" /></div>
      ) : (
        HUB_SECTIONS.map(section => {
          const Icon = section.icon
          const items = itemsByKind[section.key]
          return (
            <div key={`preview-${section.key}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#1C1811] flex items-center gap-2">
                  <Icon size={15} className="text-[#D4A017]" /> {section.previewTitle}
                </h3>
                <Link to={section.manageLink} className="text-xs font-medium text-[#D4A017] hover:text-[#A67C00]">Voir tout</Link>
              </div>
              <CategoryPreview
                items={items}
                kind={section.key}
                manageLink={section.manageLink}
                emptyLabel={section.emptyLabel}
              />
            </div>
          )
        })
      )}
    </div>
  )
}
