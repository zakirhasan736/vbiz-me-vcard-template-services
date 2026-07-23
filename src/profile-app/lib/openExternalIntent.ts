/** Event name for the tap-to-open fallback when browsers block async tel/mailto/sms/http opens. */
export const VBIZ_EXTERNAL_INTENT_EVENT = 'vbiz_external_intent'

export type ExternalIntentDetail = {
  href: string
  label: string
  description?: string
}

/**
 * Open tel:/mailto:/sms:/https: links from async AI-tool callbacks.
 * Browsers often treat those as non-user-gestures and block popups —
 * we try an immediate anchor click + location fallback, then emit an
 * event so the UI can show a one-tap confirm button.
 */
export function openExternalIntent(href: string, label: string, description?: string): void {
  if (typeof window === 'undefined' || !href) return

  try {
    const anchor = document.createElement('a')
    anchor.href = href
    anchor.rel = 'noopener noreferrer'
    // Keep in same tab for dialer/mail/sms; new tab only for http(s)
    if (/^https?:/i.test(href)) {
      anchor.target = '_blank'
    }
    anchor.style.display = 'none'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
  } catch {
    /* continue to location fallback */
  }

  // Same-tab schemes (tel/mailto/sms) often need location.assign when
  // the synthetic click is ignored outside a user gesture.
  if (/^(tel:|mailto:|sms:)/i.test(href)) {
    try {
      window.setTimeout(() => {
        try {
          window.location.assign(href)
        } catch {
          /* ignore */
        }
      }, 50)
    } catch {
      /* ignore */
    }
  }

  window.dispatchEvent(
    new CustomEvent<ExternalIntentDetail>(VBIZ_EXTERNAL_INTENT_EVENT, {
      detail: { href, label, description },
    })
  )
}

export function toTelHref(phone: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (!digits) return null
  return `tel:${digits}`
}

export function toSmsHref(phone: string, body?: string): string | null {
  const trimmed = phone.trim()
  if (!trimmed) return null
  const digits = trimmed.replace(/[^\d+]/g, '')
  if (!digits) return null
  const text = body?.trim()
  if (!text) return `sms:${digits}`
  // iOS prefers &body=, Android accepts ?body=
  return `sms:${digits}?&body=${encodeURIComponent(text)}`
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

export function toMailtoHref(email: string, subject?: string, body?: string): string | null {
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
