/**
 * Translation Utility using Google Website Translator
 * Central module — shared across v1, v2, v3 profile templates.
 */

import { resolveCardOwnerId, setTranslationCardScope } from '@/lib/i18n/cardScope'
import {
  buildTranslationConfig,
  I18N_CONFIG,
  LANG_CODE_MAP,
  selectedLanguageStorageKey,
  translationConfigCacheKey,
  type BackendLanguage,
  type TranslationConfig,
} from '@/lib/i18n/config'
import { syncTranslations } from '@/lib/i18n/translationData'

export { LANG_CODE_MAP as langCodeMap, LANGUAGE_LABELS } from '@/lib/i18n/config'
export { setTranslationCardScope }
export type { BackendLanguage, TranslationConfig }

/** @deprecated Use resolveCardOwnerId from cardScope — kept for v3 component compatibility. */
export function getCardOwnerId(): string {
  return resolveCardOwnerId()
}

// Global declaration for google translate types
declare global {
  interface Window {
    googleTranslateElementInit?: () => void
    google?: unknown
  }
}

// Helper to get all cookies by name
export function getAllCookies(name: string): string[] {
  if (typeof document === 'undefined') return []
  const allCookies = document.cookie.split(';')
  const matchingCookies: string[] = []
  for (let cookie of allCookies) {
    cookie = cookie.trim()
    if (cookie.toLowerCase().startsWith(name.toLowerCase() + '=')) {
      matchingCookies.push(cookie)
    }
  }
  return matchingCookies
}

// Optimized cookie setter
export function setCookie(name: string, value: string, days: number) {
  if (typeof window === 'undefined') return
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

  const isSecure = window.location.protocol === 'https:'

  let cookieString = name + '=' + value + ';path=/' + ';expires=' + expires.toUTCString()

  if (isSecure) {
    cookieString += ';SameSite=None;Secure'
  } else {
    cookieString += ';SameSite=Lax'
  }

  // Clear root domain cookies that might be lingering
  const domainParts = window.location.hostname.split('.')
  if (domainParts.length > 2) {
    const rootDomain = domainParts.slice(-2).join('.')
    document.cookie = name + '=;path=/;domain=' + rootDomain + ';expires=Thu, 01 Jan 1970 00:00:00 GMT'
  }

  document.cookie = cookieString
}

// Cookie deleter matching path and domains
export function deleteCookie(name: string) {
  if (typeof window === 'undefined') return
  const path = ';path=/'
  const expired = ';expires=Thu, 01 Jan 1970 00:00:00 GMT'
  const isSecure = window.location.protocol === 'https:'
  const secureFlag = isSecure ? ';SameSite=None;Secure' : ';SameSite=Lax'

  document.cookie = name + '=; ' + path + expired + secureFlag
  document.cookie = name + '=; ' + path + ';domain=' + window.location.hostname + expired + secureFlag

  const domainParts = window.location.hostname.split('.')
  if (domainParts.length > 2) {
    const rootDomain = domainParts.slice(-2).join('.')
    document.cookie = name + '=; ' + path + ';domain=' + rootDomain + expired + secureFlag
    document.cookie = name + '=; ' + path + ';domain=.' + rootDomain + expired + secureFlag
  }
}

// Helper to inject CSS to hide the standard Google Translate toolbar and widgets
export function injectTranslateStyles() {
  if (typeof document === 'undefined') return
  const styleId = 'google-translate-custom-styles'
  if (document.getElementById(styleId)) return

  const style = document.createElement('style')
  style.id = styleId
  style.textContent = `
    #google_translate_element {
      position: absolute !important;
      top: -9999px !important;
      left: -9999px !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      opacity: 0 !important;
    }
    .goog-te-banner-frame,
    .goog-te-banner,
    .goog-te-balloon-frame,
    .goog-te-gadget,
    .goog-te-gadget-simple,
    .skiptranslate {
      display: none !important;
    }
    body {
      top: 0 !important;
    }
    /* Disable translate tooltip highlight on hover */
    font[style*="background-color"] {
      background-color: transparent !important;
      box-shadow: none !important;
    }
  `
  document.head.appendChild(style)
}

// Standard language code map — re-exported from central config as langCodeMap

