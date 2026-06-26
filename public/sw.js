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
  }

  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    payload.body = event.data.text()
  }

  const targetUrl = payload.url || (payload.slug ? `/vcard/${payload.slug}` : '/')

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/next.svg',
      badge: '/next.svg',
      data: { url: targetUrl, slug: payload.slug || '' },
      tag: payload.slug ? `vbiz-card-${payload.slug}` : 'vbiz-card-update',
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
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
