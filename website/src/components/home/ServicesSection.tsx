import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useContent } from '../../cms/ContentProvider'
import {
  getServiceIconUrl,
  preloadServiceIcons,
  resolveServiceIconUrl,
  SERVICE_ITEMS,
  type ServiceIconSet,
} from '../../lib/serviceIcons'
import '../../styles/services.css'

interface ServiceItemCms {
  title: string
  icons: ServiceIconSet
}

const DEFAULT_SERVICE_ITEMS: ServiceItemCms[] = SERVICE_ITEMS.map(({ title, icons }) => ({
  title,
  icons,
}))

const VISIBLE_PER_SIDE = 3
const ROTATE_MS = 3200
const SLIDE_MS = 900

function CachedSvgImg({ url, className }: { url: string; className?: string }) {
  const [src, setSrc] = useState(() => getServiceIconUrl(url) ?? url)

  useEffect(() => {
    const cached = getServiceIconUrl(url)
    if (cached) {
      setSrc(cached)
      return
    }
    let active = true
    resolveServiceIconUrl(url).then(resolved => {
      if (active) setSrc(resolved)
    })
    return () => { active = false }
  }, [url])

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={className}
      loading="eager"
      decoding="async"
      fetchPriority="high"
    />
  )
}

function ServiceIconStack({ icons }: { icons: ServiceIconSet }) {
  return (
    <div className="service-card__icon-stack">
      <CachedSvgImg url={icons.base} className="service-card__icon-base" />
      {icons.overlay && (
        <CachedSvgImg url={icons.overlay} className="service-card__icon-overlay" />
      )}
    </div>
  )
}

function ServiceCard({ icons, title }: { icons: ServiceIconSet; title: string }) {
  return (
    <article className="service-card">
      <div className="service-card__icon">
        <ServiceIconStack icons={icons} />
      </div>
      <p className="service-card__title">{title}</p>
    </article>
  )
}

function ServiceTrack({
  items,
  slideIndex,
  instant,
}: {
  items: ServiceItemCms[]
  slideIndex: number
  instant: boolean
}) {
  const loop = useMemo(() => [...items, ...items], [items])

  return (
    <div className="services__viewport">
      <div
        className={`services__track${instant ? ' services__track--instant' : ''}`}
        style={{ transform: `translate3d(${-slideIndex}px, 0, 0)` }}
      >
        {loop.map((service, i) => (
          <ServiceCard key={`${service.title}-${i}`} icons={service.icons} title={service.title} />
        ))}
      </div>
    </div>
  )
}

export default function ServicesSection() {
  const { getJson } = useContent()
  const serviceItems = useMemo(
    () => getJson<ServiceItemCms[]>('services.items', DEFAULT_SERVICE_ITEMS),
    [getJson],
  )
  const count = serviceItems.length
  const [step, setStep] = useState(0)
  const [instant, setInstant] = useState(false)
  const [cardStep, setCardStep] = useState(284)
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    preloadServiceIcons()
  }, [])

  useLayoutEffect(() => {
    const measure = () => {
      const card = stageRef.current?.querySelector('.service-card')
      if (!card) return
      const gap = parseFloat(
        getComputedStyle(stageRef.current!).getPropertyValue('--services-gap'),
      ) || 14
      setCardStep(card.getBoundingClientRect().width + gap)
    }

    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStep(s => s + 1)
    }, ROTATE_MS)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (step >= count) {
      const t = window.setTimeout(() => {
        setInstant(true)
        setStep(0)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setInstant(false))
        })
      }, SLIDE_MS)
      return () => window.clearTimeout(t)
    }
  }, [step, count])

  const leftSlide = step * cardStep
  const rightSlide = (step + VISIBLE_PER_SIDE) * cardStep

  return (
    <section className="services" aria-label="Services & Confort" data-cms-section="services">
      <div className="services__stage" ref={stageRef}>
        <div className="services__center" aria-hidden="true">
          <img
            src="/logo-figma.svg"
            alt=""
            className="services__logo-mark"
            width={59}
            height={67}
            loading="eager"
            decoding="async"
          />
          <img
            src="/imgs/bgvictor.svg"
            alt=""
            className="services__victor"
            width={226}
            height={597}
            loading="eager"
            decoding="async"
          />
          <img
            src="/imgs/goldencarthafe.svg"
            alt="Golden Carthage"
            className="services__brand"
            loading="eager"
            decoding="async"
          />
        </div>

        <div className="services__carousel">
          <div className="services__side services__side--left">
            <ServiceTrack items={serviceItems} slideIndex={leftSlide} instant={instant} />
          </div>

          <div className="services__side services__side--right">
            <ServiceTrack items={serviceItems} slideIndex={rightSlide} instant={instant} />
          </div>
        </div>
      </div>
    </section>
  )
}
