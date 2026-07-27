import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { UtensilsCrossed, Sparkles, Presentation, PartyPopper, Plus, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'
import api from '../../api/client'
import { MEETING_TYPES, EVENT_TYPES } from './venueTypes'

const sections = [
  {
    to: '/venues/restaurants',
    icon: UtensilsCrossed,
    title: 'Restaurants & Bars',
    desc: 'Gérer les restaurants, bars, lounges et terrasses',
    addLabel: 'Ajouter un restaurant ou bar',
    countKey: 'outlets' as const,
  },
  {
    to: '/venues/spa',
    icon: Sparkles,
    title: 'Spa',
    desc: 'Catalogue des soins et prestations spa',
    addLabel: 'Ajouter un soin',
    countKey: 'spa' as const,
  },
  {
    to: '/venues/meeting-rooms',
    icon: Presentation,
    title: 'Salles de réunion',
    desc: 'Conférences, conseils d\'administration, ateliers',
    addLabel: 'Ajouter une salle de réunion',
    countKey: 'meeting' as const,
  },
  {
    to: '/venues/event-rooms',
    icon: PartyPopper,
    title: 'Salles d\'événement',
    desc: 'Banquets, cérémonies et espaces extérieurs',
    addLabel: 'Ajouter une salle d\'événement',
    countKey: 'events' as const,
  },
]

export default function VenuesHubPage() {
  const { data: outlets } = useQuery({
    queryKey: ['venues-count-outlets'],
    queryFn: () => api.get('/admin/outlets?per_page=1').then(r => r.data),
  })
  const { data: spa } = useQuery({
    queryKey: ['venues-count-spa'],
    queryFn: () => api.get('/admin/spa-services?per_page=1').then(r => r.data),
  })
  const { data: rooms } = useQuery({
    queryKey: ['venues-count-rooms'],
    queryFn: () => api.get('/admin/meeting-rooms?per_page=200').then(r => r.data),
  })

  const allRooms: any[] = rooms?.data ?? []
  const counts = {
    outlets: outlets?.meta?.total ?? (outlets?.data?.length ?? 0),
    spa: Array.isArray(spa) ? spa.length : (spa?.meta?.total ?? spa?.data?.length ?? 0),
    meeting: allRooms.filter(r => MEETING_TYPES.includes(r.type)).length,
    events: allRooms.filter(r => EVENT_TYPES.includes(r.type)).length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1C1811]" style={{ fontFamily: 'var(--font-display)' }}>
          Espaces & Lieux
        </h2>
        <p className="text-sm text-[#B89E72] mt-1">
          Gérez les restaurants, bars, spa, salles de réunion et salles d'événement de l'hôtel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map(section => {
          const Icon = section.icon
          const count = counts[section.countKey]
          return (
            <Card key={section.to} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl flex items-center justify-center bg-[#FAF0D0] shrink-0">
                    <Icon size={22} className="text-[#D4A017]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-[#1C1811]">{section.title}</h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#F0EAD6] text-[#5A4628]">
                        {count} {count <= 1 ? 'lieu' : 'lieux'}
                      </span>
                    </div>
                    <p className="text-sm text-[#B89E72] mt-1">{section.desc}</p>
                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        to={section.to}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#D4A017] hover:text-[#A67C00] transition-colors"
                      >
                        Gérer <ChevronRight size={14} />
                      </Link>
                      <Link
                        to={`${section.to}?add=1`}
                        className="inline-flex items-center gap-1 text-sm text-[#6B6145] hover:text-[#1C1811] transition-colors"
                      >
                        <Plus size={14} /> {section.addLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
