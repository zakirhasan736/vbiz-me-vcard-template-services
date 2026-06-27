import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferenceKey,
  type NotificationPreferences,
  type PushStatusResponse,
  type PushSubscriptionPayload,
} from '@/lib/push/types'

export { DEFAULT_NOTIFICATION_PREFERENCES }
export type { NotificationPreferenceKey, NotificationPreferences }

export const SERVICE_WORKER_PATH = '/sw.js'

function getPushApiBase() {
  const base =
    process.env.NEXT_PUBLIC_PUSH_API_URL?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
    ''
  if (!base) {
    throw new Error('Push API is not configured. Set NEXT_PUBLIC_API_URL or NEXT_PUBLIC_PUSH_API_URL.')
  }
  return base
}

function pushApiUrl(path: string) {
  return `${getPushApiBase()}/push${path}`
}

export const NOTIFICATION_PREFERENCE_OPTIONS: Array<{ id: NotificationPreferenceKey; label: string }> = [
  { id: 'contact', label: '📞 Updated contact info' },
  { id: 'video', label: '🎬 New videos or photos' },
  { id: 'blog', label: '📝 New blog posts' },
  { id: 'services', label: '🛠️ Services section updates' },
  { id: 'company', label: '🏢 Professional updates' },
]

export function isPushSupported() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

export function followStorageKey(cardSlug: string) {
  return `vbiz_push_follow_${cardSlug}`
}

export function subscriptionStorageKey() {
  return 'vbiz_push_subscription'
}

export function readFollowState(cardSlug: string) {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(followStorageKey(cardSlug))
  if (!raw) return null
  try {
    return JSON.parse(raw) as {
      following: boolean
      preferences: NotificationPreferences
      subscribedAt?: string
    }
  } catch {
    return null
  }
}

export function writeFollowState(
  cardSlug: string,
  state: { following: boolean; preferences: NotificationPreferences; subscribedAt?: string }
) {
  localStorage.setItem(followStorageKey(cardSlug), JSON.stringify(state))
}

export function clearFollowState(cardSlug: string) {
  localStorage.removeItem(followStorageKey(cardSlug))
}

export function readStoredSubscription(): PushSubscriptionPayload | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(subscriptionStorageKey())
  if (!raw) return null
  try {
    return JSON.parse(raw) as PushSubscriptionPayload
  } catch {
    return null
  }
}

export function writeStoredSubscription(subscription: PushSubscription) {
  const payload = subscriptionToPayload(subscription)
  localStorage.setItem(subscriptionStorageKey(), JSON.stringify(payload))
  return payload
}

export function clearStoredSubscription() {
  localStorage.removeItem(subscriptionStorageKey())
}

export function subscriptionToPayload(subscription: PushSubscription): PushSubscriptionPayload {
  const json = subscription.toJSON()
  return {
    endpoint: json.endpoint!,
    expirationTime: json.expirationTime ?? null,
    keys: {
      p256dh: json.keys!.p256dh!,
      auth: json.keys!.auth!,
    },
  }
}

export const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerServiceWorker() {
  if (!isPushSupported()) return null
  try {
    return await navigator.serviceWorker.register(SERVICE_WORKER_PATH)
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

export async function getReadyRegistration() {
  if (!isPushSupported()) return null
  await registerServiceWorker()
  return navigator.serviceWorker.ready
}

export async function getExistingSubscription() {
  const registration = await getReadyRegistration()
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

export async function fetchPushStatus(cardSlug: string, endpoint?: string | null): Promise<PushStatusResponse> {
  const query = endpoint ? `?endpoint=${encodeURIComponent(endpoint)}` : ''
  const response = await fetch(pushApiUrl(`/status/${encodeURIComponent(cardSlug)}${query}`))
  const json = (await response.json()) as { success: boolean; data: PushStatusResponse }
  return {
    ...json.data,
    permission: getNotificationPermission(),
  }
}

export async function subscribeToCard(options: {
  cardSlug: string
  cardOwnerId?: string
  preferences?: Partial<NotificationPreferences>
}) {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported in this browser.')
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    throw new Error('Notification permission was not granted.')
  }

  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  if (!vapidPublicKey) {
    throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not configured.')
  }

  const registration = await getReadyRegistration()
  if (!registration) {
    throw new Error('Could not register the service worker.')
  }

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const payload = writeStoredSubscription(subscription)
  const preferences = {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...options.preferences,
  }

  const response = await fetch(pushApiUrl('/subscribe'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cardSlug: options.cardSlug,
      cardOwnerId: options.cardOwnerId,
      subscription: payload,
      preferences,
    }),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(error?.error ?? 'Could not save subscription.')
  }

  writeFollowState(options.cardSlug, {
    following: true,
    preferences,
    subscribedAt: new Date().toISOString(),
  })

  return { subscription, preferences }
}

export async function updateCardPreferences(cardSlug: string, preferences: NotificationPreferences) {
  const stored = readStoredSubscription()
  if (!stored) {
    throw new Error('No browser subscription found.')
  }

  const response = await fetch(pushApiUrl('/preferences'), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cardSlug,
      endpoint: stored.endpoint,
      preferences,
    }),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(error?.error ?? 'Could not update preferences.')
  }

  writeFollowState(cardSlug, {
    following: true,
    preferences,
    subscribedAt: readFollowState(cardSlug)?.subscribedAt,
  })

  return preferences
}

export async function unsubscribeFromCard(cardSlug: string) {
  const registration = await getReadyRegistration()
  const subscription = await registration?.pushManager.getSubscription()
  const stored = readStoredSubscription()

  if (stored) {
    await fetch(pushApiUrl('/unsubscribe'), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardSlug,
        endpoint: stored.endpoint,
      }),
    }).catch(() => {
      /* still clear browser state if backend call fails */
    })
  }

  if (subscription) {
    await subscription.unsubscribe()
  }

  clearStoredSubscription()
  clearFollowState(cardSlug)
}

export async function sendTestNotification(cardSlug: string, title?: string, body?: string) {
  const response = await fetch(pushApiUrl('/test'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardSlug, title, body }),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as { error?: string } | null
    throw new Error(error?.error ?? 'Could not send test notification.')
  }

  return response.json()
}
