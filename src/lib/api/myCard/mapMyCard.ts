import { createDefaultNavFieldConfig, NAV_BAR_FIELDS } from '@/lib/vcardNavbar'
import { createDefaultVCardSocial } from '@/lib/vcardSocial'
import type { ProfileTemplateId } from '@/redux/features/designSettings/designSettings.slice'
import type { VCardData, VCardExtraField, VCardPersonal, VCardRecord, VCardSocial } from '@/types/vcard'
import type { VCardDisplaySettings } from '@/types/vcardDisplaySettings'
import type { MyCardData } from '@interfaces/api/myCard'

const CHECKBOX_ON = new Set(['1', 'true'])

function isEnabled(value: unknown): boolean {
  if (typeof value === 'boolean') return value
  if (value == null) return false
  return CHECKBOX_ON.has(String(value))
}

/** Card Settings nav toggles — one API checkbox may enable multiple nav labels. */
const API_NAV_TO_LABELS: Record<string, string[]> = {
  navHome_checkbox: ['Home'],
  aboutMeNav_checkbox: ['About Me'],
  businessNav_checkbox: ['Company Mission Statement'],
  navResume_checkbox: ['Resume'],
  serviceNav_checkbox: ['Services'],
  galleryNav_checkbox: ['Gallery'],
  portfolioNav_checkbox: ['Gallery'],
  blogNav_checkbox: ['Blog'],
  faqNav_checkbox: ['Faq'],
  pCardsNav_checkbox: ['Public Cards'],
  contactNav_checkbox: ['Contact Us'],
  testimonialNav_checkbox: ['Reviews'],
  meetingNav_checkbox: ['Calender'],
  certificationNav_checkbox: ['Certifications/Licenses', 'Insurance License'],
  licensingNav_checkbox: ['Licensing'],
  '2dNav_checkbox': ['2D Explainer'],
  videoLinksNav_checkbox: ['Video Links'],
  meetOurTeamNav_checkbox: ['Meet Our Team'],
  bbbNav_checkbox: ['BBB'],
  dcpNav_checkbox: ['Department of Consumer Protection (DCP)'],
  restaurantMenuNav_checkbox: ['Menu'],
  solarNav_checkbox: ['Home Solar'],
  salesPersonNav_checkbox: ['24/h SalesPerson'],
  seeproduct_checkbox: ['See Product'],
  partnershipNav_checkbox: ['Clients'],
  bgNav_checkbox: ['Nav Background Color'],
}

function isNavCheckboxEnabled(card: MyCardData, apiKey: string): boolean {
  const { settings, features } = card
  return isEnabled(settings[apiKey]) || isEnabled(features[apiKey.replace('_checkbox', '')])
}

const API_FIELD_TO_LABEL: Record<string, string> = {
  name_checkbox: 'MyInfo section Name',
  profession_checkbox: 'MyInfo Profession',
  company_name_checkbox: 'MyInfo Company',
  address_checkbox: 'MyInfo Address',
  email_checkbox: 'MyInfo Email',
  phone_checkbox: 'MyInfo Phone',
  whatsapp_checkbox: 'MyInfo Whatsapp',
  website_checkbox: 'MyInfo Website',
  gender_id_checkbox: 'Gender',
  marital_status_checkbox: 'MyInfo Relationship Status',
  about_checkbox: 'About Me',
  zip_code_checkbox: 'Zip',
  save_contact_checkbox: 'Save Contact',
  share_checkbox: 'Share Btn',
  facebook_checkbox: 'FaceBook',
  twitter_checkbox: 'Twitter',
  instagram_checkbox: 'Instagram',
  tiktok_checkbox: 'TikTok',
  youtube_checkbox: 'Youtube',
  linkin_checkbox: 'LinkedIn',
  linkedin_checkbox: 'LinkedIn',
  pinterest_checkbox: 'Pinterest',
  rumble_checkbox: 'Rumble',
  truth_checkbox: 'Truth',
  profile_video_checkbox: 'Intro vCard Video',
  profile_video_link_checkbox: 'Intro YouTube vCard Video Link',
  background_video_checkbox: 'Background Video/Image',
  profile_image_checkbox: 'Profile Image/Video',
  background_music_checkbox: 'Background Music',
  background_music_link_checkbox: 'YouTube Background Music Link',
  repeat_bg_music_checkbox: 'Repeat Background Music',
  pageHeader_checkbox: 'Pages Header',
  viewCounter_checkbox: 'Vcard View Counter',
  language_checkbox: 'Language',
  professionIcon_checkbox: 'Profession Icon',
  company_nameIcon_checkbox: 'Company/Office Icon',
  websiteIcon_checkbox: 'My Info Website Icon',
}

