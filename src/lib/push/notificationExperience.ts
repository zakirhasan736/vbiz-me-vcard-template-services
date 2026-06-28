import { LEGACY_NOTIFICATION_CHOICE_KEY, legacyNotifPrefsKey, readFollowState } from '@/lib/push/config'

/** Force-follow modal appears after intro + this delay (v3 behavior). */
export const FORCE_NOTIFICATION_DELAY_MS = 2000

export const PLATFORM_UPDATE_EVENT = 'vbiz_platform_update'
export const PROFILE_EXPERIENCE_SETTLED_EVENT = 'vbiz_profile_experience_settled'

export type NotificationChoiceValue = 'subscribed' | 'declined'

export function notificationChoiceKey(cardOwnerId: string) {
  return `vbiz_notification_choice_${cardOwnerId}`
}

export function hasNotificationChoice(cardOwnerId: string, cardSlug?: string): boolean {
  if (typeof window === 'undefined') return false
  if (cardSlug && readFollowState(cardSlug)?.following) return true
  if (localStorage.getItem(LEGACY_NOTIFICATION_CHOICE_KEY)) return true
  return Boolean(localStorage.getItem(notificationChoiceKey(cardOwnerId)))
}

export function writeNotificationChoice(cardOwnerId: string, value: NotificationChoiceValue) {
  localStorage.setItem(notificationChoiceKey(cardOwnerId), value)
  localStorage.setItem(LEGACY_NOTIFICATION_CHOICE_KEY, value)
}

export function writeContactFlowAsked(cardOwnerId: string, accepted: boolean, preferences?: unknown) {
  localStorage.setItem(
    legacyNotifPrefsKey(cardOwnerId),
    JSON.stringify({ asked: true, accepted, preferences: preferences ?? null })
  )
}

export function hasContactFlowBeenAsked(cardOwnerId: string): boolean {
  if (typeof window === 'undefined') return false
  return Boolean(localStorage.getItem(legacyNotifPrefsKey(cardOwnerId)))
}

export function notifyProfileExperienceSettled() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(PROFILE_EXPERIENCE_SETTLED_EVENT))
}

export function isSubscribedAnywhere(): boolean {
  if (typeof window === 'undefined') return false

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith('vbiz_push_follow_')) continue
    const slug = key.replace('vbiz_push_follow_', '')
    if (readFollowState(slug)?.following) return true
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('vbiz_notification_choice_') && localStorage.getItem(key) === 'subscribed') {
      return true
    }
  }

  return localStorage.getItem(LEGACY_NOTIFICATION_CHOICE_KEY) === 'subscribed'
}
