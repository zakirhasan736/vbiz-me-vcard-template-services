import { readFollowState } from '@/profile-app/lib/pushNotifications'

export function notificationChoiceKey(cardOwnerId: string) {
  return `vbiz_notification_choice_${cardOwnerId}`
}

export function hasNotificationChoice(cardOwnerId: string, cardSlug?: string): boolean {
  if (typeof window === 'undefined') return false
  if (cardSlug && readFollowState(cardSlug)?.following) return true
  return Boolean(localStorage.getItem(notificationChoiceKey(cardOwnerId)))
}

export function notifyProfileExperienceSettled() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('vbiz_profile_experience_settled'))
}
