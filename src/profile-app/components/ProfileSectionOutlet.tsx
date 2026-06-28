'use client'

import type { ProfileTemplateVariant } from '@/profile-app/sections'
import { ProfileNavSection } from '@/profile-app/sections'
import { AnimatePresence, motion } from 'motion/react'

type HomeHeroProps = {
  theme: 'light' | 'dark'
  onAction: (action: string) => void
  toggleTheme: () => void
}

type Props = {
  sectionId: string
  template?: ProfileTemplateVariant
  homeHeroProps?: HomeHeroProps
}

/** Animated section pane — only this subtree updates on nav / route changes. */
export function ProfileSectionOutlet({ sectionId, template = 'v2', homeHeroProps }: Props) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={sectionId}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full"
      >
        <ProfileNavSection tabId={sectionId} template={template} homeHeroProps={homeHeroProps} />
      </motion.div>
    </AnimatePresence>
  )
}
