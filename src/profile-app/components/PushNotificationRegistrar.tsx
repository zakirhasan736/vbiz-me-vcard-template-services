'use client'

import { useEffect } from 'react'
import { isPushSupported, registerServiceWorker } from '@/profile-app/lib/pushNotifications'

/** Registers the service worker once for the whole app. */
export function PushNotificationRegistrar() {
  useEffect(() => {
    if (!isPushSupported()) return
    void registerServiceWorker()
  }, [])

  return null
}
