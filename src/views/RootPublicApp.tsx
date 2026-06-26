'use client'

import { ProfilePrefetch } from '@/components/profile/ProfilePrefetch'
import { DEFAULT_PROFILE_SLUG } from '@/lib/constants/profile'
import PublicProfileClient from '@/views/PublicProfileClient'

export default function RootPublicApp() {
  return (
    <>
      <ProfilePrefetch slug={DEFAULT_PROFILE_SLUG} />
      <PublicProfileClient slug={DEFAULT_PROFILE_SLUG} />
    </>
  )
}
