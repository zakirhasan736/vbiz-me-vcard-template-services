import { NextResponse } from 'next/server'
import { pollFollowedCardUpdates } from '@/lib/push/updateWatcher'

/** Demo-only bridge: polls the live profile API and sends local pushes when followed cards change. */
export async function POST() {
  try {
    const data = await pollFollowedCardUpdates()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not poll card updates'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
