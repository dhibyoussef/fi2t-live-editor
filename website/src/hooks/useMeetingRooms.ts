import { useEffect, useState } from 'react'
import api from '../api/client'
import type { MeetingRoom } from '../types/api'
import { CACHE_TTL, preloadImages, readCache, writeCache } from '../lib/dataCache'
import { meetingRoomCover } from '../lib/meetingRoom'

const CACHE_KEY = 'meeting-rooms/public:v1'

export function useMeetingRooms() {
  const [rooms, setRooms] = useState<MeetingRoom[]>(
    () => readCache<MeetingRoom[]>(CACHE_KEY) ?? [],
  )
  const [loading, setLoading] = useState(() => readCache(CACHE_KEY) === null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false

    const loadFresh = async () => {
      try {
        const r = await api.get<MeetingRoom[]>('/meeting-rooms/public')
        const data = Array.isArray(r.data) ? r.data : []
        if (cancelled) return
        setRooms(data)
        setError(false)
        writeCache(CACHE_KEY, data, CACHE_TTL.api)
        preloadImages(data.map(room => meetingRoomCover(room)).filter(Boolean))
      } catch {
        if (!cancelled) setError(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const cached = readCache<MeetingRoom[]>(CACHE_KEY)
    if (cached) {
      setRooms(cached)
      setLoading(false)
      loadFresh()
    } else {
      setLoading(true)
      loadFresh()
    }

    return () => { cancelled = true }
  }, [])

  return { rooms, loading, error }
}
