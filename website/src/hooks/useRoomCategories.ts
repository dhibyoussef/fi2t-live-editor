import { useEffect, useState } from 'react'
import api from '../api/client'
import type { RoomCategory } from '../types/api'
import { fetchCached, preloadImages, readCache } from '../lib/dataCache'

type AccommodationType = 'ROOM' | 'APARTMENT'

function cacheKey(type?: AccommodationType) {
  return type ? `room-categories/public/${type}` : 'room-categories/public'
}

export function useRoomCategories(accommodationType?: AccommodationType) {
  const key = cacheKey(accommodationType)
  const [categories, setCategories] = useState<RoomCategory[]>(
    () => readCache<RoomCategory[]>(key) ?? [],
  )
  const [loading, setLoading] = useState(() => readCache(key) === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (readCache(key) === null) setLoading(true)

    fetchCached(key, async () => {
      const params = accommodationType ? { accommodation_type: accommodationType } : undefined
      const r = await api.get<RoomCategory[]>('/room-categories/public', { params })
      return Array.isArray(r.data) ? r.data : []
    })
      .then(data => {
        if (cancelled) return
        setCategories(data)
        setError(false)
        preloadImages(
          data.flatMap(c => (c.media ?? []).map(m => m.url).filter(Boolean)),
        )
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [key, accommodationType])

  return { categories, loading, error }
}
