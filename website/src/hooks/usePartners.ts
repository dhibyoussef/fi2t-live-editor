import { useEffect, useState } from 'react'
import api from '../api/client'
import type { Partner } from '../types/api'
import { fetchCached, readCache } from '../lib/dataCache'

const CACHE_KEY = 'partners/public:v2'

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>(
    () => readCache<Partner[]>(CACHE_KEY) ?? [],
  )
  const [loading, setLoading] = useState(() => readCache(CACHE_KEY) === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (readCache(CACHE_KEY) === null) setLoading(true)

    fetchCached(CACHE_KEY, async () => {
      const r = await api.get<Partner[]>('/partners/public')
      return Array.isArray(r.data) ? r.data : []
    })
      .then(data => {
        if (cancelled) return
        setPartners(data)
        setError(false)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { partners, loading, error }
}
