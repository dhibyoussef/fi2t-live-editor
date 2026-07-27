import { useEffect, useState } from 'react'
import api from '../api/client'
import type { Review } from '../types/api'
import { fetchCached, readCache } from '../lib/dataCache'

const CACHE_KEY = 'reviews/public'

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>(
    () => readCache<Review[]>(CACHE_KEY) ?? [],
  )
  const [loading, setLoading] = useState(() => readCache(CACHE_KEY) === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (readCache(CACHE_KEY) === null) setLoading(true)

    fetchCached(CACHE_KEY, async () => {
      const r = await api.get<Review[]>('/reviews/public')
      return Array.isArray(r.data) ? r.data : []
    })
      .then(data => {
        if (cancelled) return
        setReviews(data)
        setError(false)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { reviews, loading, error }
}
