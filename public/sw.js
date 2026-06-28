self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = {
    title: 'vBiz Me Update',
    body: 'A card you follow has been updated.',
    url: '/',
    icon: '/next.svg',
    slug: '',
    businessName: 'vBiz Me',
    avatarUrl: '',
    avatarImageUrl: '',
    avatarVideoUrl: '',
    category: 'company',
    speakLine: 'Hey, this is vBiz Me. A card you follow has been updated.',
  }

  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    payload.body = event.data.text()
  }

  const targetUrl = payload.url || (payload.slug ? `/${payload.slug}` : '/')
  const richPayload = {
    title: payload.title,
    message: payload.body,
    businessName: payload.businessName,
    avatarUrl: payload.avatarUrl,
    avatarImageUrl: payload.avatarImageUrl,
    avatarVideoUrl: payload.avatarVideoUrl,
    category: payload.category,
    speakLine: payload.speakLine,
    url: targetUrl,
    slug: payload.slug || '',
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Let any open tab show the in-app toast (avatar + title + message).
      for (const client of clientList) {
        client.postMessage({
          type: 'vbiz_push',
          payload: richPayload,
        })
      }

      // Also raise the OS notification (mobile + desktop notification bar) as a fallback
      // in case the user misses the in-app toast. Clicking it opens the target vCard.
      const icon = payload.avatarImageUrl || payload.avatarUrl || payload.icon || '/next.svg'
      return self.registration.showNotification(payload.title, {
        body: payload.body,
        icon,
        badge: icon,
        data: richPayload,
        tag: payload.slug ? `vbiz-card-${payload.slug}` : 'vbiz-card-update',
        renotify: true,
      })
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientUrl = new URL(client.url)
        const target = new URL(targetUrl, self.location.origin)

        if (clientUrl.pathname === target.pathname) {
          return client.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }

      return undefined
    })
  )
})
