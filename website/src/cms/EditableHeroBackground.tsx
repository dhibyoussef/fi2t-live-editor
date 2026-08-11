import EditableImage, { useEditableImageSrc, useEditableImageAlt } from './EditableImage'
import { useEditMode } from './EditModeProvider'

type Props = {
  page: string
  blockKey?: string
  fallback: string
  alt?: string
  className?: string
  label?: string
}

/**
 * Full-bleed page banner: plain <img> keeps absolute CSS intact;
 * edit mode shows a pencil that opens the image panel (preview / path / alt / Changer).
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
  const altText = useEditableImageAlt(page, blockKey, alt)

  return (
    <>
      <img
        src={src || fallback}
        alt={altText || alt}
        className={className}
        data-cms-page={page}
        data-cms-block={blockKey}
        data-cms-type="image"
      />
      {isEditMode ? (
        <EditableImage
          page={page}
          blockKey={blockKey}
          variant="chip"
          label={label}
          alt={alt}
          className="fi2t-page-hero__edit-chip"
          fallback={fallback}
        />
      ) : null}
    </>
  )
}