// Reset the app translation and Google Translate cookie instantly without full page refresh
export function resetToEnglish() {
  const cardId = resolveCardOwnerId()
  const storageKey = selectedLanguageStorageKey(cardId)
  localStorage.setItem(storageKey, 'en')

  const host = window.location.hostname
  const root = host.substring(host.indexOf('.') + 1)
  const domains = [host, '.' + host, root, '.' + root]

  const isSecure = window.location.protocol === 'https:'
  const secureFlag = isSecure ? ';SameSite=None;Secure' : ';SameSite=Lax'

  domains.forEach((dom) => {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${dom}${secureFlag}`
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${secureFlag}`
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${dom}`
  })

  // Remove classes and iframes/widgets from DOM
  document.body.classList.remove('translated-ltr', 'translated-rtl')
  const googElements = document.querySelectorAll('[class*="goog"]')
  googElements.forEach((el) => {
    if (el.id !== 'google_translate_element' && !el.classList.contains('skiptranslate')) {
      el.remove()
    }
  })

  // Dispatch event so translation hooks and components update state instantly
  window.dispatchEvent(new Event(I18N_CONFIG.languageChangeEvent))
}

// Separate function to apply configuration settings to cookies and load scripts
export function applyTranslationConfigToDOM(config: TranslationConfig) {
  const cardId = resolveCardOwnerId()
  const storageKey = selectedLanguageStorageKey(cardId)
  const fallback = config.fallback || 'en'

  // Inject custom styling to hide UI immediately
  injectTranslateStyles()

  const savedLanguage = localStorage.getItem(storageKey) || fallback

  const allGoogtransCookies = getAllCookies('googtrans')
  let existingTranslation: string | null = null
  let cookieValue: string | null = null

  // Check googtrans cookies matching the dynamic fallback
  for (let cookie of allGoogtransCookies) {
    cookie = cookie.trim()
    const parts = cookie.split('=')
    if (parts.length >= 2) {
      const val = parts.slice(1).join('=')
      if (val && val.startsWith(`/${fallback}/`) && val !== `/${fallback}/${fallback}`) {
        const langCode = val.split('/')[2]
        if (langCode) {
          existingTranslation = langCode
          cookieValue = val
        }
      }
    }
  }

  // Clean up duplicate cookies if they exist
  if (allGoogtransCookies.length > 1 && cookieValue) {
    deleteCookie('googtrans')
    setTimeout(() => {
      if (existingTranslation) {
        const googleLangCode = LANG_CODE_MAP[existingTranslation] || existingTranslation
        const newCookieValue = `/${fallback}/${googleLangCode}`
        setCookie('googtrans', newCookieValue, 365)
      }
    }, 100)
  }

  // Decide which language code to use
  let languageToUse = fallback
  if (savedLanguage && savedLanguage !== fallback) {
    languageToUse = savedLanguage

    const googleLangCode = LANG_CODE_MAP[languageToUse] || languageToUse
    const expectedCookie = `/${fallback}/${googleLangCode}`
    if (existingTranslation && existingTranslation !== languageToUse) {
      deleteCookie('googtrans')
      setTimeout(() => {
        setCookie('googtrans', expectedCookie, 365)
      }, 100)
    } else if (!existingTranslation) {
      setCookie('googtrans', expectedCookie, 365)
    }
  } else if (savedLanguage === fallback) {
    // Explicitly selected English / fallback. Make sure we use fallback and clear any legacy/lingering translation cookie.
    languageToUse = fallback
    deleteCookie('googtrans')
  } else if (existingTranslation) {
    languageToUse = existingTranslation
    localStorage.setItem(storageKey, existingTranslation)
  } else {
    deleteCookie('googtrans')
    if (savedLanguage !== fallback) {
      localStorage.setItem(storageKey, fallback)
    }
  }

  // Load Translate Element
  if (languageToUse && languageToUse !== fallback) {
    // Clean up stale elements
    const staleElements = document.querySelectorAll('[class*="goog-te"]')
    staleElements.forEach((el) => {
      if (el.id !== 'google_translate_element' && !el.classList.contains('skiptranslate')) {
        el.remove()
      }
    })

    document.body.classList.remove('translated-ltr', 'translated-rtl')

    setTimeout(() => {
      loadGoogleScript(languageToUse, config)
    }, 300)
  } else {
    // Clear cookie & classes if using fallback
    deleteCookie('googtrans')
    document.body.classList.remove('translated-ltr', 'translated-rtl')
    const googElements = document.querySelectorAll('[class*="goog"]')
    googElements.forEach((el) => {
      if (el.id !== 'google_translate_element' && !el.classList.contains('skiptranslate')) {
        el.remove()
      }
    })
  }
}

// Function to fetch config and initialize Google Translate (using localStorage cache)
export async function initTranslation(): Promise<TranslationConfig> {
  const cardId = resolveCardOwnerId()
  const configCacheKey = translationConfigCacheKey(cardId)

  // Sync JSON translations with local storage & backend in the background (NON-BLOCKING)
  syncTranslations().catch((err) => {
    console.error('Background syncTranslations error in initTranslation:', err)
  })

  // Try to load cached config first for instantaneous reload
  let cachedConfig: TranslationConfig | null = null
  try {
    const cachedStr = localStorage.getItem(configCacheKey)
    if (cachedStr) {
      cachedConfig = JSON.parse(cachedStr)
    }
  } catch (e) {
    console.error('Failed to parse cached translation config:', e)
  }

  // Fetch updater to keep config fresh (SWR - Stale-While-Revalidate)
  const fetchAndUpdateConfig = async (): Promise<TranslationConfig> => {
    const res = await fetch(I18N_CONFIG.languagesApiPath)
    if (!res.ok) {
      throw new Error('Failed to fetch languages configuration')
    }
    const config: TranslationConfig = await res.json()
    localStorage.setItem(configCacheKey, JSON.stringify(config))
    return config
  }

  if (cachedConfig) {
    // Apply cached config instantly to DOM
    applyTranslationConfigToDOM(cachedConfig)

    // Run background fetch to keep things fresh
    fetchAndUpdateConfig().catch((err) => {
      console.warn('Background config refresh failed:', err)
    })

    return cachedConfig
  }

  // No cache present - proceed with initial fetch
  try {
    const config = await fetchAndUpdateConfig()
    applyTranslationConfigToDOM(config)
    return config
  } catch (error) {
    console.error('initTranslation error, using fallback:', error)
    const fallbackConfig = buildTranslationConfig()
    applyTranslationConfigToDOM(fallbackConfig)
    return fallbackConfig
  }
}

// Function to load the official script dynamically and define init
function loadGoogleScript(langCode: string, config: TranslationConfig) {
  const includedLangs = config.languages.map((l) => l.code).join(',')
  const fallback = config.fallback || 'en'

  // Define the global callback
  window.googleTranslateElementInit = function () {
    try {
      const existingElement = document.getElementById('google_translate_element')
      if (existingElement) {
        existingElement.innerHTML = ''
      }

      new (
        window.google as {
          translate: { TranslateElement: new (...args: unknown[]) => unknown; InlineLayout: { SIMPLE: unknown } }
        }
      ).translate.TranslateElement(
        {
          pageLanguage: fallback,
          includedLanguages: includedLangs,
          layout: (window.google as { translate: { TranslateElement: { InlineLayout: { SIMPLE: unknown } } } })
            .translate.TranslateElement.InlineLayout.SIMPLE,
          autoDisplay: false,
        },
        'google_translate_element'
      )

      console.log('Google Translate Element initialized successfully for:', langCode)
    } catch (e) {
      console.error('googleTranslateElementInit error:', e)
    }
  }

  // Remove existing scripts if any
  const existingScripts = document.querySelectorAll('script[src*="translate.google.com/translate_a/element.js"]')
  existingScripts.forEach((s) => s.remove())

  // Create new script with timestamp
  const script = document.createElement('script')
  script.type = 'text/javascript'
  const timestampBuster = `?cb=googleTranslateElementInit&t=${Date.now()}`
  script.src = config.scriptUrl.includes('?')
    ? `${config.scriptUrl}&cb=googleTranslateElementInit`
    : `${config.scriptUrl}${timestampBuster}`
  script.async = true

  script.onerror = function () {
    console.error('Failed to load Google Translate script from URL:', config.scriptUrl)
  }

  document.body.appendChild(script)
}

// Helper to apply translation and refresh with subdomain killer
export function applyTranslation(langCode: string, fallback: string = 'en') {
  const cardId = resolveCardOwnerId()
  const storageKey = selectedLanguageStorageKey(cardId)
  localStorage.setItem(storageKey, langCode)

  // Trigger background sync - do not await to avoid delaying the UI translation reload
  syncTranslations().catch((err) => {
    console.error('applyTranslation background sync error:', err)
  })

  const host = window.location.hostname
  const root = host.substring(host.indexOf('.') + 1)
  const domains = [host, '.' + host, root, '.' + root]

  const isSecure = window.location.protocol === 'https:'
  const secureFlag = isSecure ? ';SameSite=None;Secure' : ';SameSite=Lax'

  // Delete all existing googtrans cookies with proper SameSite and Secure flags matching set logic
  domains.forEach((dom) => {
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${dom}${secureFlag}`
    document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${secureFlag}`
  })

  if (langCode !== fallback) {
    const googleLangCode = LANG_CODE_MAP[langCode] || langCode
    const googleValue = `/${fallback}/${googleLangCode}`

    document.cookie = `googtrans=${googleValue}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; domain=${host}${secureFlag}`
    document.cookie = `googtrans=${googleValue}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/${secureFlag}`
  } else {
    // Explicitly set /en/en when returning to English to force Google Translate to revert instantly
    const googleValue = `/${fallback}/${fallback}`
    document.cookie = `googtrans=${googleValue}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; domain=${host}${secureFlag}`
    document.cookie = `googtrans=${googleValue}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/${secureFlag}`
  }

  // Force hard refresh to trigger script update
  setTimeout(() => {
    const cleanUrl = window.location.origin + window.location.pathname + window.location.search
    window.location.href = cleanUrl
  }, 100)
}
