import type { OutletChef, RestaurantOutlet } from '../types/api'
import { restaurantSlug } from './restaurant'
import { IMG } from './localImages'

export interface ChefInfo {
  name: string
  slogan: string
  description: string
  image: string
}

export interface BarInfo {
  eyebrow: string
  title: string
  description: string
  image: string
}

export interface RestaurantDetail {
  id?: number
  slug: string
  name: string
  description: string
  longDescription: string
  heroImage: string
  logo: string
  chef: ChefInfo
}

const HERO_FALLBACK = IMG.restaurantCalcutta
const CHEF_FALLBACK = IMG.misc
const BAR_IMAGE = IMG.restaurantBar

export const BAR_SECTION: BarInfo = {
  eyebrow: 'Expérience culinaire',
  title: 'LE BAR',
  description:
    "Le bar du Golden Carthage vous invite à prolonger l'expérience gastronomique dans une atmosphère élégante et détendue. Cocktails signature, spiritueux raffinés et sélection de vins accompagnent vos soirées face à la baie de Tunis.",
  image: BAR_IMAGE,
}

const DETAIL_BY_SLUG: Record<string, Omit<RestaurantDetail, 'id' | 'slug' | 'name' | 'description' | 'heroImage'>> = {
  'la-stalla': {
    logo: '/imgs/GCH.svg',
    longDescription:
      "La Stalla vous transporte dans l'Italie campagnarde avec des produits frais, des pâtes maison et une ambiance chaleureuse aux accents rustiques. Une table authentique pour savourer la dolce vita au cœur de Gammarth.",
    chef: {
      name: 'Chef Marco Bianchi',
      slogan: '« L\u2019authenticité italienne, simplement »',
      description:
        "Formé dans les trattorias de Toscane, le Chef Marco sublime les recettes traditionnelles italiennes avec des produits locaux et une touche contemporaine. Chaque plat raconte une histoire de terroir et de convivialité.",
      image: IMG.misc,
    },
  },
  'el-montazah': {
    logo: '/imgs/GCH.svg',
    longDescription:
      "El Montazah célèbre le mariage harmonieux entre la cuisine tunisienne et les saveurs internationales. Dans un cadre raffiné, découvrez une carte généreuse qui voyage des rivages de la Méditerranée aux grandes tables du monde.",
    chef: {
      name: 'Chef Amine Trabelsi',
      slogan: '« Entre Méditerranée et traditions tunisiennes »',
      description:
        "Le Chef Amine revisite les classiques tunisiens et les cuisines du monde avec créativité et respect des produits. Son approche met en lumière les épices, les marinades et les techniques qui font la richesse de notre terroir.",
      image: IMG.g4,
    },
  },
  calcutta: {
    logo: '/imgs/GCH.svg',
    longDescription:
      "Calcutta vous invite à un voyage sensoriel à travers l'Inde. Épices parfumées, tandoori et currys élaborés composent une carte authentique dans un décor envoûtant, pour une expérience gastronomique inoubliable.",
    chef: {
      name: 'Chef Rajesh Kumar',
      slogan: '« Les épices racontent l\u2019Inde »',
      description:
        "Originaire du Rajasthan, le Chef Rajesh maîtrise l'art du tandoor et des mélanges d'épices traditionnels. Chaque assiette est une invitation à découvrir la diversité et la générosité de la cuisine indienne.",
      image: IMG.g6,
    },
  },
}

const DEFAULT_SLUG_ORDER = ['la-stalla', 'el-montazah', 'calcutta']

const FALLBACK_NAMES: Record<string, { name: string; description: string; heroImage: string }> = {
  'la-stalla': {
    name: 'La Stalla',
    description: 'Restaurant Italien de style campagnard',
    heroImage: IMG.restaurantStalla,
  },
  'el-montazah': {
    name: 'El Montazah',
    description: 'Cuisine tunisienne et Internationale',
    heroImage: IMG.restaurantMontazah,
  },
  calcutta: {
    name: 'Calcutta',
    description: 'Spécialités Indiennes',
    heroImage: IMG.restaurantCalcutta,
  },
}

function chefFromOutlet(outletChef: OutletChef | null | undefined, fallback: ChefInfo): ChefInfo {
  if (!outletChef) return fallback

  const hasApiData = Boolean(
    outletChef.name?.trim()
    || outletChef.image?.trim()
    || outletChef.slogan?.trim()
    || outletChef.description?.trim(),
  )
  if (!hasApiData) return fallback

  return {
    name: outletChef.name?.trim() || fallback.name,
    slogan: outletChef.slogan?.trim() || fallback.slogan,
    description: outletChef.description?.trim() || fallback.description,
    image: outletChef.image?.trim() || fallback.image,
  }
}

function defaultDetailForSlug(slug: string): RestaurantDetail {
  const extra = DETAIL_BY_SLUG[slug] ?? DETAIL_BY_SLUG['la-stalla']
  const base = FALLBACK_NAMES[slug] ?? FALLBACK_NAMES['la-stalla']
  return {
    slug,
    name: base.name,
    description: base.description,
    heroImage: base.heroImage,
    ...extra,
  }
}

export function buildRestaurantDetail(outlet: RestaurantOutlet | null, slug: string): RestaurantDetail {
  const base = defaultDetailForSlug(slug)
  if (!outlet) return base

  const outletSlug = restaurantSlug(outlet.name)
  const extra = DETAIL_BY_SLUG[outletSlug] ?? DETAIL_BY_SLUG[slug] ?? DETAIL_BY_SLUG['la-stalla']
  const images = outlet.images?.length ? outlet.images : outlet.image ? [outlet.image] : []

  return {
    id: outlet.id,
    slug: outletSlug,
    name: outlet.name,
    description: outlet.description ?? base.description,
    longDescription: outlet.description ?? extra.longDescription,
    heroImage: images[0] ?? outlet.image ?? base.heroImage,
    logo: extra.logo,
    chef: chefFromOutlet(outlet.chef, extra.chef),
  }
}

export function resolveRestaurantSlug(
  outlets: RestaurantOutlet[],
  slugParam: string,
): string | null {
  if (!slugParam) return null
  const normalized = slugParam.toLowerCase()
  const match = outlets.find(o => restaurantSlug(o.name) === normalized)
  if (match) return restaurantSlug(match.name)
  if (DETAIL_BY_SLUG[normalized] || FALLBACK_NAMES[normalized]) return normalized
  return null
}

export function orderedRestaurantSlugs(outlets: RestaurantOutlet[]): string[] {
  if (outlets.length === 0) return DEFAULT_SLUG_ORDER
  return outlets.map(o => restaurantSlug(o.name))
}

export function adjacentSlug(slugs: string[], current: string, direction: 'prev' | 'next'): string {
  if (!slugs.length) return current
  const index = slugs.indexOf(current)
  const i = index === -1 ? 0 : index
  const next = direction === 'next'
    ? (i + 1) % slugs.length
    : (i - 1 + slugs.length) % slugs.length
  return slugs[next]
}

export function chefImage(image: string): string {
  return image || CHEF_FALLBACK
}

export function heroImage(image: string): string {
  return image || HERO_FALLBACK
}
