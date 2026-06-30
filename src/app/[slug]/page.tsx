import { fetchMyCardBySlug } from '@/lib/api/myCard/fetchMyCardBySlug'
import { fetchNavBarLinks } from '@/lib/api/navbar/fetchNavBarLinks'
import { fallbackLiveAgentPrompt, resolveLiveAgentPromptFromProfileId } from '@/lib/liveAgent/resolveLiveAgentPrompt'
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
      initialMyCard={myCard}
      initialNavBarLinks={navBarLinks}
      liveAgentCardData={agent.cardData}
      liveAgentSystemPrompt={agent.systemPrompt}
    />
  )
}
