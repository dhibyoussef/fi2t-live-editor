import SiteHeader from './SiteHeader'
import EditableText from '../../cms/EditableText'
import EditableImage from '../../cms/EditableImage'
import { useContent } from '../../cms/ContentProvider'
import { useEditMode } from '../../cms/EditModeProvider'
import '../../styles/page-hero.css'

interface Props {
  page: string
  eyebrowKey?: string
  titleKey?: string
  subtitleKey?: string
  imageKey?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  image?: string
}

export default function CmsPageHero({
  page,
  eyebrowKey = 'hero.eyebrow',
  titleKey = 'hero.title',
  subtitleKey = 'hero.subtitle',
  imageKey = 'hero.image',
  eyebrow = '',
  title = '',
  subtitle,
  image = '',
}: Props) {
  const { get } = useContent()
  const { isEditMode } = useEditMode()
  const bgImage = get(imageKey, image)

  return (
    <div className="page-hero" style={{ backgroundImage: isEditMode ? undefined : `url(${bgImage})` }}>
      {isEditMode && (
        <EditableImage
          page={page}
          blockKey={imageKey}
          className="page-hero__bg-img"
          alt=""
          fallback={image}
          label="Image de fond"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
        />
      )}
      <div className="page-hero__overlay" />
      <SiteHeader variant="page" />
      <div className="container page-hero__content">
        <div className="eyebrow">
          <span>
            <EditableText page={page} blockKey={eyebrowKey} as="span" fallback={eyebrow} label="Surtitre" />
          </span>
        </div>
        <EditableText page={page} blockKey={titleKey} as="h1" fallback={title} label="Titre" />
        {subtitleKey && (
          <EditableText
            page={page}
            blockKey={subtitleKey}
            as="p"
            fallback={subtitle ?? ''}
            label="Sous-titre"
            multiline
          />
        )}
      </div>
    </div>
  )
}
