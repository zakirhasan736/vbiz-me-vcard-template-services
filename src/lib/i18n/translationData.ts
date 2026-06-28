'use client'

import { resolveCardOwnerId } from '@/lib/i18n/cardScope'
import { I18N_CONFIG, selectedLanguageStorageKey, translationsCacheKey } from '@/lib/i18n/config'
import { useEffect, useState } from 'react'

export const LANGUAGE_CHANGE_EVENT = I18N_CONFIG.languageChangeEvent
export const TRANSLATION_LOADING_EVENT = I18N_CONFIG.translationLoadingEvent

// Default English master translation catalog representing the entire app card texts
export const DEFAULT_EN_TRANSLATIONS: Record<string, string> = {
  // Navigation categories & labels
  'nav.overview': 'Overview',
  'nav.dashboard': 'Dashboard',
  'nav.mystory': 'My Story',
  'nav.mission': 'Mission & Vision',
  'nav.expertise': 'Expertise',
  'nav.services': 'Core Services',
  'nav.addons': 'Add-ons',
  'nav.insights': 'Insights',
  'nav.media': 'Media & Work',
  'nav.videos': 'Video Showcase',
  'nav.gallery': 'Image Vault',
  'nav.demoreel': 'Demo Reel',
  'nav.trust': 'Trust & Voice',
  'nav.reviews': 'Client Reviews',
  'nav.certifications': 'Certifications',
  'nav.network': 'Network',
  'nav.connections': 'Connections',
  'nav.booktime': 'Book Time',
  'nav.faq': 'FAQ',

  // Main UI Buttons & Action items
  'hero.my_info': 'MY INFO',
  'hero.my_vcard': 'MY VCARD',
  'hero.save_my_info': 'SAVE MY INFO',
  'hero.google_wallet': 'GOOGLE WALLET',
  'hero.get_your_vcard_now': 'GET YOUR VCARD NOW',
  'hero.premium': 'PREMIUM',
  'hero.origin_story': 'Origin Story',
  'hero.about_me': 'About Me',
  'hero.branding_quote': 'Your brand deserves more than a paper card.',
  'hero.let_make_unforgettable': "Let's make it unforgettable.",

  // About Section
  'about.origin_story': 'Origin Story',
  'about.title': 'About Me',
  'about.quote_lead':
    "I wasn't handed anything. I built myself through hardship, hard work, and relentless drive. Every obstacle taught me something—and I turned those lessons into a tool that helps others leave a lasting impression in seconds.",
  'about.vbiz_p':
    "vBiz Me is more than a digital card. It's a first-impression machine. A conversion tool. A way to stand out and get remembered.",
  'about.pillar1_title': 'Visionary & Builder',
  'about.pillar1_desc': 'I create solutions that break the mold',
  'about.pillar2_title': 'Sales & Marketing',
  'about.pillar2_desc': 'I turn attention into action',
  'about.pillar3_title': 'Empowerment Coach',
  'about.pillar3_desc': 'I help people level up, fast',
  'about.pillar4_title': 'Founder',
  'about.pillar4_desc': 'Leading with purpose, not just profit',
  'about.unforgettable': "Your brand deserves more than a paper card. Let's make it unforgettable.",

  // Services Section
  'services.core_services': 'Core Services',
  'services.headline': "This Isn't a Business Card. It's a Digital Power Move.",
  'services.subheading':
    'Professionally built, video-powered virtual business cards designed to capture attention and convert introductions into lasting connections.',
  'services.service0_title': 'Dynamic Intro Video',
  'services.service0_tagline': 'First Impression Secured',
  'services.service0_desc':
    'Every vBiz Me card begins with a custom intro video that plays the moment your card is opened. Capture focus and drive immediate engagement within the first critical 3 seconds.',
  'services.service0_high1': 'Muted Autoplay with Sound Option',
  'services.service0_high2': 'Seamless transition to logo lockup',
  'services.service1_title': 'The Invisible Advantage™',
  'services.service1_tagline': 'Sequential Focus Strategy',
  'services.service1_desc':
    'Instead of dumping a wall of confusing links on a screen, your card strategically guides viewers through a powerful curated sequence. Control your sales narrative from start to finish.',
  'services.service1_high1': 'Curated step-by-step presentation',
  'services.service1_high2': 'No random link-wandering',
  'services.service2_title': 'Real-Time Analytics',
  'services.service2_tagline': 'Interactive Behavior Data',
  'services.service2_desc':
    'Track how people interact with your card in real-time. Know exactly who clicked what, when, and which sections captured the most attention (Bookings vs. Quote vs. Direct Calls).',
  'services.service2_high1': 'Individual button tap counters',
  'services.service2_high2': 'Visual heat map indicators',
  'services.service3_title': 'Fully Branded Design',
  'services.service3_tagline': 'Bespoke Personal Identity',
  'services.service3_desc':
    "Designed from the ground up to match your brand's unique identity, colors, and typography. Your virtual business card is a premium, custom extension of your physical and web brand.",
  'services.service3_high1': 'Custom typography combinations',
  'services.service3_high2': 'Responsive fluid breakpoints',
  'services.service4_title': 'Lead Conversion Engine',
  'services.service4_tagline': 'Actionable Outcomes Instantly',
  'services.service4_desc':
    "Turn attention into active business relationships instantly. Integrated 'one-tap actions' such as Calendar Booking, Quote Requests, and Direct Calls put your client funnel right in their pocket.",
  'services.service4_high1': 'One-tap VCF download',
  'services.service4_high2': 'Interactive micro-forms',
  'services.service5_title': 'Enterprise Team Systems',
  'services.service5_tagline': 'Organization-wide Consistency',
  'services.service5_desc':
    'Deploy branded templates and unified links across your entire company. Perfect for modern sales teams, professional agencies, and collaborative field organizations.',
  'services.service5_high1': 'Corporate templates & designs',
  'services.service5_high2': 'Event QR code builders',

  // Mission Section
  'mission.title': 'Our Mission',
  'mission.headline': 'Revolutionize networking with cutting-edge digital cards.',
  'mission.desc':
    'We empower individuals and organizations to stand out, communicate their value instantly, and turn every introduction into a lasting opportunity.',
  'mission.vision_title': 'Our Vision',
  'mission.vision_desc':
    'To be the global standard for professional introductions. We envision a world where paper business cards are obsolete, replaced by intelligent, dynamic digital profiles that tell your complete professional story and foster genuine connections.',
  'mission.values_title': 'Core Values',
  'mission.value1_title': 'Innovation',
  'mission.value1_desc': 'Pushing boundaries of digital connectivity.',
  'mission.value2_title': 'Impact',
  'mission.value2_desc': 'Making interactions memorable.',
  'mission.value3_title': 'Integrity',
  'mission.value3_desc': 'Secure, reliable representation.',

  // Certificates Section
  'cert.title': 'Certifications & Achievements',
  'cert.desc': 'Verified credentials, strategic management milestones, and specialized expertise certificates.',
  'cert.cert1_title': 'Certificate of Excellence',
  'cert.cert1_issuer': 'National Business Academy',
  'cert.cert2_title': 'Strategic Management',
  'cert.cert2_issuer': 'Executive Institute',
  'cert.cert3_title': 'Digital Transformation',
  'cert.cert3_issuer': 'Tech Innovation Hub',

  // Reviews Section
  'reviews.title': 'Client Reviews',
  'reviews.subtitle': 'Word on the Street',
  'reviews.desc':
    'Read authentic feedback and success stories from clients, partners, and enterprise organizations who leveled up their networking game.',
  'reviews.write_review': 'WRITE REVIEW',
  'reviews.rev1_quote':
    "vBiz Me completely transformed our team's sales conversion. The video intro immediately hooks clients, and the offline Google Wallet integration is flawless. Highly recommend!",
  'reviews.rev1_name': 'Sarah Jenkins',
  'reviews.rev1_role': 'VP of Sales at GrowthLoop',
  'reviews.rev2_quote':
    "As an independent coach, making a strong first impression is everything. My clients love the direct calendar booking. I haven't carried a paper card in 6 months.",
  'reviews.rev2_name': 'David Chen',
  'reviews.rev2_role': 'Executive Leadership Coach',
  'reviews.rev3_quote':
    'The analytics package is a game-changer. I know exactly when a prospect opens my card and what they tapped, allowing me to follow up smarter.',
  'reviews.rev3_name': 'Elena Rostova',
  'reviews.rev3_role': 'Tech Co-founder & CTO',

  // Calendar Section
  'calendar.title': 'Book Strategic Consultation',
  'calendar.desc':
    'Select a convenient time slot below to schedule a direct growth mapping session with Michaelangelo Casanova.',
  'calendar.book_now': 'BOOK APPOINTMENT NOW',

  // Addons Section
  'addons.title': 'Premium Add-ons',
  'addons.desc':
    'Enhance your digital business card with professional integrations, enterprise controls, and custom design layouts.',

  // Explainer Section
  'explainer.title': 'Demo & Video Walkthrough',
  'explainer.desc':
    'Watch this 2-minute video overview to see how vBiz Me helps professional teams secure more deals and stand out.',

  // Blog Section
  'blog.title': 'Insights & Blog',
  'blog.desc':
    'Read the latest tips on digital branding, networking strategies, and video marketing tips to scale your personal brand.',

  // FAQ Section
  'faq.title': 'Frequently Asked Questions',
  'faq.desc':
    'Find instant answers to common questions about vBiz Me features, video integration, analytics tracking, and team deployment.',
  'faq.q1': 'What exactly is vBiz Me?',
  'faq.a1':
    'vBiz Me is a video-first digital business card. It opens with a quick 9-second intro video that plays the moment your card is opened. Capture focus and drive immediate engagement within the first critical 3 seconds.',
  'faq.q2': "How's this different from paper cards or link farms?",
  'faq.a2':
    "Paper cards get tossed (88%). Link pages are clutter. vBiz Me is a mini commercial built to convert: video up top, clear CTAs, and reporting so you know what's working. It drives outcomes—bookings, calls, quotes—not link-wandering.",
  'faq.q3': 'Does this replace my website or socials?',
  'faq.a3':
    'No. vBiz Me is the front door that gets opened. It funnels attention to your site, reviews, calendar, payments, portfolio, and socials—in the right order.',
  'faq.q4': 'Will the video autoplay with sound?',
  'faq.a4':
    'Browsers block autoplay with sound. Your video autoplays muted; users tap to unmute. We design around that: the logo locks in after the intro, CTAs are right below, and music/voice plays when they tap.',
  'faq.q5': 'What actions can I add?',
  'faq.a5':
    "The greatest hits: Book a Consult, Call Now, Text Me, Get a Quote (short form or 'text a photo for a quote'), Pay/Invoice, Reviews, Directions/Maps, plus Save My Info (.vcf). We can add custom buttons and reorder them to match your sales flow.",
  'faq.q6': 'What do the analytics show me?',
  'faq.a6':
    "Clear signal: who viewed, what they tapped, and which sections got attention (Book vs. Quote vs. Call). Use it to follow up smart, not spammy. If they submit a form, you'll see their details; otherwise it's behavior data—no creepy tracking.",
  'faq.q7': 'How does pricing and setup work—solo and teams?',
  'faq.a7':
    'Keep it lean: a small setup + a low monthly (around under ten bucks tier), with unlimited updates—no printing ever again. Teams get on-brand templates, event QR codes, and light CRM/lead routing so every rep looks sharp and you can measure conversions.',

  // Modals
  'modal.select_language': 'Select Language',
  'modal.choose_language': 'Choose your preferred language',
  'modal.apply_language': 'APPLY LANGUAGE',
  'modal.notepad_title': 'Digital Guestbook',
  'modal.notepad_desc': 'Leave a handwritten note or feedback directly on this profile card.',
  'modal.notepad_placeholder': 'Write your message here...',
  'modal.notepad_send': 'SEND NOTE',
  'modal.contact_title': 'Save Contact Information',
  'modal.contact_desc': 'Download the direct vCard contact file (.vcf) directly into your phone contact book.',
  'modal.contact_download': 'DOWNLOAD CONTACT',
  'modal.wallet_title': 'Save to Google Wallet',
  'modal.wallet_desc': "Save Michaelangelo C.'s contact card directly as a smart pass in your Google Wallet.",
  'modal.wallet_add': 'ADD TO WALLET',
  'modal.notification_title': 'Stay Updated',
  'modal.notification_desc': 'Allow push notifications to receive real-time updates and strategic coaching alerts.',
  'modal.notification_allow': 'ALLOW NOTIFICATIONS',
  'modal.done_title': 'All Set!',
  'modal.done_desc': 'Thank you! The contact details have been successfully saved and synchronized.',
  'modal.close': 'Close',
}

