'use client'

import { useEffect } from 'react'

const DEFAULT_POLL_INTERVAL_MS = 60_000

function shouldEnableWatcher() {
  // This is a local demo bridge. When Laravel owns push APIs, it should send pushes directly.
  return !process.env.NEXT_PUBLIC_PUSH_API_URL
}

async function pollUpdates() {
  try {
    await fetch('/api/push/poll-updates', {
      method: 'POST',
      cache: 'no-store',
    })
  } catch (error) {
    console.warn('Could not poll backend updates for push demo:', error)
  }
}

/** Polls the live backend while the local demo is open and sends local pushes for changed followed cards. */
export function PushUpdateWatcher() {
  useEffect(() => {
    if (!shouldEnableWatcher()) return

    void pollUpdates()
    const interval = window.setInterval(() => {
      void pollUpdates()
    }, DEFAULT_POLL_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [])

  return null
}
