'use client'

import { mapPublicCardToListItem, type PublicCardListItem } from '@/lib/api/publicCards/mapPublicCards'
import {
  buildPublicCardsSearchParams,
  EMPTY_PUBLIC_CARDS_FILTERS,
  hasActivePublicCardsFilters,
  updatePublicCardsFilter,
  type PublicCardsFilterState,
} from '@/lib/publicCards/publicCardsSearch'
import { useGetPublicCardsQuery, useLazyGetPublicCardsQuery } from '@/redux/api'
import type { PublicCardsDropdowns } from '@interfaces/api/publicCards'
import { useCallback, useMemo, useState } from 'react'

function resetPagination(setters: {
  setExtraCards: (value: PublicCardListItem[]) => void
  setLoadedThroughPage: (value: number) => void
}) {
  setters.setExtraCards([])
  setters.setLoadedThroughPage(1)
}

export function usePublicCardsDirectory() {
  const [draftFilters, setDraftFilters] = useState<PublicCardsFilterState>(EMPTY_PUBLIC_CARDS_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState<PublicCardsFilterState>(EMPTY_PUBLIC_CARDS_FILTERS)
  const [extraCards, setExtraCards] = useState<PublicCardListItem[]>([])
  const [loadedThroughPage, setLoadedThroughPage] = useState(1)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const queryParams = useMemo(() => buildPublicCardsSearchParams(appliedFilters, 1), [appliedFilters])

  const { data, isLoading, isFetching, error } = useGetPublicCardsQuery(queryParams)
  const [fetchPublicCards] = useLazyGetPublicCardsQuery()

  const dropdowns: PublicCardsDropdowns = data?.dropdowns ?? {}

  const firstCards = useMemo(() => data?.cards.map(mapPublicCardToListItem) ?? [], [data?.cards])
  const cards = useMemo(() => [...firstCards, ...extraCards], [firstCards, extraCards])
  const hasMore = data ? loadedThroughPage < data.pagination.last_page : false

  const setDraftFilter = useCallback(
    <K extends keyof PublicCardsFilterState>(key: K, value: PublicCardsFilterState[K]) => {
      setDraftFilters((prev) => updatePublicCardsFilter(prev, key, value))
    },
    []
  )

  const applyFilters = useCallback(() => {
    const nextApplied = { ...draftFilters, service: draftFilters.service.trim() }
    setDraftFilters(nextApplied)
    setAppliedFilters(nextApplied)
    resetPagination({ setExtraCards, setLoadedThroughPage })
  }, [draftFilters])

  const updateAndApplyFilter = useCallback(
    <K extends keyof PublicCardsFilterState>(key: K, value: PublicCardsFilterState[K]) => {
      setDraftFilters((prev) => {
        const next = updatePublicCardsFilter(prev, key, value)
        const applied = { ...next, service: next.service.trim() }
        setAppliedFilters(applied)
        resetPagination({ setExtraCards, setLoadedThroughPage })
        return next
      })
    },
    []
  )

  const clearFilters = useCallback(() => {
    setDraftFilters(EMPTY_PUBLIC_CARDS_FILTERS)
    setAppliedFilters(EMPTY_PUBLIC_CARDS_FILTERS)
    resetPagination({ setExtraCards, setLoadedThroughPage })
  }, [])

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return

    setIsLoadingMore(true)
    try {
      const nextPage = loadedThroughPage + 1
      const result = await fetchPublicCards(buildPublicCardsSearchParams(appliedFilters, nextPage)).unwrap()
      setExtraCards((prev) => [...prev, ...result.cards.map(mapPublicCardToListItem)])
      setLoadedThroughPage(nextPage)
    } finally {
      setIsLoadingMore(false)
    }
  }, [appliedFilters, fetchPublicCards, hasMore, isLoadingMore, loadedThroughPage])

  return {
    cards,
    dropdowns,
    draftFilters,
    appliedFilters,
    hasActiveFilters: hasActivePublicCardsFilters(appliedFilters),
    isLoading,
    isFetching,
    isLoadingMore,
    isSearching: isFetching && !isLoading,
    error,
    hasMore,
    total: data?.pagination.total ?? 0,
    setDraftFilter,
    applyFilters,
    updateAndApplyFilter,
    clearFilters,
    loadMore,
  }
}
