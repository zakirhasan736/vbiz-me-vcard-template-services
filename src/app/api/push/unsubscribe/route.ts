import { NextResponse } from 'next/server'
import { removeSubscription } from '@/lib/push/store'
import type { PushUnsubscribeRequest } from '@/lib/push/types'

export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as PushUnsubscribeRequest

    if (!body?.cardSlug?.trim() || !body?.endpoint) {
      return NextResponse.json({ success: false, error: 'Invalid unsubscribe payload' }, { status: 400 })
    }

    const removed = await removeSubscription(body.cardSlug.trim(), body.endpoint)
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not unsubscribe'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
