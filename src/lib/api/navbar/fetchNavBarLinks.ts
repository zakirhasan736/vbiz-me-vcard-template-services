import type { NavBarLinksData, NavBarLinksResponse } from '@/interfaces/navbarLinks.interface'
import { getApiBaseUrl, SERVER_FETCH_REVALIDATE_SECONDS } from '@/lib/api/serverApi'

/** Fetches navbar catalog from `GET /post-types` (server-only, ISR-cached). */
export async function fetchNavBarLinks(): Promise<NavBarLinksData | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/post-types`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: SERVER_FETCH_REVALIDATE_SECONDS },
    })

    if (!response.ok) return null

    const json = (await response.json()) as NavBarLinksResponse
    if (!json.success || !json.data) return null

    return json.data
  } catch {
    return null
  }
}
