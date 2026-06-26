import { NextResponse } from 'next/server'
import { updatePreferences } from '@/lib/push/store'
import type { PushPreferencesRequest } from '@/lib/push/types'

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as PushPreferencesRequest

    if (!body?.cardSlug?.trim() || !body?.endpoint || !body?.preferences) {
      return NextResponse.json({ success: false, error: 'Invalid preferences payload' }, { status: 400 })
    }

    const saved = await updatePreferences(body.cardSlug.trim(), body.endpoint, body.preferences)
    if (!saved) {
      return NextResponse.json({ success: false, error: 'Subscription not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: saved })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not update preferences'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
