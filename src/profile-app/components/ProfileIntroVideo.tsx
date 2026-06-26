'use client'

import { forwardRef, useEffect, useRef } from 'react'

type Props = {
  src: string
  className?: string
  onEnded?: () => void
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T | null) => {
    for (const ref of refs) {
      if (typeof ref === 'function') ref(value)
      else if (ref) (ref as React.MutableRefObject<T | null>).current = value
    }
  }
}

/**
 * Intro preloader video — autoplays muted (browser policy); user unmutes via the overlay control.
 */
export const ProfileIntroVideo = forwardRef<HTMLVideoElement, Props>(function ProfileIntroVideo(
  { src, className, onEnded },
  forwardedRef
) {
  const internalRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = internalRef.current
    if (!el) return

    el.muted = true

    const tryPlay = () => {
      if (el.paused) void el.play().catch(() => undefined)
    }

    tryPlay()
    el.addEventListener('canplay', tryPlay, { once: true })

    return () => {
      el.removeEventListener('canplay', tryPlay)
    }
  }, [src])

  return (
    <video
      ref={mergeRefs(internalRef, forwardedRef)}
      key={src}
      src={src}
      className={className}
      autoPlay
      muted
      playsInline
      onEnded={onEnded}
    />
  )
})
