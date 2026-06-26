'use client'

import { DEFAULT_PROFILE_SLUG } from '@/lib/constants/profile'
import { myCardApi } from '@/redux/api/myCardApi'
import { navBarLinksApi } from '@/redux/features/navbar/navbar.api'
import { store } from '@/redux/store'
import { useEffect } from 'react'

/** Warms the RTK Query cache for the default profile and navbar links. */
export function ProfilePrefetch({ slug = DEFAULT_PROFILE_SLUG }: { slug?: string }) {
  useEffect(() => {
    const trimmed = slug.trim()
    if (!trimmed) return
    store.dispatch(myCardApi.endpoints.getMyCardBySlug.initiate(trimmed))
    store.dispatch(navBarLinksApi.endpoints.getNavBarLinks.initiate())
  }, [slug])

  return null
}
