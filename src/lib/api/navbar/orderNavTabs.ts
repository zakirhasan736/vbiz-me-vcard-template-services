import { NAV_BAR_NAV_ITEMS, type NavBarNavItem } from '@/lib/vcardNavbar'

/** Canonical nav order (home → about → mission → …) used to sort profile tabs. */
const NAV_ORDER_INDEX: Record<string, number> = Object.fromEntries(
  NAV_BAR_NAV_ITEMS.map((item, index) => [item.id, index])
)

/**
 * Produces a meaningful, duplicate-free tab list:
 * - one tab per section content (no duplicate "Reviews", "About", etc.),
 * - ordered by the canonical Card Settings order (home first, then about, …),
 * - unrecognized sections keep their original order at the end.
 */
export function orderAndDedupeNavItems(items: NavBarNavItem[]): NavBarNavItem[] {
  const seen = new Set<string>()
  const deduped = items.filter((item) => {
    const key = item.profileContent === 'empty' ? `empty:${item.id}` : `content:${item.profileContent}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return deduped
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const orderA = NAV_ORDER_INDEX[a.item.id]
      const orderB = NAV_ORDER_INDEX[b.item.id]
      const rankA = orderA ?? Number.MAX_SAFE_INTEGER
      const rankB = orderB ?? Number.MAX_SAFE_INTEGER
      if (rankA !== rankB) return rankA - rankB
      return a.index - b.index
    })
    .map(({ item }) => item)
}
