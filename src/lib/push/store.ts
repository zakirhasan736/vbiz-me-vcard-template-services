import { createHash } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import {
  DEFAULT_NOTIFICATION_PREFERENCES,
  type NotificationPreferences,
  type PushSubscribeRequest,
  type StoredPushSubscription,
} from './types'

const STORE_PATH = path.join(process.cwd(), 'data', 'push-store.json')

type PushStoreFile = {
  subscriptions: StoredPushSubscription[]
}

async function readStore(): Promise<PushStoreFile> {
  try {
    const raw = await readFile(STORE_PATH, 'utf8')
    const parsed = JSON.parse(raw) as PushStoreFile
    return { subscriptions: parsed.subscriptions ?? [] }
  } catch {
    return { subscriptions: [] }
  }
}

async function writeStore(store: PushStoreFile) {
  await mkdir(path.dirname(STORE_PATH), { recursive: true })
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2), 'utf8')
}

function subscriptionId(endpoint: string) {
  return createHash('sha256').update(endpoint).digest('hex').slice(0, 24)
}

function normalizePreferences(preferences?: Partial<NotificationPreferences>): NotificationPreferences {
  return {
    ...DEFAULT_NOTIFICATION_PREFERENCES,
    ...preferences,
  }
}

export async function upsertSubscription(payload: PushSubscribeRequest, userAgent?: string | null) {
  const store = await readStore()
  const now = new Date().toISOString()
  const id = subscriptionId(payload.subscription.endpoint)
  const existingIndex = store.subscriptions.findIndex((item) => item.id === id)

  const next: StoredPushSubscription = {
    id,
    cardSlug: payload.cardSlug.trim(),
    cardOwnerId: payload.cardOwnerId,
    endpoint: payload.subscription.endpoint,
    keys: payload.subscription.keys,
    preferences: normalizePreferences(payload.preferences),
    userAgent: userAgent ?? undefined,
    createdAt: existingIndex >= 0 ? store.subscriptions[existingIndex].createdAt : now,
    updatedAt: now,
  }

  if (existingIndex >= 0) {
    store.subscriptions[existingIndex] = next
  } else {
    store.subscriptions.push(next)
  }

  await writeStore(store)
  return next
}

export async function updatePreferences(
  cardSlug: string,
  endpoint: string,
  preferences: NotificationPreferences
) {
  const store = await readStore()
  const id = subscriptionId(endpoint)
  const index = store.subscriptions.findIndex((item) => item.id === id && item.cardSlug === cardSlug)
  if (index < 0) return null

  store.subscriptions[index] = {
    ...store.subscriptions[index],
    preferences,
    updatedAt: new Date().toISOString(),
  }

  await writeStore(store)
  return store.subscriptions[index]
}

export async function removeSubscription(cardSlug: string, endpoint: string) {
  const store = await readStore()
  const id = subscriptionId(endpoint)
  const before = store.subscriptions.length
  store.subscriptions = store.subscriptions.filter(
    (item) => !(item.id === id && item.cardSlug === cardSlug.trim())
  )

  if (store.subscriptions.length === before) return false

  await writeStore(store)
  return true
}

export async function getSubscription(cardSlug: string, endpoint: string) {
  const store = await readStore()
  const id = subscriptionId(endpoint)
  return store.subscriptions.find((item) => item.id === id && item.cardSlug === cardSlug.trim()) ?? null
}

export async function listSubscriptionsForCard(cardSlug: string) {
  const store = await readStore()
  return store.subscriptions.filter((item) => item.cardSlug === cardSlug.trim())
}

export type CardSubscriptionSummary = {
  cardSlug: string
  subscribers: number
  lastUpdatedAt: string
}

export async function listCardsWithSubscriptions(): Promise<CardSubscriptionSummary[]> {
  const store = await readStore()
  const map = new Map<string, CardSubscriptionSummary>()

  for (const item of store.subscriptions) {
    const existing = map.get(item.cardSlug)
    if (existing) {
      existing.subscribers += 1
      if (item.updatedAt > existing.lastUpdatedAt) existing.lastUpdatedAt = item.updatedAt
    } else {
      map.set(item.cardSlug, {
        cardSlug: item.cardSlug,
        subscribers: 1,
        lastUpdatedAt: item.updatedAt,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.lastUpdatedAt.localeCompare(a.lastUpdatedAt))
}

export async function listFollowedCardSlugs(): Promise<string[]> {
  const cards = await listCardsWithSubscriptions()
  return cards.map((card) => card.cardSlug)
}
