import { ContentProvider } from '../cms/ContentProvider'
import EditToolbar from '../cms/EditToolbar'
import Reveal from '../components/ui/Reveal'
import HeroSection from '../components/home/HeroSection'
import FeaturedRoomsSection from '../components/home/FeaturedRoomsSection'
import EventsSection from '../components/home/EventsSection'
import RestaurantsSection from '../components/home/RestaurantsSection'
import SpaSection from '../components/home/SpaSection'
import SpaGallerySection from '../components/home/SpaGallerySection'
import WeddingsSection from '../components/home/WeddingsSection'
import VipLoungeSection from '../components/home/VipLoungeSection'
import ServicesSection from '../components/home/ServicesSection'
import TestimonialsSection from '../components/home/TestimonialsSection'
import GallerySection from '../components/home/GallerySection'

export default function HomePage() {
  return (
    <ContentProvider page="home">
      <HeroSection />
      <Reveal><FeaturedRoomsSection /></Reveal>
      <Reveal><EventsSection /></Reveal>
      <Reveal><RestaurantsSection /></Reveal>
      <Reveal><SpaSection /></Reveal>
      <Reveal><SpaGallerySection /></Reveal>
      <Reveal><WeddingsSection /></Reveal>
      <Reveal><VipLoungeSection /></Reveal>
      <Reveal><ServicesSection /></Reveal>
      <Reveal><TestimonialsSection /></Reveal>
      <Reveal><GallerySection /></Reveal>
      <EditToolbar />
    </ContentProvider>
  )
}
