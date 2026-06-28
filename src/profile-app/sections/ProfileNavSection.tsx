'use client'

import { getNavDisplayLabel } from '@/lib/vcardNavbar'
import { useProfileNavigation } from '@/profile-app/providers/ProfileNavigationProvider'
import { renderProfileSection, type ProfileTemplateVariant } from '@/profile-app/sections/sectionRegistry'

type HomeHeroProps = {
  theme: 'light' | 'dark'
  onAction: (action: string) => void
  toggleTheme: () => void
}

type ProfileNavSectionProps = {
  tabId: string
  template?: ProfileTemplateVariant
  homeHeroProps?: HomeHeroProps
}

/**
 * Single entry point for all profile sections across v1, v2, and v3.
 * Home sections differ per template; all other sections share the same v3-styled components.
 */
export function ProfileNavSection({ tabId, template = 'v2', homeHeroProps }: ProfileNavSectionProps) {
  const { getNavItem } = useProfileNavigation()
  const item = getNavItem(tabId)
  const contentKey = item?.profileContent ?? 'empty'
  const title = item ? getNavDisplayLabel(item) : tabId

  return renderProfileSection({
    contentKey,
    tabId,
    title,
    template,
    homeHeroProps,
  })
}
