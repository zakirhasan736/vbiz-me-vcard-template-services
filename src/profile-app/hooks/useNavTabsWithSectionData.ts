'use client'

import type { NavBarNavItem, ProfileNavContentKey } from '@/lib/vcardNavbar'
import { resolveLocalNavSectionHasData } from '@/profile-app/lib/navSectionDataChecks'
import type { VCardEducationEntry, VCardExperienceEntry } from '@/types/vcard'
import { useCallback, useMemo, useState } from 'react'

type UseNavTabsWithSectionDataOptions = {
  education: VCardEducationEntry[]
  experience: VCardExperienceEntry[]
}

/**
 * Nav tab visibility without upfront API probes.
 *
 * - All backend-active tabs show immediately (no burst of /dynamic-section calls).
 * - Section components fetch via RTK only when their tab is active (cached 1h).
 * - Tabs are hidden only after the user opens them and the section is confirmed empty.
 */
export function useNavTabsWithSectionData(
  navItems: NavBarNavItem[],
  { education, experience }: UseNavTabsWithSectionDataOptions
) {
  const [emptySectionKeys, setEmptySectionKeys] = useState<Set<ProfileNavContentKey>>(() => new Set())

  const markSectionEmpty = useCallback((key: ProfileNavContentKey) => {
    setEmptySectionKeys((prev) => {
      if (prev.has(key)) return prev
      const next = new Set(prev)
      next.add(key)
      return next
    })
  }, [])

  const navItemHasSectionData = useMemo(() => {
    return (item: NavBarNavItem) => {
      const key = item.profileContent
      const local = resolveLocalNavSectionHasData(key, education, experience)
      if (local !== undefined) return local
      if (emptySectionKeys.has(key)) return false
      return true
    }
  }, [education, experience, emptySectionKeys])

  const tabsWithData = useMemo(
    () => navItems.filter((item) => navItemHasSectionData(item)),
    [navItemHasSectionData, navItems]
  )

  return { tabsWithData, markSectionEmpty }
}