let isSyncingTranslations = false

export function getSyncingState() {
  return isSyncingTranslations
}

// Hook to access dynamic translated values
export function useTranslation() {
  const cardId = resolveCardOwnerId()
  const [lang, setLang] = useState<string>(() => {
    return localStorage.getItem(selectedLanguageStorageKey(cardId)) || 'en'
  })

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const currentLang = localStorage.getItem(selectedLanguageStorageKey(cardId)) || 'en'
    if (currentLang === 'en') return false
    return isSyncingTranslations
  })

  const [translations, setTranslations] = useState<Record<string, string>>(() => {
    const currentLang = localStorage.getItem(selectedLanguageStorageKey(cardId)) || 'en'
    const key = translationsCacheKey(cardId, currentLang)
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : {}
  })

  useEffect(() => {
    const handleLangChange = () => {
      const currentLang = localStorage.getItem(selectedLanguageStorageKey(cardId)) || 'en'
      setLang(currentLang)
      try {
        const key = translationsCacheKey(cardId, currentLang)
        const cached = localStorage.getItem(key)
        setTranslations(cached ? JSON.parse(cached) : {})
      } catch {
        setTranslations({})
      }
      setIsLoading(currentLang !== 'en' && isSyncingTranslations)
    }

    const handleLoadingChange = (e: Event) => {
      const customEvent = e as CustomEvent
      setIsLoading(!!customEvent.detail)
    }

    window.addEventListener(LANGUAGE_CHANGE_EVENT, handleLangChange)
    window.addEventListener(TRANSLATION_LOADING_EVENT, handleLoadingChange)

    // Dynamic non-blocking trigger of background sync on mount/language check
    if (lang !== 'en') {
      syncTranslations().catch((err) => {
        console.error('Background sync in useTranslation useEffect failed:', err)
      })
    }

    return () => {
      window.removeEventListener(LANGUAGE_CHANGE_EVENT, handleLangChange)
      window.removeEventListener(TRANSLATION_LOADING_EVENT, handleLoadingChange)
    }
  }, [cardId, lang])

  const t = (key: string, defaultValue: string): string => {
    if (lang === 'en') return defaultValue
    return translations[key] || defaultValue
  }

  return { t, lang, isLoading }
}

