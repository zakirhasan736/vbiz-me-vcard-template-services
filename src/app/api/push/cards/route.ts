import { NextResponse } from 'next/server'
import { listCardsWithSubscriptions } from '@/lib/push/store'

/** Demo-only: lists cards that have local push subscribers, for the admin simulator. */
export async function GET() {
  try {
    const cards = await listCardsWithSubscriptions()
    return NextResponse.json({ success: true, data: cards })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not list cards'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
