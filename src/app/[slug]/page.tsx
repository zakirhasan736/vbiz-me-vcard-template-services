import { fetchMyCardBySlug } from '@/lib/api/myCard/fetchMyCardBySlug'
import { fetchNavBarLinks } from '@/lib/api/navbar/fetchNavBarLinks'
import { fallbackLiveAgentPrompt, resolveLiveAgentPromptFromProfileId } from '@/lib/liveAgent/resolveLiveAgentPrompt'
import PublicProfileLayout from '@/views/PublicProfileLayout'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ embed?: string }>
}

export default async function PublicProfilePage({ params, searchParams }: Props) {
  const { slug } = await params
  const { embed } = await searchParams
  const trimmed = slug?.trim()
  const embedded = embed === '1' || embed === 'true'

  if (!trimmed) {
    notFound()
  }

  const myCard = await fetchMyCardBySlug(trimmed)
  if (!myCard) {
    notFound()
  }

  const profileId = myCard.profile.id

  const [navBarLinks, liveAgent] = await Promise.all([
    fetchNavBarLinks(),
    resolveLiveAgentPromptFromProfileId(profileId),
  ])

  const agent = liveAgent ?? fallbackLiveAgentPrompt()

  return (
    <PublicProfileLayout
      slug={trimmed}
      embedded={embedded}
      initialMyCard={myCard}
      initialNavBarLinks={navBarLinks}
      liveAgentCardData={agent.cardData}
      liveAgentSystemPrompt={agent.systemPrompt}
    />
  )
}
