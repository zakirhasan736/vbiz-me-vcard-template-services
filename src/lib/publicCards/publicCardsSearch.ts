import type { PublicCardsFiltersApplied, PublicCardsSearchParams } from '@interfaces/api/publicCards'

export type PublicCardsFilterState = {
  stateId: number | null
  cityId: number | null
  professionId: number | null
  service: string
}

export const EMPTY_PUBLIC_CARDS_FILTERS: PublicCardsFilterState = {
  stateId: null,
  cityId: null,
  professionId: null,
  service: '',
}

export function hasActivePublicCardsFilters(filters: PublicCardsFilterState): boolean {
  return (
    filters.stateId != null ||
    filters.cityId != null ||
    filters.professionId != null ||
    filters.service.trim().length > 0
  )
}

export function buildPublicCardsSearchParams(filters: PublicCardsFilterState, page?: number): PublicCardsSearchParams {
  const params: PublicCardsSearchParams = {}

  if (page != null && page > 0) params.page = page
  if (filters.stateId != null) params.state_id = filters.stateId
  if (filters.cityId != null) params.city_id = filters.cityId
  if (filters.professionId != null) params.profession_id = filters.professionId

  const service = filters.service.trim()
  if (service) params.service = service

  return params
}

export function buildPublicCardsQueryPath(params?: PublicCardsSearchParams): string {
  const search = new URLSearchParams()

  if (params?.page) search.set('page', String(params.page))
  if (params?.state_id) search.set('state_id', String(params.state_id))
  if (params?.city_id) search.set('city_id', String(params.city_id))
  if (params?.profession_id) search.set('profession_id', String(params.profession_id))
  if (params?.service) search.set('service', params.service)

  const qs = search.toString()
  return `/public-cards${qs ? `?${qs}` : ''}`
}

export function parsePublicCardsFiltersApplied(applied?: PublicCardsFiltersApplied): PublicCardsFilterState {
  if (!applied) return { ...EMPTY_PUBLIC_CARDS_FILTERS }

  return {
    stateId: applied.state_id ? Number(applied.state_id) : null,
    cityId: applied.city_id ? Number(applied.city_id) : null,
    professionId: applied.profession_id ? Number(applied.profession_id) : null,
    service: applied.service ?? '',
  }
}

export function updatePublicCardsFilter<K extends keyof PublicCardsFilterState>(
  filters: PublicCardsFilterState,
  key: K,
  value: PublicCardsFilterState[K]
): PublicCardsFilterState {
  const next = { ...filters, [key]: value }

  if (key === 'stateId') {
    next.cityId = null
  }

  return next
}