function mapDisplaySettings(card: MyCardData): VCardDisplaySettings {
  const { settings, features } = card
  const fields: VCardDisplaySettings['fields'] = {}

  for (const key of NAV_BAR_FIELDS) {
    fields[key] = createDefaultNavFieldConfig(key)
  }

  for (const [apiKey, labels] of Object.entries(API_NAV_TO_LABELS)) {
    const visible = isNavCheckboxEnabled(card, apiKey)
    for (const label of labels) {
      if (label === 'Nav Background Color') continue
      if (!fields[label]) continue
      fields[label] = { ...fields[label], visible }
      const bgColorKey = apiKey.replace('_checkbox', 'Nav_background_color')
      const navBg = settings[bgColorKey] ?? settings[`${apiKey.replace('_checkbox', '')}_background_color`]
      if (navBg) {
        fields[label] = { ...fields[label], backgroundColor: navBg }
      }
    }
  }

  for (const [apiKey, label] of Object.entries(API_FIELD_TO_LABEL)) {
    if (!fields[label]) continue
    const visible = isEnabled(settings[apiKey]) || isEnabled(features[apiKey.replace('_checkbox', '')])
    fields[label] = { ...fields[label], visible }
  }

  if (settings.pageHeader_text_color) {
    fields['Pages Header'] = {
      ...fields['Pages Header'],
      textColor: settings.pageHeader_text_color,
    }
  }
  if (settings.pageHeader_background_color) {
    fields['Pages Header'] = {
      ...fields['Pages Header'],
      backgroundColor: settings.pageHeader_background_color,
    }
    fields['vCard Header Color'] = {
      ...fields['vCard Header Color'],
      textColor: settings.pageHeader_background_color,
    }
  }
  if (settings.bgNav_background_color) {
    fields['Nav Background Color'] = {
      ...fields['Nav Background Color'],
      backgroundColor: settings.bgNav_background_color,
    }
  }

  const introUrl =
    card.intro_video.regular_video?.url || card.intro_video.url || card.intro_video.youtube?.embed_url || ''
  if (introUrl) {
    fields['Intro vCard Video'] = {
      ...fields['Intro vCard Video'],
      customValue: introUrl,
    }
  }

  const bgUrl = card.background_media.video_url || card.background_media.url || ''
  if (bgUrl) {
    fields['Background Video/Image'] = {
      ...fields['Background Video/Image'],
      customValue: bgUrl,
    }
  }

  const profileUrl = card.profile_media.url || card.profile_media.fallback_url || ''
  if (profileUrl) {
    fields['Profile Image/Video'] = {
      ...fields['Profile Image/Video'],
      customValue: profileUrl,
    }
  }

  return { globalEnabled: true, fields }
}

function mapPersonal(card: MyCardData): VCardPersonal {
  const p = card.profile
  const aboutSection = card.my_info.personal?.about?.value ?? p.description ?? ''

  return {
    fullName: p.name ?? '',
    email: p.email ?? '',
    dob: '',
    gender: p.gender ?? 'Male',
    relationship: p.marital_status ?? 'Single',
    profession: p.profession ?? '',
    designation: p.designation ?? '',
    company: p.company_name ?? '',
    phone: p.phone ?? '',
    whatsapp: p.whatsapp ?? p.phone ?? '',
    address: p.address ?? '',
    website: p.website ?? '',
    about: aboutSection,
    explainerVideoUrl:
      card.intro_video.regular_video?.url || card.intro_video.url || card.intro_video.youtube?.embed_url || '',
  }
}

function mapSocial(card: MyCardData): VCardSocial {
  const p = card.profile
  const base = createDefaultVCardSocial()
  const handles: Record<string, string> = {
    ...base.handles,
    facebook: p.facebook ?? '',
    instagram: p.instagram ?? '',
    twitter: p.twitter ?? '',
    tiktok: p.tiktok ?? '',
    youtube: p.youtube ?? '',
    linkedin: p.linkedin ?? '',
    pinterest: p.pinterest ?? '',
    whatsapp: p.whatsapp ?? '',
    rumble: p.rumble ?? '',
    truth: p.truth ?? '',
    website: p.website ?? '',
  }

  const customLinks =
    card.my_info.additional_fields?.map((field, index) => ({
      id: `extra_${index}_${field.key}`,
      name: field.key,
      url: field.value,
    })) ?? []

  return { ...base, handles, customLinks }
}

function mapExtraFields(card: MyCardData): VCardExtraField[] {
  return (
    card.my_info.additional_fields?.map((field, index) => ({
      id: `api_extra_${index}`,
      icon: field.icon ?? field.css_class ?? 'fa-link',
      name: field.key,
      value: field.value,
    })) ?? []
  )
}

function resolveTemplate(card: MyCardData): ProfileTemplateId {
  if (card.template === 'dynamic' || card.features.dynamic_template === true) {
    return 'v1'
  }
  return 'v3'
}

function resolveTheme(card: MyCardData) {
  const primary =
    card.settings.pageHeader_background_color || card.action_buttons.save_contact?.background_color || '#6366f1'
  const accent =
    card.action_buttons.save_contact?.background_color || card.settings.pageHeader_background_color || '#f43f5e'

  return {
    primaryColor: primary,
    accentColor: accent,
    darkMode: true,
    fontFamily: 'inter',
  }
}

export function mapMyCardToVCardData(card: MyCardData): VCardData {
  return {
    slug: card.profile.slug,
    isPublic: card.features.is_public !== false,
    personal: mapPersonal(card),
    theme: resolveTheme(card),
    appearance: {
      profileTemplate: resolveTemplate(card),
      layoutStyle: 'classic',
      buttonStyle: 'solid',
      cornerStyle: 'round',
    },
    services: [],
    generalPosts: [],
    faqs: [],
    portfolio: [],
    socials: [],
    social: mapSocial(card),
    extraFields: mapExtraFields(card),
    education: [],
    experience: [],
    displaySettings: mapDisplaySettings(card),
  }
}

export function mapMyCardToVCardRecord(card: MyCardData): VCardRecord {
  const data = mapMyCardToVCardData(card)
  const now = new Date().toISOString()

  return {
    ...data,
    id: String(card.profile.id),
    createdAt: now,
    updatedAt: now,
    views: card.action_buttons.view_counter?.count ?? 0,
    saves: 0,
    avatarImageUrl: card.profile_media.url || card.profile_media.fallback_url || '',
    isActive: true,
  }
}
