import type { ArticleItem } from '../../lib/articles'
import { INTERVIEW_ARTICLE_DETAIL } from './article-trois-questions'

export const ACTUALITES_ARTICLES: ArticleItem[] = [
  {
    slug: 'walid-tritar-president-fi2t',
    title: 'Tourisme: Walid Tritar, nouveau Président de la Fi2T',
    desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
    date: '11 Mai 2026',
    img: '/images/act1.jpg',
  },
  {
    slug: 'secteur-sous-pression',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive....',
    date: '22 Mai 2026',
    img: '/images/act2.jpg',
  },
  {
    slug: 'houssem-azouz-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act3.jpg',
  },
  {
    slug: 'trois-questions-walid-tritar',
    title: 'Tourisme tunisien — Trois questions à Walid Tritar',
    desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
    date: '11 Mai 2026',
    img: '/images/act1.jpg',
    ...INTERVIEW_ARTICLE_DETAIL,
  },
  {
    slug: 'resilience-secteur-touristique',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive....',
    date: '22 Mai 2026',
    img: '/images/act2.jpg',
  },
  {
    slug: 'fi2t-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act3.jpg',
  },
  {
    slug: 'mandat-fi2t-2026',
    title: 'Tourisme: Walid Tritar, nouveau Président de la Fi2T',
    desc: 'Walid Tritar, a été élu nouveau Président de la Fi2T (Fédération interprofessionnelle du tourisme tunisien) pour la période 2026-2029....',
    date: '11 Mai 2026',
    img: '/images/act1.jpg',
  },
  {
    slug: 'marches-touristiques-2026',
    title: 'Secteur touristique: sous pression, mais résilient...',
    desc: 'Le secteur touristique mondiale, traverse une phase, avec des marché plus prédenr et des décisions de voyage de plus en plus tardive....',
    date: '22 Mai 2026',
    img: '/images/act2.jpg',
  },
  {
    slug: 'patrimoine-centre-ouest',
    title: 'Houssem Azouz (Président de la Fédération interprofessionnelle...',
    desc: 'Houssem Azouz Le Centre Ouest du pays frappé par l’immensité de ses vestiges et leur couleur...',
    date: '7 Avril 2026',
    img: '/images/act3.jpg',
  },
]

export const ACTUALITES_DEFAULTS: Record<string, string> = {
  'hero.image': '/hero.jpg',
  'hero.title': 'Actualités',
  'grid.per_page': '9',
  'grid.items': JSON.stringify(ACTUALITES_ARTICLES),
}
