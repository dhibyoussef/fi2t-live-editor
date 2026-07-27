import CmsPageHero from '../components/layout/CmsPageHero'
import ServicesSection from '../components/home/ServicesSection'
import { ContentProvider } from '../cms/ContentProvider'
import EditToolbar from '../cms/EditToolbar'

import { IMG } from '../lib/localImages'

const PAGE = 'services'

function ServicesPageContent() {
  return (
    <>
      <CmsPageHero
        page={PAGE}
        eyebrow="Équipements"
        title="Services & Confort"
        subtitle="Tout ce dont vous avez besoin pour un séjour d'exception"
        image={IMG.servicesHero}
      />
      <ContentProvider page="home">
        <ServicesSection />
      </ContentProvider>
      <EditToolbar />
    </>
  )
}

export default function ServicesPage() {
  return (
    <ContentProvider page={PAGE}>
      <ServicesPageContent />
    </ContentProvider>
  )
}
