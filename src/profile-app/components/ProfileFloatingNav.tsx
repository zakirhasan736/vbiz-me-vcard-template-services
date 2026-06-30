'use client'

import type { ReactNode } from 'react'

type ProfileFloatingNavProps = {
  theme: 'light' | 'dark'
  children: ReactNode
}

/** Shared v1/v3 floating navbar chrome — single source for layout + theme classes. */
export function ProfileFloatingNav({ theme, children }: ProfileFloatingNavProps) {
  return (
    <div className="pointer-events-none fixed bottom-1 left-0 z-100 w-full px-2 md:top-5 md:bottom-auto md:px-20">
      <div
        className={`pointer-events-auto relative mx-auto flex max-w-[1032px] items-center justify-center rounded-[14px] px-2 py-2 md:rounded-[20px] ${
          theme === 'dark'
            ? 'border-gold/30 bg-ocean-dark/85 border text-zinc-100 backdrop-blur-xl'
            : 'border-gold/40 border bg-white/95 text-zinc-900 backdrop-blur-xl'
        }`}
      >
        <div className="no-scrollbar flex flex-1 justify-center overflow-x-auto">{children}</div>
      </div>
    </div>
  )
}
