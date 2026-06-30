'use client'

import { useAppDispatch } from '@/hooks/redux'
import type { NavBarNavItem, ProfileNavContentKey } from '@/lib/vcardNavbar'
import {
  collectNavSectionApiKeys,
  NAV_SECTION_API_CHECKS,
  resolveLocalNavSectionHasData,
} from '@/profile-app/lib/navSectionDataChecks'
import { api } from '@/redux/api/api'
import type { AppDispatch } from '@/redux/store'
import type { VCardEducationEntry, VCardExperienceEntry } from '@/types/vcard'
import { useEffect, useMemo, useState } from 'react'

type InitiateArg = string | undefined

type SectionQuerySubscription = {
  unsubscribe: () => void
  then: (
    onfulfilled?: (value: { data?: unknown; error?: unknown }) => unknown
  ) => Promise<{ data?: unknown; error?: unknown }>
}

function initiateNavSectionQuery(
  dispatch: AppDispatch,
  endpointName: string,
  arg: InitiateArg
): SectionQuerySubscription {
  const endpoints = api.endpoints as Record<string, { initiate: (a: InitiateArg) => unknown }>
  return dispatch(endpoints[endpointName].initiate(arg) as never) as SectionQuerySubscription
}

/** Max section probes in flight at once — keeps us under the backend rate limit (429). */
const PROBE_CONCURRENCY = 4

/**
 * Run async tasks with a fixed concurrency cap, preserving input order in the
 * results array. Prevents firing all ~35 section probes at once.
 */
async function runWithConcurrency<T>(
  tasks: ReadonlyArray<() => Promise<T>>,
  limit: number,
  shouldStop: () => boolean
): Promise<T[]> {
  const results = new Array<T>(tasks.length)
  let cursor = 0

  async function worker() {
    while (true) {
      if (shouldStop()) return
      const index = cursor++
      if (index >= tasks.length) return
      results[index] = await tasks[index]()
    }
  }

  const workerCount = Math.min(limit, tasks.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))
  return results
}

type UseNavTabsWithSectionDataOptions = {
  profileId: string
  education: VCardEducationEntry[]
  experience: VCardExperienceEntry[]
}

/**
 * Background probe: checks which nav sections have published content.
 * Does not block the preloader — caller shows all API tabs until probe completes.
 */
export function useNavTabsWithSectionData(
  navItems: NavBarNavItem[],
  { profileId, education, experience }: UseNavTabsWithSectionDataOptions
) {
  const dispatch = useAppDispatch()
  const trimmedProfileId = profileId.trim()

  const apiContentKeys = useMemo(
    () => collectNavSectionApiKeys(navItems.map((item) => item.profileContent)),
    [navItems]
  )

  const apiContentKeysKey = apiContentKeys.join('|')
  const shouldProbe = Boolean(trimmedProfileId && apiContentKeys.length > 0)

  const [sectionDataByKey, setSectionDataByKey] = useState<Map<ProfileNavContentKey, boolean>>(() => new Map())
  const [probeStatus, setProbeStatus] = useState<'idle' | 'checking' | 'done'>('idle')

  useEffect(() => {
    let cancelled = false
    const openSubscriptions: SectionQuerySubscription[] = []

    if (!shouldProbe) {
      const timer = window.setTimeout(() => {
        if (cancelled) return
        setSectionDataByKey(new Map())
        setProbeStatus('done')
      }, 0)
      return () => {
        cancelled = true
        window.clearTimeout(timer)
      }
    }

    const tasks = apiContentKeys.map((contentKey) => async () => {
      const check = NAV_SECTION_API_CHECKS[contentKey]!
      const arg = (check.getArg ? check.getArg(trimmedProfileId) : trimmedProfileId) as InitiateArg
      const subscription = initiateNavSectionQuery(dispatch, check.endpointName, arg)
      openSubscriptions.push(subscription)
      const result = await subscription

      // Confirmed empty only when the request succeeded and returned no data.
      // On any error (e.g. 429 rate limit), keep the tab visible — we can't
      // prove it's empty, and hiding active tabs is worse than showing one.
      if (result.error) {
        return { contentKey, hasData: true, errored: true }
      }
      if (result.data != null) {
        return { contentKey, hasData: check.hasData(result.data), errored: false }
      }
      return { contentKey, hasData: false, errored: false }
    })

    const timer = window.setTimeout(() => {
      if (cancelled) return
      setProbeStatus('checking')

      void runWithConcurrency(tasks, PROBE_CONCURRENCY, () => cancelled)
        .then((results) => {
          if (cancelled) return
          const map = new Map<ProfileNavContentKey, boolean>()
          for (const result of results) {
            if (result) map.set(result.contentKey, result.hasData)
          }
          setSectionDataByKey(map)
        })
        .finally(() => {
          if (!cancelled) setProbeStatus('done')
        })
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
      openSubscriptions.forEach((subscription) => subscription.unsubscribe())
    }
  }, [apiContentKeys, apiContentKeysKey, dispatch, shouldProbe, trimmedProfileId])

  const isCheckingSectionData = shouldProbe && probeStatus !== 'done'

  const navItemHasSectionData = useMemo(() => {
    return (item: NavBarNavItem) => {
      const key = item.profileContent
      const local = resolveLocalNavSectionHasData(key, education, experience)
      if (local !== undefined) return local
      return sectionDataByKey.get(key) === true
    }
  }, [education, experience, sectionDataByKey])

  const tabsWithData = useMemo(
    () => navItems.filter((item) => navItemHasSectionData(item)),
    [navItemHasSectionData, navItems]
  )

  return { tabsWithData, isCheckingSectionData }
}
