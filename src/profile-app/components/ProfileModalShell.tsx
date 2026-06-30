'use client'

import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { V1BottomSheet } from '@/profile-app/v1/components/V1BottomSheet'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'

type ProfileModalShellProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  /** Panel wrapper classes (rounding, border, max-width, background). */
  panelClassName?: string
  /** Backdrop container classes for v2/v3 responsive modal. */
  backdropClassName?: string
  backdropId?: string
}

/**
 * Shared popup shell for all profile templates.
 * v1 → bottom sheet on mobile, centered on desktop (V1BottomSheet).
 * v2/v3 → responsive modal (bottom on mobile, centered on desktop).
 */
export function ProfileModalShell({
  isOpen,
  onClose,
  children,
  panelClassName = '',
  backdropClassName = 'fixed inset-0 z-100 flex items-end justify-center bg-black/50 p-0 backdrop-blur-md sm:items-center sm:p-4',
  backdropId,
}: ProfileModalShellProps) {
  const { design } = useProfileDisplay()
  const isV1 = design?.profileTemplate === 'v1'

  useEffect(() => {
    if (!isOpen || isV1) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [isOpen, isV1])

  if (isV1) {
    return (
      <V1BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className={panelClassName}>{children}</div>
      </V1BottomSheet>
    )
  }

  return (
    <AnimatePresence>
      {isOpen ? (
        <div id={backdropId} className={backdropClassName}>
          <div className="absolute inset-0" onClick={onClose} aria-hidden />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative z-10 w-full ${panelClassName}`}
          >
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
