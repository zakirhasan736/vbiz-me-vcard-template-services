'use client'

import { useAppSelector } from '@/hooks/redux'
import type { ProfileNavContentKey } from '@/lib/vcardNavbar'
import { NAV_SECTION_API_CHECKS } from '@/profile-app/lib/navSectionDataChecks'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useProfileNavigation } from '@/profile-app/providers/ProfileNavigationProvider'
import { api } from '@/redux/api/api'
import type { RootState } from '@/redux/store'
import { useEffect } from 'react'

type EndpointSelector = {
  select: (arg: unknown) => (state: RootState) => {
    status: string
    data?: unknown
    error?: unknown
  }
}

/**
 * Watches the RTK cache for the active section (no extra network call).
 * The section component's `useGet*Query` hook does the fetch when the tab opens;
 * once cached, revisiting the tab reuses data without refetching.
 */
export function useActiveSectionDataReporter(contentKey: ProfileNavContentKey) {
  const { cardOwnerId } = useProfileDisplay()
  const { markSectionEmpty } = useProfileNavigation()
  const profileId = cardOwnerId?.trim() ?? ''
  const check = NAV_SECTION_API_CHECKS[contentKey]

  const queryState = useAppSelector((state) => {
    if (!check || !profileId) return null
    const endpoints = api.endpoints as Record<string, EndpointSelector>
    const endpoint = endpoints[check.endpointName]
    if (!endpoint?.select) return null
    const arg = check.getArg ? check.getArg(profileId) : profileId
    return endpoint.select(arg)(state)
  })

  useEffect(() => {
    if (!check || !queryState) return
    if (queryState.status !== 'fulfilled') return
    if (queryState.error) return
    if (queryState.data == null) return
    if (!check.hasData(queryState.data)) {
      markSectionEmpty(contentKey)
    }
  }, [check, contentKey, markSectionEmpty, queryState])
}
