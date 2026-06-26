'use client'

import { BackgroundAudio } from '@/profile-app/components/BackgroundAudio'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useProfileIntroContext } from '@/profile-app/providers/ProfileIntroProvider'
import { useProfile } from '@/redux/features/myCard'

type Props = {
  profileSlug?: string
  shareSlug?: string
}

export function ProfileBackgroundAudio({ profileSlug, shareSlug }: Props) {
  const slug = (profileSlug ?? shareSlug ?? '').trim()
  const { media } = useProfile(slug, { skip: !slug })
  const { design, embedded } = useProfileDisplay()
  const { introAllowed } = useProfileIntroContext()

  return <BackgroundAudio audio={media?.audio} design={design} embedded={embedded} readyToPlay={introAllowed} />
}
