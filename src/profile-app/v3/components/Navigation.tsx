'use client'

import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

interface Tab {
  id: string
  icon: LucideIcon
  label: string
}

interface NavigationProps {
  tabs: Tab[]
  activeTab: string
  setActiveTab: (id: string) => void
  theme?: string
}

export const Navigation: React.FC<NavigationProps> = ({ tabs, activeTab, setActiveTab, theme }) => {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const [dragged, setDragged] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  // Scroll visibility states
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollLimits = () => {
    if (!containerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4)
  }

  useEffect(() => {
    const el = containerRef.current
    if (el) {
      checkScrollLimits()
      el.addEventListener('scroll', checkScrollLimits)
      window.addEventListener('resize', checkScrollLimits)
    }
    // Set up initial check after a brief layout render
    const timer = setTimeout(checkScrollLimits, 250)
    return () => {
      if (el) {
        el.removeEventListener('scroll', checkScrollLimits)
      }
      window.removeEventListener('resize', checkScrollLimits)
      clearTimeout(timer)
    }
  }, [tabs, activeTab])

  const onMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return
    isDragging.current = true
    setIsPressed(true)
    startX.current = e.pageX - containerRef.current.offsetLeft
    scrollLeft.current = containerRef.current.scrollLeft
    setDragged(false)
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - containerRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5 // Speed multiplier
    if (Math.abs(walk) > 5) {
      setDragged(true)
    }
    containerRef.current.scrollLeft = scrollLeft.current - walk
  }

  const onMouseUpOrLeave = () => {
    isDragging.current = false
    setIsPressed(false)
  }

  const handleScrollClick = (direction: 'left' | 'right') => {
    if (!containerRef.current) return
    const { scrollWidth, clientWidth } = containerRef.current
    containerRef.current.scrollTo({
      left: direction === 'left' ? 0 : scrollWidth - clientWidth,
      behavior: 'smooth',
    })
  }

  return (
    <div className="relative flex w-full items-center justify-center">
      {/* Left Chevron Indicator for Mobile */}
      <AnimatePresence>
        {canScrollLeft && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => handleScrollClick('left')}
            className={`absolute left-0 z-30 flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-90 ${
              theme === 'dark'
                ? 'border-gold/30 text-gold bg-zinc-950/90'
                : 'border-zinc-200 bg-white/95 text-zinc-900 shadow-sm'
            }`}
            title="Scroll left"
          >
            <ChevronLeft size={14} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        ref={containerRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUpOrLeave}
        onMouseLeave={onMouseUpOrLeave}
        className={`no-scrollbar flex w-full touch-pan-x items-center gap-3 overflow-x-auto scroll-smooth px-6 py-0.5 select-none md:w-auto md:gap-3.5 md:px-2 ${
          isPressed ? 'scale-[0.995] cursor-grabbing' : 'cursor-grab'
        } transition-all duration-150`}
        style={{ scrollbarWidth: 'none' }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          const isHovered = hoveredTab === tab.id

          return (
            <motion.button
              layout="position"
              key={tab.id}
              onClick={() => {
                if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  navigator.vibrate(10)
                }
                if (!dragged) {
                  setActiveTab(tab.id)
                  // Scroll selected element into view smoothly on mobile
                  if (containerRef.current) {
                    const buttonEl = document.getElementById(`tab-btn-${tab.id}`)
                    if (buttonEl) {
                      buttonEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
                    }
                  }
                }
              }}
              id={`tab-btn-${tab.id}`}
              onMouseEnter={() => setHoveredTab(tab.id)}
              onMouseLeave={() => setHoveredTab(null)}
              className="focus-visible:ring-gold/60 relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] transition-all duration-300 outline-none focus-visible:ring-1 active:scale-95 md:h-12 md:w-12 md:rounded-[14px]"
              title={tab.label}
            >
              {/* Hover highlight with animated layout transition */}
              {isHovered && !isActive && (
                <motion.div
                  layoutId="hoverIndicator"
                  className={`absolute inset-0 rounded-[12px] border md:rounded-[14px] ${
                    theme === 'dark'
                      ? 'bg-ocean-light/30 border-gold/20 shadow-[0_2px_10px_rgba(22,54,95,0.2)]'
                      : 'bg-gold/10 border-gold/20 shadow-[0_2px_10px_rgba(238,214,119,0.1)]'
                  }`}
                  transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                />
              )}

              {/* Active selection with sliding spring transition, rounded cover, and custom colors */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className={`absolute inset-0 rounded-[12px] border shadow-sm md:rounded-[14px] ${
                    theme === 'dark'
                      ? 'bg-ocean-dark border-gold/80 shadow-ocean-dark/40'
                      : 'bg-gold/10 border-gold shadow-gold/5'
                  }`}
                  transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                />
              )}

              {/* Icon & Label Container */}
              <div className="relative z-10 flex items-center justify-center">
                <tab.icon
                  size={20}
                  className={`h-5 w-5 md:h-5 md:w-5 ${
                    isActive
                      ? theme === 'dark'
                        ? 'text-gold'
                        : 'font-extrabold text-zinc-950'
                      : 'dark:hover:text-gold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
                  } transition-colors duration-200`}
                  strokeWidth={isActive ? 2.5 : 2}
                  fill={isActive ? 'currentColor' : 'none'}
                  fillOpacity={isActive ? 0.25 : 0}
                />
              </div>

              {/* Mobile Active Bottom Golden Dot */}
              {isActive && (
                <span className="bg-gold absolute bottom-[2px] left-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 animate-pulse rounded-full md:hidden" />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Right Chevron Indicator for Mobile */}
      <AnimatePresence>
        {canScrollRight && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => handleScrollClick('right')}
            className={`absolute right-0 z-30 flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur-md transition-all active:scale-90 ${
              theme === 'dark'
                ? 'border-gold/30 text-gold bg-zinc-950/90'
                : 'border-zinc-200 bg-white/95 text-zinc-900 shadow-sm'
            }`}
            title="Scroll right"
          >
            <ChevronRight size={14} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
