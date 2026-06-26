import { NextResponse } from 'next/server'
import { upsertSubscription } from '@/lib/push/store'
import { DEFAULT_NOTIFICATION_PREFERENCES, type PushSubscribeRequest } from '@/lib/push/types'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSubscribeRequest

    if (!body?.cardSlug?.trim() || !body?.subscription?.endpoint || !body?.subscription?.keys) {
      return NextResponse.json({ success: false, error: 'Invalid subscription payload' }, { status: 400 })
    }

    const saved = await upsertSubscription(
      {
        cardSlug: body.cardSlug.trim(),
        cardOwnerId: body.cardOwnerId,
        subscription: body.subscription,
        preferences: body.preferences ?? DEFAULT_NOTIFICATION_PREFERENCES,
      },
      request.headers.get('user-agent')
    )

    return NextResponse.json({ success: true, data: saved })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save subscription'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
