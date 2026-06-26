import { NextResponse } from 'next/server'
import { sendPushToCard } from '@/lib/push/send'
import type { PushTestRequest } from '@/lib/push/types'

/** Demo-only route for client previews until Laravel sends real pushes. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushTestRequest
    const cardSlug = body.cardSlug?.trim()

    if (!cardSlug) {
      return NextResponse.json({ success: false, error: 'cardSlug is required' }, { status: 400 })
    }

    const result = await sendPushToCard(cardSlug, {
      title: body.title ?? 'vBiz Me Update',
      body: body.body ?? 'This is a test notification for your followed card.',
      url: `/vcard/${cardSlug}`,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send test notification'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
