'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { type MouseEvent, useEffect, useRef, useState } from 'react'
import { ProfileIntroVideo } from './ProfileIntroVideo'

const DEFAULT_UNMUTE_VOLUME = 0.5

type Props = {
  videoUrl: string
  onSkip: () => void
  skipLabel?: string
}

export function ProfileIntroPreloader({ videoUrl, onSkip, skipLabel = 'Skip intro' }: Props) {
  const src = videoUrl.trim()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0)

  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevBodyOverflow = body.style.overflow

    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    return () => {
      html.style.overflow = prevHtmlOverflow
      body.style.overflow = prevBodyOverflow
    }
  }, [])

  const applyVolume = (nextVolume: number) => {
    const el = videoRef.current
    if (!el) return

    const clamped = Math.max(0, Math.min(1, nextVolume))
    el.volume = clamped
    setVolume(clamped)

    if (clamped === 0) {
      el.muted = true
      setIsMuted(true)
      return
    }

    el.muted = false
    setIsMuted(false)
  }

  const toggleMute = () => {
    const el = videoRef.current
    if (!el) return

    if (isMuted) {
      const nextVolume = volume > 0 ? volume : DEFAULT_UNMUTE_VOLUME
      applyVolume(nextVolume)
      return
    }

    el.muted = true
    setIsMuted(true)
  }

  const handleVolumeSeek = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const nextVolume = (e.clientX - rect.left) / rect.width
    applyVolume(nextVolume)
  }

  if (!src) return null

  const volumePercent = Math.round(volume * 100)

  return (
    <div className="fixed inset-0 z-200 overflow-hidden bg-black/95 text-white">
      <div className="flex h-full w-full items-center justify-center px-4">
        <ProfileIntroVideo
          ref={videoRef}
          src={src}
          className="max-h-[72vh] w-full max-w-3xl rounded-2xl border border-white/10 bg-black shadow-2xl"
          onEnded={onSkip}
        />
      </div>

      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute intro video' : 'Mute intro video'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${isMuted ? 'max-w-0 opacity-0' : 'max-w-40 opacity-100 sm:max-w-48'}`}
          aria-hidden={isMuted}
        >
          <div
            role="slider"
            tabIndex={isMuted ? -1 : 0}
            aria-label="Intro video volume"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={volumePercent}
            onClick={handleVolumeSeek}
            onKeyDown={(e) => {
              if (isMuted) return
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault()
                applyVolume(volume - 0.05)
              }
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault()
                applyVolume(volume + 0.05)
              }
            }}
            className="group/vol relative h-1.5 w-28 cursor-pointer overflow-hidden rounded-full bg-white/20 sm:w-36"
          >
            <div
              className="absolute top-0 left-0 h-full bg-white transition-[width] duration-100 ease-linear"
              style={{ width: `${volumePercent}%` }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onSkip}
          className="shrink-0 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
        >
          {skipLabel}
        </button>
      </div>
    </div>
  )
}
