import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePartners } from '../../hooks/usePartners'
import EditableText from '../../cms/EditableText'

const PAGE = 'seminaire'

const ROTATE_MS = 2800
const SLIDE_MS = 700

function partnerLogoSrc(url: string | null | undefined): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return url.startsWith('/') ? url : `/${url}`
}

export default function PartnersTrustSection() {
  const { partners, loading } = usePartners()
  const [step, setStep] = useState(0)
  const [instant, setInstant] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const count = partners.length

  const chain = useMemo(() => {
    if (count < 2) return partners
    return [...partners, ...partners]
  }, [partners, count])

  useEffect(() => {
    setStep(0)
  }, [count])

  const resetAutoTimer = useCallback(() => {
    if (count <= 1) return
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    intervalRef.current = window.setInterval(() => setStep(s => s + 1), ROTATE_MS)
  }, [count])

  useEffect(() => {
    resetAutoTimer()
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
    }
  }, [resetAutoTimer])

  useEffect(() => {
    if (count <= 1) return
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

  if (!loading && partners.length === 0) return null

  return (
    <section className="sem-partners" aria-labelledby="sem-partners-title">
      <img
        src="/imgs/bgvictor.svg"
        alt=""
        className="sem-partners__deco"
        aria-hidden="true"
      />

      <div className="sem-partners__inner">
        <EditableText
          page={PAGE}
          blockKey="partners.title"
          as="h2"
          className="sem-partners__title"
          label="Partenaires — Titre"
        />

        <div
          className="sem-partners__carousel"
          aria-live="polite"
          aria-busy={loading}
        >
          {loading ? (
            <div className="sem-partners__loading">Chargement…</div>
          ) : (
            <div
              className="sem-partners__viewport"
              style={{ ['--sem-count' as string]: chain.length }}
            >
              <div
                className={`sem-partners__track${instant ? ' sem-partners__track--instant' : ''}`}
                style={{
                  transform: `translateX(calc(-100% * ${step} / ${chain.length}))`,
                }}
              >
                {chain.map((partner, index) => {
                  const src = partnerLogoSrc(partner.logo_url)
                  return (
                    <div
                      key={`${partner.id}-${index}`}
                      className="sem-partners__logo-cell"
                    >
                      {src ? (
                        <img
                          src={src}
                          alt={partner.name}
                          className="sem-partners__logo"
                          loading="eager"
                          decoding="async"
                        />
                      ) : (
                        <span className="sem-partners__logo-fallback">{partner.name}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
