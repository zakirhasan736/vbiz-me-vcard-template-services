import { dispatchGoToProfileSection, dispatchOpenSaveContactFlow } from '@/profile-app/lib/liveAgentEvents'
import type { LiveAgentCardData } from '@/profile-app/lib/liveAgentPrompt'
import { Type, type FunctionCall, type Session } from '@google/genai'

export const LIVE_AGENT_TOOL_DECLARATIONS = [
  {
    name: 'callUser',
    description:
      'Open the device phone dialer to call the business card owner. Use when the visitor asks to call, phone, or reach them by voice.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'emailUser',
    description:
      'Open the device email app with a polished, ready-to-send message to the card owner. Compose subject and body in professional US business English before calling — never paste raw speech or broken transcription.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        subject: {
          type: Type.STRING,
          description:
            'Short professional email subject line (e.g. "Inquiry via vBiz Me card" or "Following up from your digital card").',
        },
        body: {
          type: Type.STRING,
          description:
            'Complete email body in polished US business English: greeting, clear paragraphs, proper punctuation, and a courteous closing. Rewrite dictated speech — fix misspellings, grammar, and filler words. Use real line breaks between paragraphs (newline characters), not plus signs or URL encoding.',
        },
      },
    },
  },
  {
    name: 'saveContact',
    description:
      'Open the Save Contact popup so the visitor can enter their name and email, then download the card owner vCard file. Use when they ask to save contact, add to contacts, or download the contact.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
  {
    name: 'goToHomeSection',
    description:
      'Navigate to the Home section where the Add to Contacts or Save Contact button is shown. Use when guiding a visitor who agreed to save contact but you want them to use the on-screen button.',
    parameters: { type: Type.OBJECT, properties: {} },
  },
] as const

export function buildLiveAgentTools() {
  return [{ functionDeclarations: [...LIVE_AGENT_TOOL_DECLARATIONS] }]
}

function toTelHref(phone: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (!digits) return null
  return `tel:${digits}`
}

function normalizeEmailPlainText(text: string): string {
  return text
    .replace(/\+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function toMailtoHref(email: string, subject?: string, body?: string): string | null {
  const trimmed = email.trim()
  if (!trimmed) return null

  const queryParts: string[] = []
  const subjectText = subject?.trim()
  const bodyText = body?.trim() ? normalizeEmailPlainText(body) : ''

  if (subjectText) queryParts.push(`subject=${encodeURIComponent(subjectText)}`)
  if (bodyText) queryParts.push(`body=${encodeURIComponent(bodyText)}`)

  const query = queryParts.join('&')
  return query ? `mailto:${trimmed}?${query}` : `mailto:${trimmed}`
}

function openExternalUrl(href: string) {
  window.location.href = href
}

function readToolArgs(call: FunctionCall): Record<string, string> {
  const raw = call.args
  if (!raw || typeof raw !== 'object') return {}
  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).map(([key, value]) => [key, String(value ?? '')])
  )
}

export function handleLiveAgentToolCalls(functionCalls: FunctionCall[], session: Session, cardData: LiveAgentCardData) {
  for (const call of functionCalls) {
    let result = 'Action executed successfully'
    const args = readToolArgs(call)

    if (call.name === 'callUser') {
      const href = toTelHref(cardData.phone)
      if (href) {
        openExternalUrl(href)
      } else {
        result = 'No phone number is available on this card.'
      }
    } else if (call.name === 'emailUser') {
      const href = toMailtoHref(cardData.email, args.subject, args.body)
      if (href) {
        openExternalUrl(href)
      } else {
        result = 'No email address is available on this card.'
      }
    } else if (call.name === 'saveContact') {
      dispatchOpenSaveContactFlow()
    } else if (call.name === 'goToHomeSection') {
      dispatchGoToProfileSection('home')
    } else {
      result = `Unknown action: ${call.name ?? 'unnamed'}`
    }

    try {
      session.sendToolResponse({
        functionResponses: {
          id: call.id,
          name: call.name,
          response: { result },
        },
      })
    } catch (e) {
      console.error('Could not send tool response:', e)
    }
  }
}
