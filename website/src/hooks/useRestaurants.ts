import { useEffect, useState } from 'react'
import api from '../api/client'
import type { RestaurantOutlet } from '../types/api'
import { CACHE_TTL, preloadImages, readCache, writeCache } from '../lib/dataCache'

const CACHE_KEY = 'outlets/public:RESTAURANT:v3'

export function useRestaurants() {
  const [restaurants, setRestaurants] = useState<RestaurantOutlet[]>(
    () => readCache<RestaurantOutlet[]>(CACHE_KEY) ?? [],
  )
  const [loading, setLoading] = useState(() => readCache(CACHE_KEY) === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadFresh = async () => {
      try {
        const r = await api.get<RestaurantOutlet[]>('/outlets/public', { params: { type: 'RESTAURANT' } })
        const data = Array.isArray(r.data) ? r.data : []
        if (cancelled) return
        setRestaurants(data)
        setError(false)
        writeCache(CACHE_KEY, data, CACHE_TTL.api)
        preloadImages(
          data.flatMap(o => [
            o.image,
            ...(o.images ?? []),
            o.chef?.image,
          ].filter(Boolean) as string[]),
        )
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const cached = readCache<RestaurantOutlet[]>(CACHE_KEY)
    if (cached) {
      setRestaurants(cached)
      setLoading(false)
      preloadImages(
        cached.flatMap(o => [
          o.image,
          ...(o.images ?? []),
          o.chef?.image,
        ].filter(Boolean) as string[]),
      )
      loadFresh()
    } else {
      setLoading(true)
      loadFresh()
    }

    return () => { cancelled = true }
  }, [])

  return { restaurants, loading, error }
}
