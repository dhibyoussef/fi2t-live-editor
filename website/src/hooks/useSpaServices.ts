import { useEffect, useState } from 'react'
import api from '../api/client'
import type { SpaService } from '../types/api'
import { fetchCached, readCache } from '../lib/dataCache'

const CACHE_KEY = 'spa-services/public'

export function useSpaServices() {
  const [services, setServices] = useState<SpaService[]>(
    () => readCache<SpaService[]>(CACHE_KEY) ?? [],
  )
  const [loading, setLoading] = useState(() => readCache(CACHE_KEY) === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (readCache(CACHE_KEY) === null) setLoading(true)

    fetchCached(CACHE_KEY, async () => {
      const r = await api.get<SpaService[]>('/spa-services/public')
      return Array.isArray(r.data) ? r.data : []
    })
      .then(data => {
        if (cancelled) return
        setServices(data)
        setError(false)
      })
      .catch(() => { if (!cancelled) setError(true) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [])

  return { services, loading, error }
}
