import { Navigate, useParams, useSearchParams } from 'react-router-dom'

export function RedirectRoomToFiche() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const qs = params.toString()
  return <Navigate to={`/chambres/${id}/fiche${qs ? `?${qs}` : ''}`} replace />
}

export function RedirectApartmentToFiche() {
  const { id } = useParams<{ id: string }>()
  const [params] = useSearchParams()
  const qs = params.toString()
  return <Navigate to={`/appartements/${id}/fiche${qs ? `?${qs}` : ''}`} replace />
}
