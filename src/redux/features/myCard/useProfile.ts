'use client'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { mapMyCardToVCardRecord } from '@/lib/api/myCard/mapMyCard'
import { DEFAULT_PROFILE_SLUG } from '@/lib/constants/profile'
import { useGetMyCardBySlugQuery } from '@/redux/api/myCardApi'
import { useEffect, useMemo } from 'react'
import {
  selectMyCardRawBySlug,
  selectMyCardRecordBySlug,
  selectProfileActionButtonsBySlug,
  selectProfileFeaturesBySlug,
  selectProfileIdentityBySlug,
  selectProfileMediaBySlug,
} from './myCard.selectors'
import { setActiveProfileSlug } from './myCard.slice'

type UseProfileOptions = {
  /** Skip the network request (read Redux cache only). */
  skip?: boolean
}

/**
 * Single entry point for profile data.
 * RTK Query caches the API response; the myCard slice stores mapped data for fast selector reads.
 */
export function useProfile(slug: string = DEFAULT_PROFILE_SLUG, options?: UseProfileOptions) {
  const dispatch = useAppDispatch()
  const trimmed = slug.trim()
  const skip = options?.skip || !trimmed

  const query = useGetMyCardBySlugQuery(trimmed, { skip })

  useEffect(() => {
    if (!trimmed || skip) return
    dispatch(setActiveProfileSlug(trimmed))
  }, [dispatch, trimmed, skip])

  const cachedRaw = useAppSelector((state) => selectMyCardRawBySlug(state, trimmed))
  const cachedRecord = useAppSelector((state) => selectMyCardRecordBySlug(state, trimmed))
  const identity = useAppSelector((state) => selectProfileIdentityBySlug(state, trimmed))
  const media = useAppSelector((state) => selectProfileMediaBySlug(state, trimmed))
  const features = useAppSelector((state) => selectProfileFeaturesBySlug(state, trimmed))
  const actionButtons = useAppSelector((state) => selectProfileActionButtonsBySlug(state, trimmed))

  const myCard = query.data ?? cachedRaw
  const record = useMemo(() => {
    if (cachedRecord) return cachedRecord
    if (myCard) return mapMyCardToVCardRecord(myCard)
    return null
  }, [cachedRecord, myCard])

  return {
    slug: trimmed,
    myCard,
    record,
    identity,
    media,
    features,
    actionButtons,
    isLoading: !skip && query.isLoading && !myCard,
    isFetching: query.isFetching,
    isError: query.isError,
    isSuccess: Boolean(myCard),
    error: query.error,
  }
}
