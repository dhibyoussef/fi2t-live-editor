import { Plus, FileText, Globe, Home, Layout, Trash2 } from 'lucide-react'

export interface CmsPage {
  slug: string
  title: string
  status: 'draft' | 'published'
  template: 'default' | 'home' | 'landing' | 'global'
  is_system: boolean
  sort_order: number
}

const TEMPLATE_ICON: Record<string, typeof FileText> = {
  home: Home,
  global: Globe,
  landing: Layout,
  default: FileText,
}

interface Props {
  pages: CmsPage[]
  activeSlug: string
  onSelect: (slug: string) => void
  onAddPage: () => void
  onDeletePage?: (page: CmsPage) => void
}

export default function PageSidebar({ pages, activeSlug, onSelect, onAddPage, onDeletePage }: Props) {
  return (
    <aside className="wc-pages-sidebar">
      <div className="wc-pages-sidebar-head">
        <span>Pages</span>
        <button type="button" className="wc-pages-add" onClick={onAddPage} title="Ajouter une page">
          <Plus size={14} />
        </button>
      </div>
      <nav className="wc-pages-list">
        {pages.map(page => {
          const Icon = TEMPLATE_ICON[page.template] ?? FileText
          return (
            <div
              key={page.slug}
              className={`wc-page-item${activeSlug === page.slug ? ' active' : ''}`}
            >
              <button type="button" className="wc-page-item-btn" onClick={() => onSelect(page.slug)}>
                <Icon size={14} />
                <span className="wc-page-item-title">{page.title}</span>
                <span className={`wc-page-status wc-page-status--${page.status}`}>
                  {page.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </button>
              {!page.is_system && onDeletePage && (
                <button
                  type="button"
                  className="wc-page-item-delete"
                  title="Supprimer la page"
                  onClick={() => onDeletePage(page)}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
