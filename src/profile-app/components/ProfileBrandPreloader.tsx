'use client'

import { isVideoUrl } from '@/lib/mediaUrl'
import { notifyProfileExperienceSettled } from '@/lib/push/notificationExperience'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { cleanProfileFieldValue } from '@/profile-app/lib/profileHomeData'
import { useProfileNavigation } from '@/profile-app/providers/ProfileNavigationProvider'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'

/** Minimum time the brand splash stays up, so it never flickers on fast loads. */
const MIN_VISIBLE_MS = 650

function resolveBrandName(fullName: string, company: string): string {
  const brand = company.trim() || fullName.trim()
  return brand ? cleanProfileFieldValue(brand) : 'vBiz'
}

function resolveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'V'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Branded splash on every fresh visit / hard reload.
 * Always mounts visible, then dismisses after MIN_VISIBLE_MS once nav catalog is ready.
 * Background empty-tab filtering does not extend this screen.
 */
export function ProfileBrandPreloader() {
  const { isNavLoading, visibleTabs, navItems } = useProfileNavigation()
  const { personal, homeMedia, design, embedded } = useProfileDisplay()

  const navReady = !isNavLoading && (visibleTabs.length > 0 || navItems.length === 0)
  const [visible, setVisible] = useState(() => !embedded)
  const [minElapsed, setMinElapsed] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (embedded || !navReady || !minElapsed) return
    const timer = window.setTimeout(() => {
      setVisible(false)
      notifyProfileExperienceSettled()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [embedded, navReady, minElapsed])

  const brandName = useMemo(
    () => resolveBrandName(personal.fullName, personal.company),
    [personal.fullName, personal.company]
  )
  const initials = useMemo(() => resolveInitials(brandName), [brandName])
  const accent = design?.accentColor ?? '#eab308'
  const isDark = design?.darkMode ?? true
  const logo = homeMedia.profileMedia?.trim() ?? ''
  const showLogoImage = Boolean(logo) && !isVideoUrl(logo)
  const tagline = (personal.profession || personal.designation || '').trim()

  if (embedded) return null

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="brand-preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className={`fixed inset-0 z-[190] flex flex-col items-center justify-center ${
            isDark ? 'bg-[#050b16] text-white' : 'bg-white text-zinc-900'
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 18 }}
              className="relative flex h-24 w-24 items-center justify-center"
            >
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-3xl"
                style={{ border: `2px solid ${accent}`, opacity: 0.35 }}
                animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0, 0.35] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div
                className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl text-2xl font-black shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${accent}, color-mix(in srgb, ${accent} 60%, #000))`,
                  color: '#0b0b0b',
                }}
              >
                {showLogoImage ? (
                  <Image src={logo} alt={brandName} width={96} height={96} className="h-full w-full object-cover" />
                ) : (
                  <span className="notranslate">{initials}</span>
                )}
              </div>
            </motion.div>

            <div className="flex flex-col items-center gap-1.5 overflow-hidden">
              <motion.h1
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="notranslate max-w-[80vw] truncate text-center text-2xl font-black tracking-tight"
              >
                {brandName}
              </motion.h1>
              {tagline ? (
                <motion.p
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className={`max-w-[70vw] truncate text-center text-xs font-semibold tracking-[0.25em] uppercase ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  {tagline}
                </motion.p>
              ) : null}
            </div>

            <div className={`mt-2 h-[3px] w-40 overflow-hidden rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
              <motion.div
                className="h-full w-1/2 rounded-full"
                style={{ background: accent }}
                animate={{ x: ['-100%', '220%'] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
