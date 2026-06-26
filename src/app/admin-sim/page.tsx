'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NotificationPreferenceKey } from '@/lib/push/types'

type CardSummary = {
  cardSlug: string
  subscribers: number
  lastUpdatedAt: string
}

type SendResult = {
  matched: number
  attempted: number
  delivered: number
  failed: number
}

type CategoryPreset = {
  key: NotificationPreferenceKey
  label: string
  emoji: string
  title: string
  body: (slug: string) => string
}

const CATEGORY_PRESETS: CategoryPreset[] = [
  {
    key: 'contact',
    label: 'Contact info',
    emoji: '📇',
    title: 'Contact details updated',
    body: () => 'New contact information was just added to a card you follow.',
  },
  {
    key: 'video',
    label: 'New video',
    emoji: '🎬',
    title: 'New video posted',
    body: () => 'A new video was just published. Tap to watch it now.',
  },
  {
    key: 'blog',
    label: 'New blog',
    emoji: '📝',
    title: 'New blog post',
    body: () => 'A fresh blog post is live. Tap to read the latest update.',
  },
  {
    key: 'company',
    label: 'Company update',
    emoji: '🏢',
    title: 'Company update',
    body: () => 'There is a new company announcement on a card you follow.',
  },
]

export default function AdminSimulatorPage() {
  const [cards, setCards] = useState<CardSummary[]>([])
  const [loadingCards, setLoadingCards] = useState(true)
  const [selectedSlug, setSelectedSlug] = useState('')
  const [category, setCategory] = useState<NotificationPreferenceKey | 'all'>('all')
  const [title, setTitle] = useState('vBiz Me Update')
  const [body, setBody] = useState('There is a new update on a card you follow.')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [manualSlug, setManualSlug] = useState('')

  const loadCards = useCallback(async () => {
    setLoadingCards(true)
    setError(null)
    try {
      const res = await fetch('/api/push/cards', { cache: 'no-store' })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Failed to load cards')
      const list = (json.data ?? []) as CardSummary[]
      setCards(list)
      setSelectedSlug((current) => current || list[0]?.cardSlug || '')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load cards')
    } finally {
      setLoadingCards(false)
    }
  }, [])

  useEffect(() => {
    void loadCards()
  }, [loadCards])

  const effectiveSlug = (manualSlug.trim() || selectedSlug).trim()

  const applyPreset = useCallback((preset: CategoryPreset) => {
    setCategory(preset.key)
    setTitle(preset.title)
    setBody(preset.body(''))
  }, [])

  const selectedCard = useMemo(
    () => cards.find((card) => card.cardSlug === effectiveSlug) ?? null,
    [cards, effectiveSlug]
  )

  const send = useCallback(async () => {
    if (!effectiveSlug) {
      setError('Pick or type a card slug first.')
      return
    }
    setSending(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch('/api/push/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardSlug: effectiveSlug,
          category: category === 'all' ? undefined : category,
          title,
          body,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.error ?? 'Failed to send notification')
      setResult(json.data as SendResult)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }, [body, category, effectiveSlug, title])

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <header className="mb-8">
          <span className="inline-flex items-center rounded-full bg-amber-500/15 px-3 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-500/30">
            Demo only · mimics the Laravel admin
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">Push Notification Simulator</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            This page stands in for the real admin on <code className="text-slate-300">app.vbizme.com</code>.
            Sending here fires a real web push to every browser that followed the selected card locally — exactly
            what the backend will do once the push pipeline is built.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-slate-300">1 · Choose a followed card</h2>
            <button
              type="button"
              onClick={() => void loadCards()}
              className="rounded-lg px-2.5 py-1 text-xs text-slate-400 ring-1 ring-slate-700 transition hover:text-slate-100 hover:ring-slate-500"
            >
              Refresh
            </button>
          </div>

          {loadingCards ? (
            <p className="mt-3 text-sm text-slate-500">Loading cards…</p>
          ) : cards.length === 0 ? (
            <div className="mt-3 rounded-xl border border-dashed border-slate-700 bg-slate-900 p-4 text-sm text-slate-400">
              No local followers yet. Open a card, click <span className="text-slate-200">Follow</span> and accept
              notifications, then refresh this list. You can also type a slug manually below.
            </div>
          ) : (
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {cards.map((card) => {
                const active = card.cardSlug === effectiveSlug
                return (
                  <button
                    key={card.cardSlug}
                    type="button"
                    onClick={() => {
                      setManualSlug('')
                      setSelectedSlug(card.cardSlug)
                    }}
                    className={`rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : 'border-slate-800 bg-slate-900 hover:border-slate-600'
                    }`}
                  >
                    <div className="truncate text-sm font-medium text-slate-100">{card.cardSlug}</div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {card.subscribers} follower{card.subscribers === 1 ? '' : 's'}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          <label className="mt-4 block text-xs text-slate-400">
            Or enter a card slug manually
            <input
              value={manualSlug}
              onChange={(e) => setManualSlug(e.target.value)}
              placeholder="e.g. michael-angelo"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
          </label>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-medium text-slate-300">2 · Pick what changed</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory('all')}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                category === 'all'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📢 All followers
            </button>
            {CATEGORY_PRESETS.map((preset) => (
              <button
                key={preset.key}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  category === preset.key
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {preset.emoji} {preset.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {category === 'all'
              ? 'Sends to every follower of this card.'
              : 'Sends only to followers who enabled this category in their notification settings.'}
          </p>
        </section>

        <section className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h2 className="text-sm font-medium text-slate-300">3 · Message</h2>
          <label className="mt-3 block text-xs text-slate-400">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
          </label>
          <label className="mt-3 block text-xs text-slate-400">
            Body
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="mt-1 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
            />
          </label>
        </section>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || !effectiveSlug}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send notification'}
          </button>
          {effectiveSlug && (
            <span className="text-xs text-slate-500">
              → <code className="text-slate-300">{effectiveSlug}</code>
              {selectedCard ? ` · ${selectedCard.subscribers} follower(s)` : ''}
            </span>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
            Matched {result.matched} follower(s) · targeted {result.attempted} · delivered{' '}
            <strong>{result.delivered}</strong>
            {result.failed > 0 ? ` · ${result.failed} failed` : ''}.
            {result.attempted === 0 && (
              <div className="mt-1 text-emerald-300/80">
                No one matched — they may not have enabled this category, or there are no followers yet.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
