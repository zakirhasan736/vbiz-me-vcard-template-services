'use client'

import { useAppDispatch } from '@/hooks/redux'
import type { NavBarNavItem, ProfileNavContentKey } from '@/lib/vcardNavbar'
import { NAV_SECTION_API_CHECKS } from '@/profile-app/lib/navSectionDataChecks'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
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
 * How many section probes run at once. Keeps the on-load fetch off the
 * backend's rate limiter (avoids a single burst of ~30+ simultaneous requests)
 * while still resolving tab visibility quickly.
 */
const PROBE_CONCURRENCY = 4

/**
 * Probes every API-backed nav section's content endpoint on mount so empty tabs
 * can be hidden silently — without the user having to open them first.
 *
 * Probes run through a small concurrency pool so we never fire the whole burst
 * at once (which would hammer the backend and trip its 429 rate limiter). Each
 * fetched result is cached by RTK (1h), so opening the tab afterwards reuses the
 * data with no extra request. Sections confirmed empty are reported via
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
    let cancelled = false
    let cursor = 0

    const probeOne = async (key: ProfileNavContentKey) => {
      const check = NAV_SECTION_API_CHECKS[key]
      if (!check) return

      // Sections without a custom arg resolver need the profile id; skip until ready.
      if (!check.getArg && !profileId) return

      const endpoint = endpoints[check.endpointName]
      if (!endpoint?.initiate) return

      const arg = check.getArg ? check.getArg(profileId) : profileId
      const subscription = dispatch(endpoint.initiate(arg) as never) as unknown as QuerySubscription
      subscriptions.push(subscription)

      try {
        const data = await subscription.unwrap()
        if (!cancelled && data != null && !check.hasData(data)) {
          markSectionEmpty(key)
        }
      } catch {
        // Network/parse failures (incl. exhausted 429 retries) leave the tab
        // visible; the section's own empty-state handles it when opened.
      }
    }

    const worker = async () => {
      while (!cancelled && cursor < probeKeys.length) {
        const key = probeKeys[cursor++]
        await probeOne(key)
      }
    }

    const poolSize = Math.min(PROBE_CONCURRENCY, probeKeys.length)
    for (let i = 0; i < poolSize; i++) void worker()

    return () => {
      cancelled = true
      for (const subscription of subscriptions) subscription.unsubscribe?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, markSectionEmpty, profileId, probeSignature])
}
