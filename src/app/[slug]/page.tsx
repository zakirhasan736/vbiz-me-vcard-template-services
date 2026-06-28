import { fallbackLiveAgentPrompt, resolveLiveAgentPrompt } from '@/lib/liveAgent/resolveLiveAgentPrompt'
import PublicProfileLayout from '@/views/PublicProfileLayout'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params
  const trimmed = slug?.trim()

  if (!trimmed) {
    notFound()
  }

  const liveAgent = (await resolveLiveAgentPrompt(trimmed)) ?? fallbackLiveAgentPrompt()

  return (
    <PublicProfileLayout
      slug={trimmed}
      liveAgentCardData={liveAgent.cardData}
      liveAgentSystemPrompt={liveAgent.systemPrompt}
    />
  )
}
