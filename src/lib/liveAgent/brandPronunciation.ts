/** Written brand (UI, card data). */
export const VBIZ_ME_DISPLAY_BRAND = 'vBiz Me'

/**
 * TTS form for vBiz Me — "Vee" = letter V, then Biz, then Me.
 * Spaces only (no commas): normal speech rhythm, sounds like vBiz Me (vee-biz-me).
 */
export const VBIZ_ME_SPOKEN_BRAND = 'Vee Biz Me'

export const VBIZ_ME_GREETING_TRIGGER = 'The user has just opened the site...'

export function isVbizMeBrand(company: string): boolean {
  const norm = company
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return norm === 'vbizme' || norm === 'vbiz'
}

export function spokenCompanyName(company: string): string {
  return isVbizMeBrand(company) ? VBIZ_ME_SPOKEN_BRAND : company.trim()
}

export function buildGreetingText(company: string): string {
  const spoken = spokenCompanyName(company)
  return `Welcome to ${spoken}! How can I help you? I can offer a quick guided tour of the card if you'd like.`
}

/** @deprecated Use buildGreetingText(company) */
export const VBIZ_ME_GREETING_TEXT = buildGreetingText(VBIZ_ME_DISPLAY_BRAND)

const VBIZ_PRONUNCIATION_RULES = `
When saying the vBiz Me company name in ANY voice response, always write it exactly as: ${VBIZ_ME_SPOKEN_BRAND}
Pronounce as one natural brand phrase at normal conversational speed: vee-biz-me (letter V + Biz + Me).

Rules:
* Use spaces only — NO commas, NO hyphens, NO slow syllable-by-syllable delivery, NO robotic gaps.
* NEVER say: viz me, viz biz, vibz, vibes, biv me, viv me, biz me alone, or mash into one garbled word.
* NEVER write vBiz Me, Vbiz Me, or Vbizme in spoken/TTS output — TTS misreads as "viz".
* The V must sound like the letter V (written as "Vee" in TTS text), then Biz, then Me — all in one flowing phrase.
`.trim()

export function buildVoicePronunciationBlock(company: string): string {
  const spoken = spokenCompanyName(company)
  const greetingText = buildGreetingText(company)

  const brandRules = isVbizMeBrand(company)
    ? VBIZ_PRONUNCIATION_RULES
    : `
When saying the business name "${company.trim()}", pronounce it clearly for text-to-speech.
Write the spoken form exactly as: ${spoken}
Do not garble, abbreviate, skip words, or mispronounce syllables in the business name.
`.trim()

  return `
VOICE AND TTS PRONUNCIATION — BRAND NAME (CRITICAL)
========================================================

Your responses are spoken aloud through text-to-speech.

${brandRules}

The initial greeting MUST use this exact wording:
"${greetingText}"

Do not alter, shorten, or reword the greeting. The business name must be heard clearly in the first sentence.

Apply "${spoken}" every time you say this business or brand name in a voice response.
`.trim()
}

export const BRAND_PRONUNCIATION_PRIORITY_OVERRIDE = `
PRIORITY OVERRIDE — BRAND PRONUNCIATION (ALWAYS WINS)
====================================================

If any earlier instruction conflicts with brand pronunciation, follow these rules:

* vBiz Me is always spoken as: ${VBIZ_ME_SPOKEN_BRAND} — one fluid phrase at normal speed (vee-biz-me).
* Never viz me, vibz, biv me, biz me alone, or slow robotic syllable gaps.
* The first greeting after site open must match the exact greeting text in the system prompt — no substitutions.
* In every voice response, write the brand using the TTS-safe spoken form from the pronunciation block.
`.trim()

const VBIZ_GREETING_PRONUNCIATION_NOTE =
  ' CRITICAL: Say the brand as one natural phrase at normal speed — vee-biz-me (letter V + Biz + Me). Use the exact TTS wording. NO comma pauses. NO slow spelling. NEVER viz me, vibz, biv me, or biz me alone. Your entire spoken response is ONLY the greeting sentence.'

export function buildLiveAgentGreetingIntroPrompt(company: string, langCode = 'en'): string {
  const trimmed = company.trim() || VBIZ_ME_DISPLAY_BRAND
  const greetingText = buildGreetingText(trimmed)
  const pronunciationNote = isVbizMeBrand(trimmed) ? VBIZ_GREETING_PRONUNCIATION_NOTE : ''

  if (langCode && langCode !== 'en') {
    const brandNote = isVbizMeBrand(trimmed)
      ? ` Keep the vBiz Me brand as "${VBIZ_ME_SPOKEN_BRAND}" (vee-biz-me) — one fluid phrase, never viz me.`
      : ` Pronounce the business name "${spokenCompanyName(trimmed)}" clearly.`
    return `${VBIZ_ME_GREETING_TRIGGER} Their preferred language is not English — translate naturally but${brandNote} Say the equivalent of: "${greetingText}" and offer a quick guided tour.${pronunciationNote}`
  }

  return `${VBIZ_ME_GREETING_TRIGGER} Speak aloud immediately. Your entire spoken response must be EXACTLY: "${greetingText}"${pronunciationNote}`
}
