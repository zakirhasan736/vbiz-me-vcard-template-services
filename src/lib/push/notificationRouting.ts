import {
  clearNotificationDeclinedForCard,
  hasDeclinedNotificationPrompt,
  markNotificationDeclinedForCard,
} from '@/lib/push/notificationExperience'
import { getCachedCardPushStatus, invalidateCardPushStatus, setCachedCardPushStatus } from '@/lib/push/pushStatusCache'
import type { NotificationPreferences } from '@/lib/push/types'
import { DEFAULT_NOTIFICATION_PREFERENCES, fetchPushStatus, isPushSupported } from '@/profile-app/lib/pushNotifications'

export type NotificationModalTarget = 'settings' | 'follow'

/** Check backend subscription status for this profile slug (cached ~60s). */
export async function isSubscribedToCard(cardSlug: string, options?: { forceRefresh?: boolean }): Promise<boolean> {
  if (!cardSlug.trim()) return false

  if (!options?.forceRefresh) {
    const cached = getCachedCardPushStatus(cardSlug)
    if (cached) return cached.following
  }

  if (!isPushSupported()) return false

  try {
    const status = await fetchPushStatus(cardSlug)
    return status.following
  } catch {
    return false
  }
}

/** Route alert / bell clicks: settings when API says subscribed, follow popup otherwise. */
export async function resolveNotificationModalTarget(cardSlug: string): Promise<NotificationModalTarget> {
  return (await isSubscribedToCard(cardSlug)) ? 'settings' : 'follow'
}

/** Whether the auto first-visit follow prompt should appear for this card. */
export async function shouldAutoShowNotificationPrompt(cardSlug: string): Promise<boolean> {
  if (!cardSlug.trim() || hasDeclinedNotificationPrompt(cardSlug)) return false
  if (!isPushSupported()) return false
  return !(await isSubscribedToCard(cardSlug))
}

/** Refresh subscription state from GET /push/subscription-status. */
export async function syncCardSubscriptionStatus(cardSlug: string): Promise<boolean> {
  if (!cardSlug.trim() || !isPushSupported()) return false

  try {
    const status = await fetchPushStatus(cardSlug, { forceRefresh: true })
    return status.following
  } catch {
    return false
  }
}

export function markNotificationDeclined(cardSlug: string) {
  markNotificationDeclinedForCard(cardSlug)
}

export function markNotificationSubscribed(cardSlug: string) {
  clearNotificationDeclinedForCard(cardSlug)
  invalidateCardPushStatus(cardSlug)
  setCachedCardPushStatus(cardSlug, {
    following: true,
    preferences: DEFAULT_NOTIFICATION_PREFERENCES,
  })
}

export async function getCardNotificationPreferences(cardSlug: string): Promise<NotificationPreferences | null> {
  const cached = getCachedCardPushStatus(cardSlug)
  if (cached?.preferences) return cached.preferences

  try {
    const status = await fetchPushStatus(cardSlug)
    return status.preferences
  } catch {
    return null
  }
}
