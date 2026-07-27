import SiteHeader from './SiteHeader'
import '../../styles/page-hero.css'

interface Props {
  eyebrow: string
  title: string
  subtitle?: string
  image: string
}

export default function PageHero({ eyebrow, title, subtitle, image }: Props) {
  return (
    <div className="page-hero" style={{ backgroundImage: `url(${image})` }}>
      <div className="page-hero__overlay" />
      <SiteHeader variant="page" />
      <div className="container page-hero__content">
        <div className="eyebrow"><span>{eyebrow}</span></div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </div>
  )
}
