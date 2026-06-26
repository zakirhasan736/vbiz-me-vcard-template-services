export const DEFAULT_PROFILE_SECTION = 'home'

export const PROFILE_ROUTE_PREFIX = '/vcard'

/** Public profile path: `/vcard/{slug}`. */
export function buildProfilePath(slug: string): string {
  const trimmedSlug = slug.trim()
  if (!trimmedSlug) return PROFILE_ROUTE_PREFIX
  return `${PROFILE_ROUTE_PREFIX}/${encodeURIComponent(trimmedSlug)}`
}
