'use client'

import { mapNavBarLinks } from '@/lib/api/navbar/mapNavBarLinks'
import { DEFAULT_PROFILE_SECTION } from '@/lib/profileRoutes'
import { getNavItemById, type NavBarNavItem } from '@/lib/vcardNavbar'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useGetNavBarLinksQuery } from '@/redux/api'
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

type ProfileNavigationContextValue = {
  navItems: NavBarNavItem[]
  visibleTabs: NavBarNavItem[]
  activeSectionId: string
  goToSection: (tabId: string) => void
  getNavItem: (tabId: string) => NavBarNavItem | undefined
  isNavLoading: boolean
}

const ProfileNavigationContext = createContext<ProfileNavigationContextValue | null>(null)

function resolveActiveSection(sectionId: string, visibleTabs: NavBarNavItem[]): string {
  if (visibleTabs.length === 0) return sectionId
  return visibleTabs.some((t) => t.id === sectionId) ? sectionId : visibleTabs[0].id
}

type Props = {
  children: ReactNode
  sectionId?: string
  onSectionChange?: (sectionId: string) => void
}

/** Client-side section nav — no URL / route changes. */
export function ProfileNavigationProvider({ children, sectionId = DEFAULT_PROFILE_SECTION, onSectionChange }: Props) {
  const { settings: displaySettings } = useProfileDisplay()
  const { data: navBarLinks, isLoading: isNavLoading, isError: isNavError } = useGetNavBarLinksQuery()

  const navItems = useMemo(() => {
    if (isNavError || !navBarLinks) return []
    return mapNavBarLinks(navBarLinks)
  }, [navBarLinks, isNavError])

  // Navbar tabs come from GET /post-types only (StaticLink.active + post_types.status).
  const visibleTabs = useMemo(() => {
    if (!displaySettings.globalEnabled) return []
    return navItems
  }, [navItems, displaySettings.globalEnabled])

  const getNavItem = useCallback((tabId: string) => getNavItemById(tabId, navItems), [navItems])

  const [localSectionId, setLocalSectionId] = useState<string | null>(null)
  const [prevSectionId, setPrevSectionId] = useState(sectionId)

  if (sectionId !== prevSectionId) {
    setPrevSectionId(sectionId)
    setLocalSectionId(null)
  }

  const activeSectionId = resolveActiveSection(localSectionId ?? sectionId, visibleTabs)

  const goToSection = useCallback(
    (tabId: string) => {
      const nextId = resolveActiveSection(tabId, visibleTabs)
      setLocalSectionId(nextId)
      onSectionChange?.(nextId)
    },
    [onSectionChange, visibleTabs]
  )

  const value = useMemo<ProfileNavigationContextValue>(
    () => ({
      navItems,
      visibleTabs,
      activeSectionId,
      goToSection,
      getNavItem,
      isNavLoading,
    }),
    [navItems, visibleTabs, activeSectionId, goToSection, getNavItem, isNavLoading]
  )

  return <ProfileNavigationContext.Provider value={value}>{children}</ProfileNavigationContext.Provider>
}

export function useProfileNavigation(): ProfileNavigationContextValue {
  const ctx = useContext(ProfileNavigationContext)
  if (!ctx) {
    throw new Error('useProfileNavigation must be used within ProfileNavigationProvider')
  }
  return ctx
}
