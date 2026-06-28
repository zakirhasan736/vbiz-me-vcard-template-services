'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

type ProfileNavScrollArrowsProps = {
  canScrollLeft: boolean
  canScrollRight: boolean
  onScroll: (direction: 'left' | 'right') => void
  variant: 'v1' | 'v2'
  theme?: 'light' | 'dark'
}

const arrowBase =
  'absolute top-1/2 z-30 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-90'

function arrowClassName(variant: 'v1' | 'v2', theme: 'light' | 'dark'): string {
  if (variant === 'v1') {
    return theme === 'dark'
      ? `${arrowBase} border-white/15 bg-black/90 text-white/80`
      : `${arrowBase} border-black/10 bg-white/95 text-gray-700 shadow-sm`
  }

  return `${arrowBase} border-zinc-200/80 bg-white/95 text-zinc-700 shadow-sm dark:border-zinc-600/50 dark:bg-zinc-900/95 dark:text-zinc-200`
}

export function ProfileNavScrollArrows({
  canScrollLeft,
  canScrollRight,
  onScroll,
  variant,
  theme = 'dark',
}: ProfileNavScrollArrowsProps) {
  const className = arrowClassName(variant, theme)

  return (
    <>
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onScroll('left')}
            className={`${className} left-0`}
            title="Scroll left"
            aria-label="Scroll navigation left"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onScroll('right')}
            className={`${className} right-0`}
            title="Scroll right"
            aria-label="Scroll navigation right"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
