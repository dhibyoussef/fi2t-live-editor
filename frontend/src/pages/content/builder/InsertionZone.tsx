import { Plus } from 'lucide-react'

interface Props {
  active: boolean
  onClick: () => void
  label?: string
}

export default function InsertionZone({ active, onClick, label = 'Ajouter une zone ici' }: Props) {
  return (
    <button
      type="button"
      className={`pb-insert${active ? ' pb-insert--active' : ''}`}
      onClick={onClick}
    >
      <Plus size={16} />
      <span>{label}</span>
    </button>
  )
}
