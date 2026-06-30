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
 * Nav tab visibility.
 *
 * - Local sections (home/education/work) are resolved immediately from props.
 * - API-backed sections are probed upfront (see `useProbeNavSectionsForData`);
 *   any confirmed empty is reported via `markSectionEmpty` and filtered out here.
 * - `useActiveSectionDataReporter` still catches empties when a tab is opened.
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
