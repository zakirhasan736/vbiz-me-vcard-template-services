import webpush from 'web-push'
import { listSubscriptionsForCard } from './store'
import type { NotificationPreferenceKey } from './types'

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT ?? 'mailto:support@vbizme.com'

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys are not configured')
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  return webpush
}

export async function sendPushToCard(
  cardSlug: string,
  payload: {
    title: string
    body: string
    url?: string
    icon?: string
    /** Only deliver to subscribers who opted into this category. */
    category?: NotificationPreferenceKey
  }
) {
  const push = configureWebPush()
  const allSubscriptions = await listSubscriptionsForCard(cardSlug)
  const category = payload.category
  const subscriptions = category
    ? allSubscriptions.filter((item) => item.preferences[category])
    : allSubscriptions

  const results = await Promise.allSettled(
    subscriptions.map((item) =>
      push.sendNotification(
        {
          endpoint: item.endpoint,
          keys: item.keys,
        },
        JSON.stringify({
          title: payload.title,
          body: payload.body,
          url: payload.url ?? `/vcard/${cardSlug}`,
          icon: payload.icon ?? '/next.svg',
          slug: cardSlug,
        })
      )
    )
  )

  return {
    matched: allSubscriptions.length,
    attempted: subscriptions.length,
    delivered: results.filter((result) => result.status === 'fulfilled').length,
    failed: results.filter((result) => result.status === 'rejected').length,
  }
}
