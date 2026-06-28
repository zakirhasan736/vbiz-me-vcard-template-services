import { resolveCardOwnerId } from '@/lib/i18n/cardScope'
import { LANGUAGE_NAMES, translationsCacheKey } from '@/lib/i18n/config'
import { SYSTEM_PROMPT_TEMPLATE } from '@/lib/liveAgent/systemPromptTemplate'
import type { LiveAgentCardData } from '@/profile-app/lib/liveAgentPrompt'

export function buildCardPayloadForPrompt(data: LiveAgentCardData): string {
  return JSON.stringify({
    ownerName: data.ownerName,
    title: data.title,
    company: data.company,
    email: data.email,
    phone: data.phone,
    website: data.website,
    location: data.location,
  })
}

export function buildSystemPrompt(data: LiveAgentCardData, override?: string): string {
  const cardPayload = buildCardPayloadForPrompt(data)
  return override ?? SYSTEM_PROMPT_TEMPLATE.replace('__CARD_DATA_PLACEHOLDER__', cardPayload)
}

export function getLiveAgentSystemPromptForLanguage(
  langCode: string,
  data: LiveAgentCardData,
  override?: string
): string {
  const base = buildSystemPrompt(data, override)
  const langName = LANGUAGE_NAMES[langCode] || 'English'

  let translationContext = ''
  try {
    if (typeof window !== 'undefined') {
      const cardId = resolveCardOwnerId()
      const storageKey = translationsCacheKey(cardId, langCode)
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        translationContext = `\n\n[CARD TRANSLATIONS CONTEXT IN ${langName.toUpperCase()}]\nBelow are the exact professional translations of the elements rendered on the card. Refer to, use, and respect these exact terms, roles, and details when guiding users or discussing the card content to ensure perfect consistency:\n${cached}`
      }
    }
  } catch {
    /* ignore storage errors */
  }

  if (langCode && langCode !== 'en') {
    return `${base}${translationContext}

CRITICAL LANGUAGE REQUIREMENT:
The user has set their language preference to ${langName} (${langCode}).
You MUST understand and respond ENTIRELY in ${langName}.
Translate all your guides, greetings, responses, and questions into fluent and natural ${langName}.
Do not speak in English unless explicitly asked by the user. Ensure your tone, personality, and humor are natural and culturally appropriate in ${langName}.`
  }

  return `${base}${translationContext}`
}

export function getLiveAgentInitialPromptForLanguage(langCode: string, company = 'vBiz Me'): string {
  const langName = LANGUAGE_NAMES[langCode] || 'English'

  if (langCode && langCode !== 'en') {
    return `The user has just opened the site. Their preferred language is ${langName}. Please say: 'Welcome to ${company}! How can I help you?' (translated to fluent ${langName}) and offer a quick guided tour of the card entirely in ${langName}.`
  }

  return `The user has just opened the site. Please say: 'Welcome to ${company}! How can I help you?' and offer a quick guided tour of the card.`
}

export function getSelectedLanguageForLiveAgent(cardId?: string): string {
  if (typeof window === 'undefined') return 'en'
  const id = cardId ?? resolveCardOwnerId()
  return localStorage.getItem(`selectedLanguage_${id}`) || 'en'
}
