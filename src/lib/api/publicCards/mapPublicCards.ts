import type { PublicCard, PublicCardsQueryResult, PublicCardsResponse } from '@interfaces/api/publicCards'

export function normalizePublicCardsResponse(response: PublicCardsResponse): PublicCardsQueryResult {
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to load public cards')
  }

  return {
    cards: response.data.data,
    pagination: response.data,
    filtersApplied: response.filters_applied,
    dropdowns: response.dropdowns,
  }
}

import { buildProfilePath } from '@/lib/profileRoutes'

export function mapPublicCardProfileUrl(slug: string, fallback?: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}${buildProfilePath(slug)}`
  }
  return fallback ?? `https://vbiz.me/${slug}`
}

export type PublicCardListItem = {
  id: number
  name: string
  profession: string
  img: string
  slug: string
}

export function mapPublicCardToListItem(card: PublicCard): PublicCardListItem {
  return {
    id: card.id,
    name: card.name,
    profession: card.profession ?? 'Professional',
    img: card.image,
    slug: card.slug,
  }
}