// Function to initialize translation cache, extract texts, check for new text strings, and run backend dynamic translations
export async function syncTranslations() {
  const cardId = resolveCardOwnerId()
  const selectedLang = localStorage.getItem(selectedLanguageStorageKey(cardId)) || 'en'

  // Always store/overwrite English data in localStorage as the primary source of truth
  localStorage.setItem(translationsCacheKey(cardId, 'en'), JSON.stringify(DEFAULT_EN_TRANSLATIONS))

  if (selectedLang === 'en') {
    isSyncingTranslations = false
    window.dispatchEvent(new CustomEvent(TRANSLATION_LOADING_EVENT, { detail: false }))
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT))
    return
  }

  // Load target language cache
  let targetCache: Record<string, string> = {}
  try {
    const raw = localStorage.getItem(translationsCacheKey(cardId, selectedLang))
    if (raw) {
      targetCache = JSON.parse(raw)
    }
  } catch (e) {
    console.error('Failed to parse language cache', e)
  }

  // Check if any keys are missing in target language compared to master English (this checks "if any new text have")
  const missingTexts: Record<string, string> = {}
  for (const [key, val] of Object.entries(DEFAULT_EN_TRANSLATIONS)) {
    if (!targetCache[key]) {
      missingTexts[key] = val
    }
  }

  const missingKeysCount = Object.keys(missingTexts).length

  if (missingKeysCount > 0) {
    console.log(
      `Syncing translations for card [${cardId}] to language [${selectedLang}]. Missing ${missingKeysCount} keys...`
    )

    // Set loading state and dispatch event
    isSyncingTranslations = true
    window.dispatchEvent(new CustomEvent(TRANSLATION_LOADING_EVENT, { detail: true }))

    try {
      const response = await fetch(I18N_CONFIG.translateApiPath, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetLang: selectedLang,
          texts: missingTexts,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const translatedTexts = result.translatedTexts || {}

        // Merge new translated texts into cache
        const updatedCache = { ...targetCache, ...translatedTexts }
        localStorage.setItem(translationsCacheKey(cardId, selectedLang), JSON.stringify(updatedCache))

        console.log(
          `Successfully translated and cached ${Object.keys(translatedTexts).length} new keys to [${selectedLang}]!`
        )

        // Dispatch language change event to trigger interactive updates
        window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT))
      } else {
        console.error('Backend translate endpoint failed', response.statusText)
      }
    } catch (err) {
      console.error('Network error during translation sync', err)
    } finally {
      isSyncingTranslations = false
      window.dispatchEvent(new CustomEvent(TRANSLATION_LOADING_EVENT, { detail: false }))
    }
  } else {
    // If no missing keys, immediately trigger update from cache and turn off loading
    isSyncingTranslations = false
    window.dispatchEvent(new CustomEvent(TRANSLATION_LOADING_EVENT, { detail: false }))
    window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT))
  }
}
