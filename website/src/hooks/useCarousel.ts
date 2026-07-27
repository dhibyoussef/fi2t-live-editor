import { useEffect, useState } from 'react'
import api from '../api/client'
import type { Carousel } from '../types/api'
import { fetchCached, preloadImages, readCache } from '../lib/dataCache'
import { carouselSlideUrls, slideListsEqual } from '../lib/heroSlides'

function cacheKey(slug: string) {
  return `carousel:${slug}`
}

function carouselUrlsEqual(a: Carousel | null, b: Carousel | null): boolean {
  if (!a || !b) return false
  return slideListsEqual(
    carouselSlideUrls(a.active_items ?? []),
    carouselSlideUrls(b.active_items ?? []),
  )
}

export function useCarousel(slug: string) {
  const [carousel, setCarousel] = useState<Carousel | null>(
    () => (slug ? readCache<Carousel>(cacheKey(slug)) : null),
  )
  const [loading, setLoading] = useState(() => !slug || readCache(cacheKey(slug)) === null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    const k = cacheKey(slug)
    if (readCache(k) === null) setLoading(true)

    fetchCached(k, async () => {
      const r = await api.get<Carousel>(`/carousels/public/${slug}`)
      return r.data
    })
      .then(data => {
        if (cancelled) return
        setCarousel(prev => (carouselUrlsEqual(prev, data) ? prev : data))
        preloadImages(data.active_items?.map(i => i.image_url) ?? [])
      })
      .catch(() => { if (!cancelled) setCarousel(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [slug])

  return { carousel, loading, items: carousel?.active_items ?? [] }
}
