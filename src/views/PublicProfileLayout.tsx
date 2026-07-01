'use client'

import { useAppSelector } from '@/hooks/redux'
import type { NavBarLinksData } from '@/interfaces/navbarLinks.interface'
import { CardScopeProvider } from '@/lib/card-scope'
import { ProfileApp } from '@/profile-app/ProfileApp'
import '@/profile-app/profile-app.css'
import { vCardRecordToProfileProps } from '@/profile-app/profilePublicProps'
import { useProfile } from '@/redux/features/myCard'
import type { MyCardData } from '@interfaces/api/myCard'
import { useMemo } from 'react'

import type { LiveAgentCardData } from '@/profile-app/lib/liveAgentPrompt'

type Props = {
  slug: string
  embedded?: boolean
  /** Server-prefetched profile — skips client loading screen on first visit. */
  initialMyCard?: MyCardData | null
  /** Server-prefetched navbar catalog. */
  initialNavBarLinks?: NavBarLinksData | null
  liveAgentCardData?: LiveAgentCardData
  liveAgentSystemPrompt?: string
}

/** Stable per-slug layout. Cover video is detached in `ProfileApp` (`ProfileCoverHost`). */
export default function PublicProfileLayout({
  slug,
  embedded = false,
  initialMyCard,
  initialNavBarLinks,
  liveAgentCardData,
  liveAgentSystemPrompt,
}: Props) {
  const { record, isLoading, isError, error, actionButtons } = useProfile(slug, { initialMyCard })
  const designSettings = useAppSelector((s) => s.designSettings)

  const profileProps = useMemo(
    () => (record ? vCardRecordToProfileProps(record, designSettings, actionButtons) : null),
    [record, designSettings, actionButtons]
  )

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 text-sm font-medium text-zinc-500 dark:bg-[#09090b]">
        Loading profile…
      </div>
    )
  }

  if (isError || !record || !profileProps) {
    const message =
      error && typeof error === 'object' && 'data' in error && typeof error.data === 'string'
        ? error.data
        : 'Profile not found'

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-[#09090b]">
        <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">vCard not found</p>
        <p className="mt-2 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
          {message}. No public card matches <span className="font-mono text-zinc-900 dark:text-zinc-200">{slug}</span>.
        </p>
      </div>
    )
  }

  return (
    <CardScopeProvider cardId={record.id}>
      <ProfileApp
        {...profileProps}
        embedded={embedded}
        profileSlug={slug}
        initialNavBarLinks={initialNavBarLinks}
        liveAgentCardData={liveAgentCardData}
        liveAgentSystemPrompt={liveAgentSystemPrompt}
      />
    </CardScopeProvider>
  )
}
