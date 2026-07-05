const DEFAULT_ICON = '/next.svg'

const PUSH_TYPE_TO_CATEGORY = {
  profile_update: 'company',
  contact_update: 'contact',
  video_update: 'video',
  blog_update: 'blog',
  services_update: 'services',
  event_update: 'events',
  event_updates: 'events',
  announcement_update: 'announcements',
  announcement_updates: 'announcements',
  portfolio_update: 'video',
  service_updates: 'services',
  news: 'blog',
  business_hours: 'company',
}

function slugFromUrl(url) {
  if (!url || typeof url !== 'string') return ''
  try {
    const path = url.startsWith('http') ? new URL(url).pathname : url
    const segment = path.replace(/^\/+|\/+$/g, '').split('/')[0]
    return segment || ''
  } catch {
    return ''
  }
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
  // userVisibleOnly subscriptions require a visible notification.
  // Always show an OS notification so the user receives updates even when
  // a tab is open, the toast fails, or the browser was in the background.
  let payload = normalizePushPayload({})

  if (event.data) {
    try {
      payload = normalizePushPayload({ ...payload, ...event.data.json() })
    } catch {
      try {
        payload.body = event.data.text() || payload.body
      } catch {
        /* keep defaults */
      }
    }
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

  const icon = payload.avatarImageUrl || payload.avatarUrl || payload.icon || DEFAULT_ICON

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const hasFocusedClient = clientList.some((client) => client.focused)

      // In-app toast for any open tab on this origin.
      for (const client of clientList) {
        client.postMessage({
          type: 'vbiz_push',
          payload: richPayload,
        })
      }

      // Always show OS notification when no tab is focused (background / closed).
      // When a tab is focused, toast handles UX; still show OS notification as
      // a reliable fallback so enabled users never miss an update.
      await self.registration.showNotification(payload.title, {
        body: payload.body,
        icon,
        badge: icon,
        data: richPayload,
        tag: payload.slug ? `vbiz-card-${payload.slug}` : 'vbiz-card-update',
        renotify: true,
        requireInteraction: false,
        silent: hasFocusedClient,
      })
    })()
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const rawUrl = event.notification.data?.url || '/'
  let targetUrl = '/'
  try {
    targetUrl = rawUrl.startsWith('http') ? rawUrl : new URL(rawUrl, self.location.origin).href
  } catch {
    targetUrl = self.location.origin + '/'
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        try {
          const clientUrl = new URL(client.url)
          const target = new URL(targetUrl)
          if (clientUrl.origin === target.origin) {
            if ('focus' in client) {
              return client.focus().then((focused) => {
                if (focused && 'navigate' in focused) {
                  return focused.navigate(targetUrl)
                }
                if (focused) {
                  focused.postMessage({ type: 'vbiz_navigate', url: targetUrl })
                }
                return focused
              })
            }
          }
        } catch {
          /* try next client */
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }

      return undefined
    })
  )
})
