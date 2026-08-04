import EditableImage, { useEditableImageSrc } from './EditableImage'
import { useEditMode } from './EditModeProvider'

type Props = {
  page: string
  blockKey?: string
  fallback: string
  alt?: string
  className?: string
  label?: string
  /** Extra class on the section wrapper when needed by callers — leave empty; section is owned by parent. */
}

/**
 * Full-bleed page banner: plain <img> keeps absolute CSS intact;
 * edit mode only adds a chip so title/CTAs stay clickable.
 */
export default function EditableHeroBackground({
  page,
  blockKey = 'hero.image',
  fallback,
  alt = '',
  className = 'fi2t-page-hero__bg',
  label = 'Image bannière',
}: Props) {
  const { isEditMode } = useEditMode()
  const src = useEditableImageSrc(page, blockKey, fallback)

  return (
    <>
      <img src={src || fallback} alt={alt} className={className} />
      {isEditMode ? (
        <EditableImage
          page={page}
          blockKey={blockKey}
          variant="chip"
          label={label}
          className="fi2t-page-hero__edit-chip"
          fallback={fallback}
        />
      ) : null}
    </>
  )
}
