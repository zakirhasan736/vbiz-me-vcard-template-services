'use client'

import { isPushSupported, registerServiceWorker } from '@/lib/push/config'
import type { PlatformUpdateDetail } from '@/lib/push/types'
import { useEffect } from 'react'

function dispatchPlatformUpdate(detail: PlatformUpdateDetail) {
  window.dispatchEvent(new CustomEvent('vbiz_platform_update', { detail }))
}

/** Registers the service worker once for the whole app. */
export function PushNotificationRegistrar() {
  useEffect(() => {
    if (!isPushSupported()) return
    void registerServiceWorker()

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; payload?: PlatformUpdateDetail; url?: string }
      if (data?.type === 'vbiz_navigate' && typeof data.url === 'string' && data.url) {
        window.location.href = data.url
        return
      }
      if (data?.type !== 'vbiz_push' || !data.payload) return
      dispatchPlatformUpdate(data.payload)
    }

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage)
  }, [])

  return null
}
