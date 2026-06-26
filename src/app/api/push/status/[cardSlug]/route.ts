import { NextResponse } from 'next/server'
import { getSubscription } from '@/lib/push/store'
import type { PushStatusResponse } from '@/lib/push/types'

type RouteContext = {
  params: Promise<{ cardSlug: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const { cardSlug } = await context.params
  const endpoint = new URL(request.url).searchParams.get('endpoint')?.trim()

  const response: PushStatusResponse = {
    following: false,
    permission: 'unsupported',
    preferences: null,
    endpoint: endpoint ?? null,
  }

  if (!endpoint) {
    return NextResponse.json({ success: true, data: response })
  }

  const saved = await getSubscription(cardSlug, endpoint)
  response.following = Boolean(saved)
  response.preferences = saved?.preferences ?? null

  return NextResponse.json({ success: true, data: response })
}
