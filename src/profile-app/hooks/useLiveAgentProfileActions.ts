'use client'

import {
  LIVE_AGENT_GO_TO_SECTION,
  LIVE_AGENT_OPEN_SAVE_CONTACT,
} from '@/profile-app/lib/liveAgentEvents'
import { useProfileNavigation } from '@/profile-app/providers/ProfileNavigationProvider'
import { useEffect } from 'react'

type SectionEventDetail = {
  sectionId?: string
}

/** Wires live-agent custom events to profile UI (save contact modal, section nav). */
export function useLiveAgentProfileActions(
  onOpenSaveContact: () => void
) {
  const { goToSection } = useProfileNavigation()

  useEffect(() => {
    const handleOpenSaveContact = () => onOpenSaveContact()
    const handleGoToSection = (event: Event) => {
      const sectionId = (event as CustomEvent<SectionEventDetail>).detail?.sectionId ?? 'home'
      goToSection(sectionId)
    }

    window.addEventListener(LIVE_AGENT_OPEN_SAVE_CONTACT, handleOpenSaveContact)
    window.addEventListener(LIVE_AGENT_GO_TO_SECTION, handleGoToSection)

    return () => {
      window.removeEventListener(LIVE_AGENT_OPEN_SAVE_CONTACT, handleOpenSaveContact)
      window.removeEventListener(LIVE_AGENT_GO_TO_SECTION, handleGoToSection)
    }
  }, [goToSection, onOpenSaveContact])
}
