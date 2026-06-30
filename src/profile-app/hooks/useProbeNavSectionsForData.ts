'use client'

import type { NavBarNavItem, ProfileNavContentKey } from '@/lib/vcardNavbar'
import { NAV_SECTION_API_CHECKS } from '@/profile-app/lib/navSectionDataChecks'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useAppDispatch } from '@/hooks/redux'
import { api } from '@/redux/api/api'
import { useEffect, useMemo } from 'react'

type QuerySubscription = {
  unwrap: () => Promise<unknown>
  unsubscribe?: () => void
}

type InitiableEndpoint = {
  initiate: (arg: unknown) => unknown
}

/**
 * Probes every API-backed nav section's content endpoint on mount so empty tabs
 * can be hidden silently — without the user having to open them first.
 *
 * Each fetched result is cached by RTK (1h), so opening the tab afterwards reuses
 * the data with no extra request. Sections confirmed empty are reported via
 * `markSectionEmpty`, mirroring `useActiveSectionDataReporter`.
 */
export function useProbeNavSectionsForData(
  navItems: NavBarNavItem[],
  markSectionEmpty: (key: ProfileNavContentKey) => void
) {
  const dispatch = useAppDispatch()
  const { cardOwnerId } = useProfileDisplay()
  const profileId = cardOwnerId?.trim() ?? ''

  const probeKeys = useMemo(() => {
    const keys = new Set<ProfileNavContentKey>()
    for (const item of navItems) {
      if (NAV_SECTION_API_CHECKS[item.profileContent]) keys.add(item.profileContent)
    }
    return Array.from(keys)
  }, [navItems])

  const probeSignature = probeKeys.join('|')

  useEffect(() => {
    const endpoints = api.endpoints as unknown as Record<string, InitiableEndpoint>
    const subscriptions: QuerySubscription[] = []

    for (const key of probeKeys) {
      const check = NAV_SECTION_API_CHECKS[key]
      if (!check) continue

      // Sections without a custom arg resolver need the profile id; skip until ready.
      if (!check.getArg && !profileId) continue

      const endpoint = endpoints[check.endpointName]
      if (!endpoint?.initiate) continue

      const arg = check.getArg ? check.getArg(profileId) : profileId
      const subscription = dispatch(endpoint.initiate(arg) as never) as unknown as QuerySubscription
      subscriptions.push(subscription)

      subscription
        .unwrap()
        .then((data) => {
          if (data != null && !check.hasData(data)) {
            markSectionEmpty(key)
          }
        })
        .catch(() => {
          // Network/parse failures leave the tab visible; the section's own
          // empty-state handling takes over when the user opens it.
        })
    }

    return () => {
      for (const subscription of subscriptions) subscription.unsubscribe?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, markSectionEmpty, profileId, probeSignature])
}
