import type { ArticleItem } from '../../lib/articles'
import { INTERVIEW_ARTICLE_DETAIL } from './article-trois-questions'

/** First page matches Figma Actualité.png (9 cards). */
const ACTUALITES_PAGE1: ArticleItem[] = [
  {
    slug: 'walid-tritar-president-fi2t',
    title: 'Tourisme: Walid Tritar, nouveau Président de la Fi2T',
    desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
    date: '11 Mai 2026',
    img: '/images/act1.png?v=6',
  },
  {
    slug: 'secteur-sous-pression',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive.... .',
    date: '22 Mai 2026',
    img: '/images/act2.png?v=6',
  },
  {
    slug: 'houssem-azouz-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act3.png?v=6',
  },
  {
    slug: 'trois-questions-walid-tritar',
    title: 'Tourisme tunisien — Trois questions à Walid Tritar',
    desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
    date: '11 Mai 2026',
    img: '/images/article-featured-walid.png?v=2',
    ...INTERVIEW_ARTICLE_DETAIL,
  },
  {
    slug: 'resilience-secteur-touristique',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive.... .',
    date: '22 Mai 2026',
    img: '/images/act5.png?v=6',
  },
  {
    slug: 'fi2t-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act6.png?v=6',
  },
  {
    slug: 'mandat-fi2t-2026',
    title: 'Tourisme: Walid Tritar, nouveau Président de la Fi2T',
    desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
    date: '11 Mai 2026',
    img: '/images/act7.png?v=6',
  },
  {
    slug: 'marches-touristiques-2026',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive.... .',
    date: '22 Mai 2026',
    img: '/images/act8.png?v=6',
  },
  {
    slug: 'patrimoine-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act9.png?v=6',
  },
]

/** Pad to 6 pages (Figma pagination 1 2 … 6). */
function padArticlesForPagination(base: ArticleItem[], pages = 6): ArticleItem[] {
  const out: ArticleItem[] = [...base]
  let n = 0
  while (out.length < pages * 9) {
    const src = base[n % base.length]
    n += 1
    out.push({
      ...src,
      slug: `${src.slug}-p${Math.floor(out.length / 9) + 1}-${out.length}`,
    })
  }
  return out
}

export const ACTUALITES_ARTICLES: ArticleItem[] = padArticlesForPagination(ACTUALITES_PAGE1)

export const ACTUALITES_DEFAULTS: Record<string, string> = {
  'hero.image': '/images/desert-banner.jpg?v=1',
  'hero.title': 'Actualités',
  'article.banner': '/images/article-banner.jpg?v=1',
  'grid.per_page': '9',
  'grid.items': JSON.stringify(ACTUALITES_ARTICLES),
}
