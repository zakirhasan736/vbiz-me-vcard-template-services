import { DEFAULT_PROFILE_SLUG } from '@/lib/constants/profile'
import { buildProfilePath } from '@/lib/profileRoutes'
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect(buildProfilePath(DEFAULT_PROFILE_SLUG))
}
