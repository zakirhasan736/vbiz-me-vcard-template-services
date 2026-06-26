export type NotificationPreferenceKey = 'contact' | 'video' | 'blog' | 'company'

export type NotificationPreferences = Record<NotificationPreferenceKey, boolean>

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  contact: true,
  video: true,
  blog: true,
  company: true,
}

export type PushSubscriptionKeys = {
  p256dh: string
  auth: string
}

export type PushSubscriptionPayload = {
  endpoint: string
  expirationTime?: number | null
  keys: PushSubscriptionKeys
}

export type StoredPushSubscription = {
  id: string
  cardSlug: string
  cardOwnerId?: string
  endpoint: string
  keys: PushSubscriptionKeys
  preferences: NotificationPreferences
  userAgent?: string
  createdAt: string
  updatedAt: string
}

export type PushSubscribeRequest = {
  cardSlug: string
  cardOwnerId?: string
  subscription: PushSubscriptionPayload
  preferences?: Partial<NotificationPreferences>
}

export type PushPreferencesRequest = {
  cardSlug: string
  endpoint: string
  preferences: NotificationPreferences
}

export type PushUnsubscribeRequest = {
  cardSlug: string
  endpoint: string
}

export type PushStatusResponse = {
  following: boolean
  permission: NotificationPermission | 'unsupported'
  preferences: NotificationPreferences | null
  endpoint: string | null
}

export type PushTestRequest = {
  cardSlug: string
  title?: string
  body?: string
}

export type PushSimulateRequest = {
  cardSlug: string
  category?: NotificationPreferenceKey
  title: string
  body: string
  url?: string
}
