import { NextResponse } from 'next/server'
import { sendPushToCard } from '@/lib/push/send'
import type { PushSimulateRequest } from '@/lib/push/types'

/**
 * Demo-only route that mimics what the Laravel admin will eventually do:
 * an admin action triggers a push to a card's followers (optionally filtered
 * by notification category preference).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PushSimulateRequest
    const cardSlug = body.cardSlug?.trim()
    const title = body.title?.trim()
    const message = body.body?.trim()

    if (!cardSlug) {
      return NextResponse.json({ success: false, error: 'cardSlug is required' }, { status: 400 })
    }
    if (!title || !message) {
      return NextResponse.json({ success: false, error: 'title and body are required' }, { status: 400 })
    }

    const result = await sendPushToCard(cardSlug, {
      title,
      body: message,
      url: body.url?.trim() || `/vcard/${cardSlug}`,
      category: body.category,
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send notification'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
