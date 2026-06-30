import type { NavBarLinksData, PostTypeNavLink, StaticNavLink } from '@/interfaces/navbarLinks.interface'
import { NAV_ITEM_BY_ID, type NavBarNavItem } from '@/lib/vcardNavbar'
import { FileText } from 'lucide-react'

const STATIC_LINK_TO_NAV_ID: Record<string, string> = {
  home: 'home',
  resume: 'education',
  'public-cards': 'public-cards',
}

function normalizeKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

const POST_TYPE_NAME_TO_NAV_ID: Record<string, string> = {
  services: 'services',
  clients: 'clients',
  reviews: 'reviews',
  gallery: 'gallery',
  video: 'videos',
  videos: 'videos',
  post: 'post',
  blog: 'blog',
  'about me': 'about',
  'additional services': 'additional',
  '2d video explainer': 'explainer',
  '2d explainer': 'explainer',
  announcement: 'announcement',
  'better business bureau (bbb) accreditation': 'bbb',
  bbb: 'bbb',
  booking: 'booking',
  breakfast: 'breakfast',
  calender: 'calendar',
  calendar: 'calendar',
  'certifications/licensing': 'certificates',
  'certifications licenses': 'certificates',
  'certifications licensing': 'certificates',
  'certifications/licenses': 'certificates',
  'certificates licenses': 'certificates',
  'certificates/licensing': 'certificates',
  'department of consumer protection (dcp)': 'dcp',
  dcp: 'dcp',
  dinner: 'dinner',
  events: 'events',
  faq: 'faq',
  'home solar': 'home-solar',
  'insurance license': 'insurance-license',
  inventory: 'inventory',
  'join my team': 'join-team',
  licensing: 'licensing',
  lunch: 'lunch',
  'media/press': 'press',
  'meet our team': 'meet-team',
  menu: 'menu',
  'mission statement': 'mission',
  'company mission statement': 'mission',
  'property listing': 'property-listing',
  'resiliency products': 'resiliency',
  'sales person': 'sales-24h',
  '24/h salesperson': 'sales-24h',
  'see products': 'see-product',
  'see product': 'see-product',
  'video links': 'video-links',
  'why choose us': 'who-we-are',
  'who we are': 'who-we-are',
  'work experience': 'work',
}

function resolvePostTypeNavId(postType: PostTypeNavLink): string | undefined {
  const byName = POST_TYPE_NAME_TO_NAV_ID[normalizeKey(postType.name)]
  if (byName) return byName
  const byTitle = POST_TYPE_NAME_TO_NAV_ID[normalizeKey(postType.title)]
  if (byTitle) return byTitle
  return undefined
}

function withDisplayTitle(def: NavBarNavItem, title?: string): NavBarNavItem {
  const displayTitle = title?.trim()
  if (!displayTitle || displayTitle === def.label) return def
  return { ...def, displayLabel: displayTitle }
}

function createFallbackNavItem(postType: PostTypeNavLink): NavBarNavItem {
  const title = postType.title?.trim() || postType.name?.trim() || `Section ${postType.id}`
  return {
    id: `post-type-${postType.id}`,
    label: title,
    icon: FileText,
    profileContent: 'empty',
    editorPanel: { kind: 'empty' },
  }
}

function mapStaticLink(link: StaticNavLink): NavBarNavItem | null {
  if (link.active !== true) return null
  const navId = STATIC_LINK_TO_NAV_ID[link.id] ?? link.id
  const def = NAV_ITEM_BY_ID[navId]
  if (!def) return null
  return withDisplayTitle(def, link.title)
}

function isActivePostType(postType: PostTypeNavLink): boolean {
  const status = postType.status?.trim().toLowerCase()
  return status === 'active' || status === '1'
}

function mapPostType(postType: PostTypeNavLink): NavBarNavItem | null {
  if (!isActivePostType(postType)) return null
  const navId = resolvePostTypeNavId(postType)
  const def = navId ? NAV_ITEM_BY_ID[navId] : undefined
  const item = def ? withDisplayTitle(def, postType.title) : createFallbackNavItem(postType)
  return item
}

function dedupeNavItemsById(items: NavBarNavItem[]): NavBarNavItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })
}

/**
 * Maps `GET /post-types` into profile nav items.
 * Visibility: StaticLink.active === true, post_types.status === "active".
 * Order: static links first (API order), then dynamic post types (API order).
 */
export function mapNavBarLinks(data: NavBarLinksData | undefined | null): NavBarNavItem[] {
  if (!data) return []

  const staticItems = (data.StaticLink ?? [])
    .filter((link) => link.active === true)
    .map(mapStaticLink)
    .filter((item): item is NavBarNavItem => Boolean(item))

  const postTypeItems = (data.post_types ?? [])
    .filter(isActivePostType)
    .map(mapPostType)
    .filter((item): item is NavBarNavItem => Boolean(item))

  return dedupeNavItemsById([...staticItems, ...postTypeItems])
}
