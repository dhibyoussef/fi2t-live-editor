import { ContentProvider } from '../cms/ContentProvider'
import EditableText from '../cms/EditableText'
import EditableImage from '../cms/EditableImage'
import EditToolbar from '../cms/EditToolbar'

interface Props {
  page: string
  titleFallback: string
}

export default function SimpleCmsPage({ page, titleFallback }: Props) {
  return (
    <ContentProvider page={page}>
      <div className="fi2t-simple" data-page={page}>
        <section className="fi2t-simple__hero">
          <EditableImage
            page={page}
            blockKey="hero.image"
            className="fi2t-simple__bg"
            alt=""
            fallback="/hero.jpg"
          />
          <div className="fi2t-simple__overlay" />
          <EditableText
            page={page}
            blockKey="hero.title"
            as="h1"
            className="fi2t-simple__title"
            fallback={titleFallback}
          />
        </section>
        <section className="fi2t-section fi2t-simple__body">
          <EditableText page={page} blockKey="body.title" as="h2" fallback={titleFallback} />
          <EditableText
            page={page}
            blockKey="body.text"
            as="div"
            multiline
            fallback="Contenu modifiable depuis le live editor et le back-office Contenu du site."
          />
        </section>
        <EditToolbar />
      </div>
    </ContentProvider>
  )
}
