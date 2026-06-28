export const DEFAULT_PROFILE_SECTION = 'home'

/** Public profile path: `/{slug}`. */
export function buildProfilePath(slug: string): string {
  const trimmedSlug = slug.trim()
  if (!trimmedSlug) return '/'
  return `/${encodeURIComponent(trimmedSlug)}`
}
