'use client'

import {
  NOTIFICATION_PREFERENCE_OPTIONS,
  readFollowState,
  sendTestNotification,
  unsubscribeFromCard,
  updateCardPreferences,
} from '@/lib/push/config'
import type { NotificationPreferenceKey, NotificationPreferences } from '@/lib/push/types'
import { Bell, Save, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

function readInitialPreferences(cardSlug: string): NotificationPreferences {
  const followState = readFollowState(cardSlug)
  if (followState?.preferences) return followState.preferences

  return {
    contact: true,
    video: true,
    blog: true,
    company: true,
    services: true,
  }
}

const NotificationSettingsForm = ({ cardSlug, onClose }: { cardSlug: string; onClose: () => void }) => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => readInitialPreferences(cardSlug))
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [unfollowing, setUnfollowing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const togglePreference = (pref: NotificationPreferenceKey) => {
    setPreferences((prev) => ({ ...prev, [pref]: !prev[pref] }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      await updateCardPreferences(cardSlug, preferences)
      setMessage('Preferences saved.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save preferences.')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    setTesting(true)
    setError(null)
    setMessage(null)
    try {
      await sendTestNotification(cardSlug, 'vBiz Me Update', 'This is a test push notification for your followed card.')
      setMessage('Test notification sent.')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send test notification.')
    } finally {
      setTesting(false)
    }
  }

  const handleUnfollow = async () => {
    setUnfollowing(true)
    setError(null)
    setMessage(null)
    try {
      await unsubscribeFromCard(cardSlug)
      setMessage('You unfollowed this card.')
      window.setTimeout(onClose, 800)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not unfollow this card.')
    } finally {
      setUnfollowing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 p-4 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-zinc-800 p-1.5 text-zinc-400 transition-colors hover:text-zinc-200"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col text-left">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
              <Bell size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-100">Notification Settings</h2>
          </div>

          <p className="mb-6 text-sm text-zinc-400">Choose what to get notified about:</p>

          <div className="mb-6 w-full space-y-3 rounded-xl bg-zinc-950/50 p-4 text-sm text-zinc-300">
            {NOTIFICATION_PREFERENCE_OPTIONS.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={preferences[p.id]}
                  onChange={() => togglePreference(p.id)}
                  className="rounded border-zinc-700 bg-zinc-800 text-yellow-500 focus:ring-yellow-500"
                />
                {p.label}
              </label>
            ))}
          </div>

          {message ? <p className="mb-3 text-xs text-green-400">{message}</p> : null}
          {error ? (
            <p className="mb-3 text-xs text-red-400" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => void handleSave()}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200 disabled:opacity-60"
            >
              <Save size={16} /> {saving ? 'Saving…' : 'Save Preferences'}
            </button>
            <button
              onClick={() => void handleTest()}
              disabled={testing}
              className="w-full rounded-full border border-zinc-700 bg-zinc-950 py-3 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800 disabled:opacity-60"
            >
              {testing ? 'Sending test…' : 'Send Test Notification'}
            </button>
            <button
              onClick={() => void handleUnfollow()}
              disabled={unfollowing}
              className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-3 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20 disabled:opacity-60"
            >
              {unfollowing ? 'Unfollowing…' : 'Unfollow This Card'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export const NotificationSettingsModal = ({
  isOpen,
  onClose,
  cardSlug = 'preview',
}: {
  isOpen: boolean
  onClose: () => void
  cardSlug?: string
}) => {
  return (
    <AnimatePresence>
      {isOpen && <NotificationSettingsForm key={cardSlug} cardSlug={cardSlug} onClose={onClose} />}
    </AnimatePresence>
  )
}
