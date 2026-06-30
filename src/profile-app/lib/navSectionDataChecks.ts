import type { AboutMeQueryResult } from '@/interfaces/api/aboutMe.interface'
import type { ClientsQueryResult } from '@/interfaces/api/clients.interface'
import type { DynamicPostsQueryResult } from '@/interfaces/api/dynamicPosts.interface'
import type { GalleryQueryResult } from '@/interfaces/api/gallery.interface'
import type { PublicCardsQueryResult } from '@/interfaces/api/publicCards'
import type { ReviewsQueryResult } from '@/interfaces/api/reviews.interface'
import type { ServicesQueryResult } from '@/interfaces/api/services.interface'
import type { VideoExplainerQueryResult } from '@/interfaces/api/videoExplainer.interface'
import type { VideosQueryResult } from '@/interfaces/api/videos.interface'
import { getPublishedEducationEntries } from '@/lib/vcardEducation'
import { getPublishedExperienceEntries } from '@/lib/vcardExperience'
import type { ProfileNavContentKey } from '@/lib/vcardNavbar'
import type { VCardEducationEntry, VCardExperienceEntry } from '@/types/vcard'

type ApiEndpointName =
  | 'getAboutMe'
  | 'getAdditionalServices'
  | 'getAnnouncement'
  | 'getBbbAccreditation'
  | 'getBlog'
  | 'getBooking'
  | 'getBreakfast'
  | 'getCalendar'
  | 'getCertificationsLicensing'
  | 'getClients'
  | 'getDcp'
  | 'getDinner'
  | 'getEvents'
  | 'getFaq'
  | 'getGallery'
  | 'getHomeSolar'
  | 'getInsuranceLicense'
  | 'getInventory'
  | 'getJoinMyTeam'
  | 'getLicensing'
  | 'getLunch'
  | 'getMediaPress'
  | 'getMeetOurTeam'
  | 'getMenu'
  | 'getMissionStatement'
  | 'getPosts'
  | 'getPropertyListing'
  | 'getPublicCards'
  | 'getResiliencyProducts'
  | 'getReviews'
  | 'getSalesPerson'
  | 'getSeeProducts'
  | 'getServices'
  | 'getVideoExplainer'
  | 'getVideoLinks'
  | 'getVideos'
  | 'getWhyChooseUs'

type NavSectionApiCheck = {
  endpointName: ApiEndpointName
  hasData: (data: unknown) => boolean
  getArg?: (profileId: string) => unknown
}

function hasPosts(data: unknown): boolean {
  return ((data as DynamicPostsQueryResult)?.posts?.length ?? 0) > 0
}

function hasFaqPosts(data: unknown): boolean {
  const posts = (data as DynamicPostsQueryResult)?.posts ?? []
  return posts.some((item) => item.title.trim().length > 0 && item.description.trim().length > 0)
}

/** Maps dynamic section keys to RTK endpoints + "has content" checks (mirrors section empty states). */
export const NAV_SECTION_API_CHECKS: Partial<Record<ProfileNavContentKey, NavSectionApiCheck>> = {
  about: {
    endpointName: 'getAboutMe',
    hasData: (data) => ((data as AboutMeQueryResult)?.items?.length ?? 0) > 0,
  },
  mission: { endpointName: 'getMissionStatement', hasData: hasPosts },
  services: {
    endpointName: 'getServices',
    hasData: (data) => ((data as ServicesQueryResult)?.services?.length ?? 0) > 0,
  },
  additional: { endpointName: 'getAdditionalServices', hasData: hasPosts },
  blog: { endpointName: 'getBlog', hasData: hasPosts },
  post: { endpointName: 'getPosts', hasData: hasPosts },
  gallery: {
    endpointName: 'getGallery',
    hasData: (data) => ((data as GalleryQueryResult)?.items?.length ?? 0) > 0,
  },
  videos: {
    endpointName: 'getVideos',
    hasData: (data) => ((data as VideosQueryResult)?.items?.length ?? 0) > 0,
  },
  'video-links': { endpointName: 'getVideoLinks', hasData: hasPosts },
  'why-choose-us': { endpointName: 'getWhyChooseUs', hasData: hasPosts },
  explainer: {
    endpointName: 'getVideoExplainer',
    hasData: (data) => {
      const result = data as VideoExplainerQueryResult
      return Boolean(result?.videoUrl?.trim() || result?.externalUrl?.trim())
    },
  },
  reviews: {
    endpointName: 'getReviews',
    hasData: (data) => ((data as ReviewsQueryResult)?.slides?.length ?? 0) > 0,
  },
  certificates: { endpointName: 'getCertificationsLicensing', hasData: hasPosts },
  calendar: { endpointName: 'getCalendar', hasData: hasPosts },
  events: { endpointName: 'getEvents', hasData: hasPosts },
  booking: { endpointName: 'getBooking', hasData: hasPosts },
  menu: { endpointName: 'getMenu', hasData: hasPosts },
  'sales-person': { endpointName: 'getSalesPerson', hasData: hasPosts },
  'see-products': { endpointName: 'getSeeProducts', hasData: hasPosts },
  'public-cards': {
    endpointName: 'getPublicCards',
    hasData: (data) => ((data as PublicCardsQueryResult)?.cards?.length ?? 0) > 0,
    getArg: () => undefined,
  },
  clients: {
    endpointName: 'getClients',
    hasData: (data) => ((data as ClientsQueryResult)?.clients?.length ?? 0) > 0,
  },
  'meet-team': { endpointName: 'getMeetOurTeam', hasData: hasPosts },
  'join-my-team': { endpointName: 'getJoinMyTeam', hasData: hasPosts },
  faq: { endpointName: 'getFaq', hasData: hasFaqPosts },
  bbb: { endpointName: 'getBbbAccreditation', hasData: hasPosts },
  dcp: { endpointName: 'getDcp', hasData: hasPosts },
  'home-solar': { endpointName: 'getHomeSolar', hasData: hasPosts },
  'resiliency-products': { endpointName: 'getResiliencyProducts', hasData: hasPosts },
  'property-listing': { endpointName: 'getPropertyListing', hasData: hasPosts },
  'media-press': { endpointName: 'getMediaPress', hasData: hasPosts },
  announcement: { endpointName: 'getAnnouncement', hasData: hasPosts },
  breakfast: { endpointName: 'getBreakfast', hasData: hasPosts },
  dinner: { endpointName: 'getDinner', hasData: hasPosts },
  lunch: { endpointName: 'getLunch', hasData: hasPosts },
  inventory: { endpointName: 'getInventory', hasData: hasPosts },
  licensing: { endpointName: 'getLicensing', hasData: hasPosts },
  'insurance-license': { endpointName: 'getInsuranceLicense', hasData: hasPosts },
}

export function resolveLocalNavSectionHasData(
  key: ProfileNavContentKey,
  education: VCardEducationEntry[],
  experience: VCardExperienceEntry[]
): boolean | undefined {
  if (key === 'home') return true
  if (key === 'empty') return false
  if (key === 'education') return getPublishedEducationEntries(education).length > 0
  if (key === 'work') return getPublishedExperienceEntries(experience).length > 0
  return undefined
}

export function collectNavSectionApiKeys(navContentKeys: Iterable<ProfileNavContentKey>): ProfileNavContentKey[] {
  const keys = new Set<ProfileNavContentKey>()
  for (const key of navContentKeys) {
    if (NAV_SECTION_API_CHECKS[key]) keys.add(key)
  }
  return Array.from(keys)
}
