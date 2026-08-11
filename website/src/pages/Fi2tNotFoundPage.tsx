import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEditMode } from '../cms/EditModeProvider'

type Props = {
  /** Requested path without leading slash, e.g. `admin` or `foo`. */
  slug?: string
  variant?: 'notfound' | 'draft'
}

/**
 * FI2T-branded empty / missing page — never uses the old hotel SiteHeader.
 * Layout already provides Fi2tHeader + Fi2tFooter.
 */
export default function Fi2tNotFoundPage({ slug, variant = 'notfound' }: Props) {
  const { i18n } = useTranslation()
  const { isSuperAdmin } = useEditMode()
  const lang = (i18n.language || 'fr').split('-')[0]
  const isDraft = variant === 'draft'

  const copy = {
    fr: {
      code: '404',
      title: isDraft ? 'Page en brouillon' : 'Page introuvable',
      body: isDraft
        ? 'Cette page n’est pas encore publiée. Publiez-la depuis le backoffice (Contenu du site).'
        : slug
          ? `La page « /${slug} » n’existe pas sur le site FI2T.`
          : 'Cette page n’existe pas sur le site FI2T.',
      home: 'Retour à l’accueil',
      contact: 'Nous contacter',
      adminHint: 'L’espace d’administration est disponible sur le port 3000.',
      adminCta: 'Ouvrir le CMS',
    },
    en: {
      code: '404',
      title: isDraft ? 'Draft page' : 'Page not found',
      body: isDraft
        ? 'This page is not published yet. Publish it from the back office (Website content).'
        : slug
          ? `The page “/${slug}” does not exist on the FI2T site.`
          : 'This page does not exist on the FI2T site.',
      home: 'Back to home',
      contact: 'Contact us',
      adminHint: 'The admin area runs on port 3000.',
      adminCta: 'Open CMS',
    },
    ar: {
      code: '404',
      title: isDraft ? 'صفحة مسودة' : 'الصفحة غير موجودة',
      body: isDraft
        ? 'هذه الصفحة غير منشورة بعد. انشرها من لوحة التحكم (محتوى الموقع).'
        : slug
          ? `الصفحة « /${slug} » غير موجودة على موقع FI2T.`
          : 'هذه الصفحة غير موجودة على موقع FI2T.',
      home: 'العودة إلى الرئيسية',
      contact: 'اتصل بنا',
      adminHint: 'لوحة الإدارة متاحة على المنفذ 3000.',
      adminCta: 'فتح نظام المحتوى',
    },
  } as const

  const c = copy[lang as keyof typeof copy] ?? copy.fr
  const isAdminPath = slug === 'admin' || slug?.startsWith('admin/')
  const adminOrigin =
    (import.meta.env.VITE_ADMIN_ORIGIN as string | undefined)?.replace(/\/$/, '')
    || 'http://localhost:3000'

  return (
    <section className="fi2t-notfound" aria-labelledby="fi2t-notfound-title">
      <div className="fi2t-notfound__inner">
        <p className="fi2t-notfound__code" aria-hidden="true">{c.code}</p>
        <h1 id="fi2t-notfound-title" className="fi2t-notfound__title">{c.title}</h1>
        <p className="fi2t-notfound__body">{c.body}</p>

        {isSuperAdmin && isAdminPath && !isDraft && (
          <p className="fi2t-notfound__hint">
            {c.adminHint}{' '}
            <a className="fi2t-notfound__admin-link" href={adminOrigin}>
              {c.adminCta}
            </a>
          </p>
        )}

        <div className="fi2t-notfound__actions">
          <Link to="/" className="fi2t-notfound__btn fi2t-notfound__btn--primary">
            {c.home}
          </Link>
          <Link to="/contact" className="fi2t-notfound__btn fi2t-notfound__btn--ghost">
            {c.contact}
          </Link>
        </div>
      </div>
    </section>
  )
}
