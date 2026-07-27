import { useTranslation } from 'react-i18next'

interface Props {
  showSuccess: boolean
  showError: boolean
  errorMessage: string
  onClose: () => void
  successKey?: string
  successMessageKey?: string
}

export default function ReservationModal({
  showSuccess,
  showError,
  errorMessage,
  onClose,
  successKey = 'reservation.successTitle',
  successMessageKey = 'reservation.successMessage',
}: Props) {
  const { t } = useTranslation()
  if (!showSuccess && !showError) return null

  return (
    <div
      className="resto-reservation__modal-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className={`resto-reservation__modal${showError ? ' resto-reservation__modal--error' : ''}`}
        onClick={ev => ev.stopPropagation()}
      >
        <div
          className={`resto-reservation__modal-icon${showError ? ' resto-reservation__modal-icon--error' : ''}`}
          aria-hidden="true"
        >
          {showError ? '!' : '✓'}
        </div>
        <h2 className="resto-reservation__modal-title">
          {showError ? t('reservation.errorTitle') : t(successKey)}
        </h2>
        <p className="resto-reservation__modal-text">
          {showError ? errorMessage : t(successMessageKey)}
        </p>
        <button type="button" className="resto-reservation__modal-btn" onClick={onClose}>
          {t('reservation.close')}
        </button>
      </div>
    </div>
  )
}
