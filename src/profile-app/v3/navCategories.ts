import { getNavDisplayLabel, type NavBarNavItem } from '@/lib/vcardNavbar'
import {
  Award,
  Calendar,
  Camera,
  FileEdit,
  Film,
  Home,
  Lightbulb,
  PlaySquare,
  ScrollText,
  Settings,
  Star,
  User,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

export type V3NavTab = {
  id: string
  icon: LucideIcon
  label: string
}

export type V3NavCategory = {
  title: string
  items: V3NavTab[]
}

export const V3_NAV_CATEGORIES: V3NavCategory[] = [
  {
    title: 'Overview',
    items: [
      { id: 'home', icon: Home, label: 'Dashboard' },
      { id: 'about', icon: User, label: 'My Story' },
      { id: 'mission', icon: ScrollText, label: 'Mission & Vision' },
    ],
  },
  {
    title: 'Expertise',
    items: [
      { id: 'services', icon: Wrench, label: 'Core Services' },
      { id: 'additional', icon: Settings, label: 'Add-ons' },
      { id: 'blog', icon: FileEdit, label: 'Insights' },
    ],
  },
  {
    title: 'Media & Work',
    items: [
      { id: 'videos', icon: Film, label: 'Video Showcase' },
      { id: 'gallery', icon: Camera, label: 'Image Vault' },
      { id: 'explainer', icon: PlaySquare, label: 'Demo Reel' },
    ],
  },
  {
    title: 'Trust & Voice',
    items: [
      { id: 'reviews', icon: Star, label: 'Client Reviews' },
      { id: 'certificates', icon: Award, label: 'Certifications' },
    ],
  },
  {
    title: 'Network',
    items: [
      { id: 'public-cards', icon: Users, label: 'Connections' },
      { id: 'calendar', icon: Calendar, label: 'Book Time' },
      { id: 'faq', icon: Lightbulb, label: 'FAQ' },
    ],
  },
]

export const V3_ALL_TABS = V3_NAV_CATEGORIES.flatMap((c) => c.items)

/** Maps API navbar items into the flat tab list consumed by v3 Navigation. */
export function mapNavItemsToV3Tabs(items: NavBarNavItem[]): V3NavTab[] {
  return items.map((item) => ({
    id: item.id,
    icon: item.icon,
    label: getNavDisplayLabel(item),
  }))
}
