/** TTS-safe vBiz Me brand — write "Vee" not "V" so Gemini Live does not say "viz" or "vibz". */
export const VBIZ_ME_SPOKEN_BRAND = 'Vee, Biz, Me'

export const VBIZ_ME_GREETING_TRIGGER = 'The user has just opened the site...'

export function isVbizMeBrand(company: string): boolean {
  const norm = company
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
  return norm === 'vbizme' || norm === 'vbiz'
}

/** Spoken form for TTS — vBiz Me always uses the three-part brand; other companies use trimmed display name. */
export function spokenCompanyName(company: string): string {
  return isVbizMeBrand(company) ? VBIZ_ME_SPOKEN_BRAND : company.trim()
}

export function buildGreetingText(company: string): string {
  const spoken = spokenCompanyName(company)
  return `Welcome to ${spoken}! How can I help you? I can offer a quick guided tour of the card if you'd like.`
}

/** @deprecated Use buildGreetingText('vBiz Me') — kept for imports. */
export const VBIZ_ME_GREETING_TEXT = buildGreetingText('vBiz Me')

const VBIZ_ME_PRONUNCIATION_RULES = `
When saying the vBiz Me company name in ANY voice response, always write it exactly as: ${VBIZ_ME_SPOKEN_BRAND}
(three parts with brief pauses: Vee, then Biz, then Me).

Never write or speak these wrong forms:
* vBiz Me, vbizme, Vbizme, viz me, vee biz me mashed as one word
* biz me, Biz Me alone (drops Vee)
* vibz, vibes, vibz me, biv me, viv me (garbled mash-ups)
* welcome to biz me (missing Vee entirely)
* the letter V alone without Biz and Me
`.trim()

export function buildVoicePronunciationBlock(company: string): string {
  const spoken = spokenCompanyName(company)
  const greetingText = buildGreetingText(company)

  const brandRules = isVbizMeBrand(company)
    ? VBIZ_ME_PRONUNCIATION_RULES
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

The initial greeting MUST use this exact wording — every word, every comma:
"${greetingText}"

Do not alter, shorten, or reword the greeting. The business name must be heard clearly in the first sentence.

Apply the spoken form "${spoken}" every time you say this business or brand name in a voice response.
`.trim()
}

/** @deprecated Use buildVoicePronunciationBlock(company) */
export const VBIZ_ME_VOICE_PRONUNCIATION = buildVoicePronunciationBlock('vBiz Me')

const VBIZ_PRONUNCIATION_NOTE =
  ' CRITICAL pronunciation: the company name is three separate parts in order — Vee (the letter V sound), then Biz (B-I-Z), then Me. Pause briefly between each part. Never skip Vee. Never say "biz me", "viz me", "vibz", "vibes", "biv me", "vee biz" as one mashed word, or any garbled variation.'

/** Client turn on connect — forces exact greeting wording and pronunciation. */
export function buildLiveAgentGreetingIntroPrompt(company: string, langCode = 'en'): string {
  const trimmedCompany = company.trim() || 'vBiz Me'
  const greetingText = buildGreetingText(trimmedCompany)
  const pronunciationNote = isVbizMeBrand(trimmedCompany) ? VBIZ_PRONUNCIATION_NOTE : ''

  if (langCode && langCode !== 'en') {
    const brandNote = isVbizMeBrand(trimmedCompany)
      ? ' Keep the vBiz Me brand as three spoken parts: Vee, Biz, Me.'
      : ` Pronounce the business name "${spokenCompanyName(trimmedCompany)}" clearly.`
    return `${VBIZ_ME_GREETING_TRIGGER} Their preferred language is not English — translate the greeting naturally but${brandNote} Say the equivalent of: "${greetingText}" and offer a quick guided tour of the card.${pronunciationNote} Respond aloud with ONLY the greeting sentence — no meta-commentary.`
  }

  return `${VBIZ_ME_GREETING_TRIGGER} Speak aloud immediately. Your entire spoken response must be EXACTLY this greeting — word for word, do not rephrase, shorten, or add anything before or after: "${greetingText}"${pronunciationNote}`
}

export const BRAND_PRONUNCIATION_PRIORITY_OVERRIDE = `
PRIORITY OVERRIDE — BRAND PRONUNCIATION (ALWAYS WINS)
====================================================

If any earlier instruction conflicts with brand pronunciation, follow these rules:

* vBiz Me is always spoken as three parts: Vee, Biz, Me — never "viz me", "vibz", "biv me", or "biz me" alone.
* The first greeting after site open must match the exact greeting text in the system prompt — no substitutions.
* In every voice response, write the brand using the TTS-safe spoken form from the pronunciation block.
`.trim()
