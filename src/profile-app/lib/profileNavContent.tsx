'use client'

import type { ProfileNavContentKey } from '@/lib/vcardNavbar'
import { getNavDisplayLabel } from '@/lib/vcardNavbar'
import { AboutSection } from '@/profile-app/components/AboutSection'
import { AdditionalServicesSection } from '@/profile-app/components/AdditionalServicesSection'
import { AnnouncementSection } from '@/profile-app/components/AnnouncementSection'
import { BbbAccreditationSection } from '@/profile-app/components/BbbAccreditationSection'
import { BlogSection } from '@/profile-app/components/BlogSection'
import { BookingSection } from '@/profile-app/components/BookingSection'
import { BreakfastSection } from '@/profile-app/components/BreakfastSection'
import { CalendarSection } from '@/profile-app/components/CalendarSection'
import { CertificationsLicensingSection } from '@/profile-app/components/CertificationsLicensingSection'
import { ClientsSection } from '@/profile-app/components/ClientsSection'
import { DcpSection } from '@/profile-app/components/DcpSection'
import { DinnerSection } from '@/profile-app/components/DinnerSection'
import { EducationSection } from '@/profile-app/components/EducationSection'
import { EmptyNavSection } from '@/profile-app/components/EmptyNavSection'
import { EventsSection } from '@/profile-app/components/EventsSection'
import { ExperienceSection } from '@/profile-app/components/ExperienceSection'
import { ExplainerSection } from '@/profile-app/components/ExplainerSection'
import { FAQSection } from '@/profile-app/components/FAQSection'
import { HomeSection as HomeSectionV1 } from '@/profile-app/components/HomeSection'
import { HomeSectionV2 } from '@/profile-app/components/HomeSectionV2'
import { HomeSolarSection } from '@/profile-app/components/HomeSolarSection'
import { ImageGallerySection } from '@/profile-app/components/ImageGallerySection'
import { InsuranceLicenseSection } from '@/profile-app/components/InsuranceLicenseSection'
import { InventorySection } from '@/profile-app/components/InventorySection'
import { JoinMyTeamSection } from '@/profile-app/components/JoinMyTeamSection'
import { LicensingSection } from '@/profile-app/components/LicensingSection'
import { LunchSection } from '@/profile-app/components/LunchSection'
import { MediaPressSection } from '@/profile-app/components/MediaPressSection'
import { MeetOurTeamSection } from '@/profile-app/components/MeetOurTeamSection'
import { MenuSection } from '@/profile-app/components/MenuSection'
import { PostsSection } from '@/profile-app/components/PostsSection'
import { PropertyListingSection } from '@/profile-app/components/PropertyListingSection'
import { PublicCardsSection } from '@/profile-app/components/PublicCardsSection'
import { ResiliencyProductsSection } from '@/profile-app/components/ResiliencyProductsSection'
import { ReviewsSection } from '@/profile-app/components/ReviewsSection'
import { SeeProductsSection } from '@/profile-app/components/SeeProductsSection'
import { ServicesSection } from '@/profile-app/components/ServicesSection'
import { MissionSection } from '@/profile-app/components/SimpleSections'
import { VideoLinksSection } from '@/profile-app/components/VideoLinksSection'
import { useProfileNavigation } from '@/profile-app/providers/ProfileNavigationProvider'
import { SalesPersonSection } from '../components/SalesPersonSection'
import { VideosSection } from '../components/VideosSection'
import { WhyChooseUsSection } from '../components/WhyChooseUsSection'

function renderNavContent(contentKey: ProfileNavContentKey, tabId: string, title: string, template: 'v1' | 'v2') {
  switch (contentKey) {
    case 'home':
      return template === 'v1' ? <HomeSectionV1 key={tabId} /> : <HomeSectionV2 key={tabId} />
    case 'about':
      return <AboutSection key={tabId} />
    case 'mission':
      return <MissionSection key={tabId} />
    case 'services':
      return <ServicesSection key={tabId} />
    case 'additional':
      return <AdditionalServicesSection key={tabId} />
    case 'blog':
      return <BlogSection key={tabId} />
    case 'post':
      return <PostsSection key={tabId} />
    case 'gallery':
      return <ImageGallerySection key={tabId} />
    case 'videos':
      return <VideosSection key={tabId} />
    case 'video-links':
      return <VideoLinksSection key={tabId} />
    case 'why-choose-us':
      return <WhyChooseUsSection key={tabId} />
    case 'explainer':
      return <ExplainerSection key={tabId} />
    case 'reviews':
      return <ReviewsSection key={tabId} />
    case 'certificates':
      return <CertificationsLicensingSection key={tabId} />
    case 'education':
      return <EducationSection key={tabId} />
    case 'work':
      return <ExperienceSection key={tabId} />
    case 'public-cards':
      return <PublicCardsSection key={tabId} />
    case 'clients':
      return <ClientsSection key={tabId} />
    case 'meet-team':
      return <MeetOurTeamSection key={tabId} />
    case 'join-my-team':
      return <JoinMyTeamSection key={tabId} />
    case 'calendar':
      return <CalendarSection key={tabId} />
    case 'events':
      return <EventsSection key={tabId} />
    case 'booking':
      return <BookingSection key={tabId} />
    case 'menu':
      return <MenuSection key={tabId} />
    case 'sales-person':
      return <SalesPersonSection key={tabId} />
    case 'see-products':
      return <SeeProductsSection key={tabId} />
    case 'faq':
      return <FAQSection key={tabId} template={template} />
    case 'bbb':
      return <BbbAccreditationSection key={tabId} />
    case 'dcp':
      return <DcpSection key={tabId} />
    case 'home-solar':
      return <HomeSolarSection key={tabId} />
    case 'resiliency-products':
      return <ResiliencyProductsSection key={tabId} />
    case 'property-listing':
      return <PropertyListingSection key={tabId} />
    case 'media-press':
      return <MediaPressSection key={tabId} />
    case 'announcement':
      return <AnnouncementSection key={tabId} />
    case 'breakfast':
      return <BreakfastSection key={tabId} />
    case 'dinner':
      return <DinnerSection key={tabId} />
    case 'lunch':
      return <LunchSection key={tabId} />
    case 'inventory':
      return <InventorySection key={tabId} />
    case 'licensing':
      return <LicensingSection key={tabId} />
    case 'insurance-license':
      return <InsuranceLicenseSection key={tabId} />
    case 'empty':
    default:
      return <EmptyNavSection key={tabId} title={title} />
  }
}

type ProfileNavSectionProps = {
  tabId: string
  template?: 'v1' | 'v2'
}

/** Renders the active profile section from dynamic navbar metadata. */
export function ProfileNavSection({ tabId, template = 'v2' }: ProfileNavSectionProps) {
  const { getNavItem } = useProfileNavigation()
  const item = getNavItem(tabId)
  const contentKey: ProfileNavContentKey = item?.profileContent ?? 'empty'
  const title = item ? getNavDisplayLabel(item) : tabId

  return renderNavContent(contentKey, tabId, title, template)
}

/** @deprecated Use `ProfileNavSection` inside `ProfileNavigationProvider`. */
export function renderProfileNavContent(tabId: string, options?: { template?: 'v1' | 'v2' }) {
  return <ProfileNavSection tabId={tabId} template={options?.template ?? 'v2'} />
}
