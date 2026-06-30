'use client'

import { fetchPushStatus, unsubscribeFromCard, updateCardBackendPreferences } from '@/lib/push/config'
import {
  BACKEND_NOTIFICATION_PREFERENCE_OPTIONS,
  DEFAULT_BACKEND_NOTIFICATION_PREFERENCES,
  type BackendNotificationPreferenceKey,
  type BackendNotificationPreferences,
} from '@/lib/push/preferenceMapping'
import { notify } from '@/lib/toast/toast'
import { ProfileModalShell } from '@/profile-app/components/ProfileModalShell'
import { Bell, BellOff, BellRing, Loader2, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'

export const NotificationSettingsModal = ({
  isOpen,
  onClose,
  cardSlug = 'preview',
  onReEnable,
}: {
  isOpen: boolean
  onClose: () => void
  cardSlug?: string
  /** Called when the user wants to re-enable after unfollowing (opens the enable popup). */
  onReEnable?: () => void
}) => {
  const [preferences, setPreferences] = useState<BackendNotificationPreferences>(
    () => DEFAULT_BACKEND_NOTIFICATION_PREFERENCES
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [unfollowing, setUnfollowing] = useState(false)
  const [unfollowed, setUnfollowed] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const togglePreference = (pref: BackendNotificationPreferenceKey) => {
    setPreferences((prev) => ({ ...prev, [pref]: !prev[pref] }))
  }

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false

    const load = async () => {
      setUnfollowed(false)
      setLoading(true)
      setError(null)
      setMessage(null)
      try {
        const status = await fetchPushStatus(cardSlug)
        if (cancelled) return
        if (status.backendPreferences) {
          setPreferences(status.backendPreferences)
        } else {
          setPreferences(DEFAULT_BACKEND_NOTIFICATION_PREFERENCES)
        }
      } catch {
        if (!cancelled) setPreferences(DEFAULT_BACKEND_NOTIFICATION_PREFERENCES)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    const timer = window.setTimeout(() => void load(), 0)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [isOpen, cardSlug])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const result = await updateCardBackendPreferences(cardSlug, preferences)
      setPreferences(result.preferences)
      const successMessage = result.message
      setMessage(successMessage)
      notify.success(successMessage)
    } catch (e) {
      const failureMessage = e instanceof Error ? e.message : 'Could not save your notification preferences.'
      setError(failureMessage)
      notify.error(failureMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleUnfollow = async () => {
    setUnfollowing(true)
    setError(null)
    setMessage(null)
    try {
      await unsubscribeFromCard(cardSlug)
      setUnfollowed(true)
      notify.success('You unfollowed this card. Notifications are turned off.')
    } catch (e) {
      const failureMessage = e instanceof Error ? e.message : 'Could not unfollow this card.'
      setError(failureMessage)
      notify.error(failureMessage)
    } finally {
      setUnfollowing(false)
    }
  }

  const handleReEnable = () => {
    if (onReEnable) {
      onReEnable()
    } else {
      onClose()
    }
  }

  return (
    <ProfileModalShell
      key={cardSlug}
      isOpen={isOpen}
      onClose={onClose}
      panelClassName="relative w-full overflow-hidden rounded-t-3xl border border-zinc-800 bg-zinc-900 shadow-2xl sm:max-w-sm sm:rounded-3xl"
    >
      <div className="relative w-full max-w-sm p-6 sm:max-w-none">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full bg-zinc-800 p-1.5 text-zinc-400 transition-colors hover:text-zinc-200"
          aria-label="Close notification settings"
        >
          <X size={16} />
        </button>

        {unfollowed ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
              <BellOff size={24} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-zinc-100">Notifications turned off</h2>
            <p className="mb-6 text-sm text-zinc-400">
              You won&apos;t get updates for this card anymore. You can re-enable them anytime.
            </p>
            <div className="flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={handleReEnable}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200"
              >
                <BellRing size={16} /> Re-enable Notifications
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full border border-zinc-700 bg-zinc-950 py-3 text-sm font-medium text-zinc-200 transition-all hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col text-left">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                <Bell size={20} />
              </div>
              <h2 className="text-xl font-bold text-zinc-100">Notification Settings</h2>
            </div>

            <p className="mb-6 text-sm text-zinc-400">Choose what to get notified about:</p>

            <div className="mb-6 w-full space-y-3 rounded-xl bg-zinc-950/50 p-4 text-sm text-zinc-300">
              {loading ? (
                <div className="flex items-center justify-center py-6 text-zinc-400">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : (
                BACKEND_NOTIFICATION_PREFERENCE_OPTIONS.map((p) => (
                  <label key={p.id} className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={preferences[p.id]}
                      onChange={() => togglePreference(p.id)}
                      className="rounded border-zinc-700 bg-zinc-800 text-yellow-500 focus:ring-yellow-500"
                    />
                    {p.label}
                  </label>
                ))
              )}
            </div>

            {message ? <p className="mb-3 text-xs text-green-400">{message}</p> : null}
            {error ? (
              <p className="mb-3 text-xs text-red-400" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-zinc-950 transition-all hover:bg-zinc-200 disabled:opacity-60"
              >
                <Save size={16} /> {saving ? 'Saving…' : 'Save Preferences'}
              </button>
              <button
                type="button"
                onClick={() => void handleUnfollow()}
                disabled={unfollowing}
                className="w-full rounded-full border border-red-500/30 bg-red-500/10 py-3 text-sm font-medium text-red-300 transition-all hover:bg-red-500/20 disabled:opacity-60"
              >
                {unfollowing ? 'Unfollowing…' : 'Unfollow This Card'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ProfileModalShell>
  )
}
