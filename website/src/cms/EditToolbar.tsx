import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEditMode } from './EditModeProvider'
import { useContent } from './ContentProvider'
import { useBuilderPreview } from './BuilderPreviewProvider'
import './edit-mode.css'

const LANG_LABELS: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  ar: 'العربية',
}

export default function EditToolbar() {
  const { t, i18n } = useTranslation()
  const { isEditMode, isAdmin, user, exitEditMode } = useEditMode()
  const { isEmbed } = useBuilderPreview()
  const { pending, savePending, clearPending } = useContent()
  const lang = (i18n.language || 'fr').split('-')[0]
  const langLabel = LANG_LABELS[lang] ?? lang.toUpperCase()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!isEditMode || isEmbed) return null

  const handleSave = async () => {
    if (!pending.length) return
    setSaving(true)
    try {
      await savePending()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      alert('Erreur lors de la sauvegarde. Vérifiez votre connexion.')
    } finally {
      setSaving(false)
    }
  }

  const roleLabel = isAdmin ? t('fi2t.edit.super_admin') : t('fi2t.edit.admin')
  const changesLabel = pending.length > 1 ? t('fi2t.edit.changes_many') : t('fi2t.edit.changes_one')

  return (
    <div className="cms-toolbar">
      <div className="cms-toolbar__left">
        <span className="cms-toolbar__badge" aria-hidden="true">
          <i className="fa-solid fa-pen-to-square" />
        </span>
        <div>
          <strong>{t('fi2t.edit.mode')}</strong>
          <span className="cms-toolbar__user">
            {roleLabel}
            {user?.email ? ` · ${user.email}` : user?.name && user.name !== 'Super Admin' ? ` · ${user.name}` : ''}
          </span>
        </div>
      </div>

      <div className="cms-toolbar__hint">
        {t('fi2t.edit.lang_current')} : <strong>{langLabel}</strong>
        <span className="cms-toolbar__sep">·</span>
        {t('fi2t.edit.hint')}
      </div>

      <div className="cms-toolbar__actions">
        {pending.length > 0 && (
          <span className="cms-toolbar__count">
            {pending.length} {changesLabel}
          </span>
        )}
        {saved && (
          <span className="cms-toolbar__saved">
            <i className="fa-solid fa-check" /> {t('fi2t.edit.saved')}
          </span>
        )}
        <button
          type="button"
          className="cms-toolbar__btn cms-toolbar__btn--save"
          onClick={handleSave}
          disabled={!pending.length || saving}
        >
          {saving ? t('fi2t.edit.saving') : t('fi2t.edit.save')}
        </button>
        <button
          type="button"
          className="cms-toolbar__btn cms-toolbar__btn--discard"
          onClick={clearPending}
          disabled={!pending.length}
        >
          {t('fi2t.edit.cancel')}
        </button>
        <button type="button" className="cms-toolbar__btn cms-toolbar__btn--exit" onClick={exitEditMode}>
          {t('fi2t.edit.exit')}
        </button>
      </div>
    </div>
  )
}
