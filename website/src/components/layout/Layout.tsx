import { Outlet } from 'react-router-dom'
import { SiteSettingsProvider } from '../../cms/SiteSettingsProvider'
import Fi2tHeader from '../fi2t/Fi2tHeader'
import Fi2tFooter from '../fi2t/Fi2tFooter'

export default function Layout() {
  return (
    <SiteSettingsProvider>
      <Fi2tHeader />
      <main>
        <Outlet />
      </main>
      <Fi2tFooter />
    </SiteSettingsProvider>
  )
}
