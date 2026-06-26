import { createHash } from 'crypto'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import { getApiBaseUrl } from '@/lib/api/serverApi'
import { sendPushToCard } from './send'
import { listFollowedCardSlugs } from './store'

const SNAPSHOT_PATH = path.join(process.cwd(), 'data', 'push-update-snapshots.json')

type SnapshotFile = {
  cards: Record<
    string,
    {
      hash: string
      checkedAt: string
      notifiedAt?: string
    }
  >
}

type CardPollResult = {
  cardSlug: string
  changed: boolean
  baselineCreated: boolean
  delivered?: number
  failed?: number
  error?: string
}

async function readSnapshots(): Promise<SnapshotFile> {
  try {
    const raw = await readFile(SNAPSHOT_PATH, 'utf8')
    const parsed = JSON.parse(raw) as SnapshotFile
    return { cards: parsed.cards ?? {} }
  } catch {
    return { cards: {} }
  }
}

async function writeSnapshots(snapshots: SnapshotFile) {
  await mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true })
  await writeFile(SNAPSHOT_PATH, JSON.stringify(snapshots, null, 2), 'utf8')
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(',')}]`
  }
  if (value && typeof value === 'object') {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson((value as Record<string, unknown>)[key])}`)
      .join(',')}}`
  }
  return JSON.stringify(value)
}

function hashPayload(payload: unknown): string {
  return createHash('sha256').update(stableJson(payload)).digest('hex')
}

async function fetchLiveCardPayload(cardSlug: string): Promise<unknown> {
  const response = await fetch(`${getApiBaseUrl()}/v/${encodeURIComponent(cardSlug)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`)
  }

  return response.json()
}

export async function pollFollowedCardUpdates(): Promise<{
  checked: number
  changed: number
  results: CardPollResult[]
}> {
  const cardSlugs = await listFollowedCardSlugs()
  const snapshots = await readSnapshots()
  const now = new Date().toISOString()
  const results: CardPollResult[] = []

  for (const cardSlug of cardSlugs) {
    try {
      const payload = await fetchLiveCardPayload(cardSlug)
      const hash = hashPayload(payload)
      const previous = snapshots.cards[cardSlug]

      if (!previous) {
        snapshots.cards[cardSlug] = { hash, checkedAt: now }
        results.push({ cardSlug, changed: false, baselineCreated: true })
        continue
      }

      if (previous.hash === hash) {
        snapshots.cards[cardSlug] = { ...previous, checkedAt: now }
        results.push({ cardSlug, changed: false, baselineCreated: false })
        continue
      }

      const sendResult = await sendPushToCard(cardSlug, {
        title: 'vBiz Me card updated',
        body: 'A card you follow has new information. Tap to view the latest version.',
        url: `/vcard/${cardSlug}`,
        category: 'company',
      })

      snapshots.cards[cardSlug] = { hash, checkedAt: now, notifiedAt: now }
      results.push({
        cardSlug,
        changed: true,
        baselineCreated: false,
        delivered: sendResult.delivered,
        failed: sendResult.failed,
      })
    } catch (error) {
      results.push({
        cardSlug,
        changed: false,
        baselineCreated: false,
        error: error instanceof Error ? error.message : 'Could not check card',
      })
    }
  }

  await writeSnapshots(snapshots)

  return {
    checked: results.length,
    changed: results.filter((result) => result.changed).length,
    results,
  }
}
