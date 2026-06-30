const DEFAULT_ICON = '/next.svg'

const PUSH_TYPE_TO_CATEGORY = {
  profile_update: 'company',
  contact_update: 'contact',
  video_update: 'video',
  blog_update: 'blog',
  services_update: 'services',
}

function slugFromUrl(url) {
  if (!url || typeof url !== 'string') return ''
  const path = url.startsWith('http') ? new URL(url).pathname : url
  const segment = path.replace(/^\/+|\/+$/g, '').split('/')[0]
  return segment || ''
}

function normalizePushPayload(raw) {
  const url = raw.url || (raw.slug ? `/${raw.slug}` : '/')
  const slug = raw.slug || slugFromUrl(url)
  const category = raw.category || PUSH_TYPE_TO_CATEGORY[raw.type] || 'company'

  return {
    title: raw.title || 'vBiz Me Update',
    body: raw.body || raw.message || 'A card you follow has been updated.',
    url,
    slug,
    icon: raw.icon || raw.avatarImageUrl || raw.avatarUrl || DEFAULT_ICON,
    businessName: raw.businessName || slug || 'vBiz Me',
    avatarUrl: raw.avatarUrl || '',
    avatarImageUrl: raw.avatarImageUrl || '',
    avatarVideoUrl: raw.avatarVideoUrl || '',
    category,
    speakLine: raw.speakLine || '',
    profileId: raw.profile_id ?? raw.profileId ?? null,
    type: raw.type || '',
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload = normalizePushPayload({})

  try {
    payload = normalizePushPayload({ ...payload, ...event.data.json() })
  } catch {
    payload.body = event.data.text()
  }

  const richPayload = {
    title: payload.title,
    message: payload.body,
    businessName: payload.businessName,
    avatarUrl: payload.avatarUrl,
    avatarImageUrl: payload.avatarImageUrl,
    avatarVideoUrl: payload.avatarVideoUrl,
    category: payload.category,
    speakLine: payload.speakLine,
    url: payload.url,
    slug: payload.slug,
    profileId: payload.profileId,
    type: payload.type,
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Tab open on this site → in-app toast only (no duplicate OS banner).
      if (clientList.length > 0) {
        for (const client of clientList) {
          client.postMessage({
            type: 'vbiz_push',
            payload: richPayload,
          })
        }
        return undefined
      }

      // No open tabs (vcard closed / browser was off) → OS notification.
      // Delivered when the user next opens the browser if they were offline.
      const icon = payload.avatarImageUrl || payload.avatarUrl || payload.icon
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

  const rawUrl = event.notification.data?.url || '/'
  const targetUrl = rawUrl.startsWith('http') ? rawUrl : new URL(rawUrl, self.location.origin).href

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        const clientPath = new URL(client.url).pathname
        const targetPath = new URL(targetUrl).pathname

        if (clientPath === targetPath) {
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
