'use client'

import { ProfileForceNotification } from '@/profile-app/components/ProfileForceNotification'
import { ProfileDisplayProvider } from '@/profile-app/lib/profileDisplayContext'
import type { VBizProfileAppProps } from '@/profile-app/profilePublicProps'
import { ProfileIntroProvider } from '@/profile-app/providers/ProfileIntroProvider'
import { ProfileNavigationProvider } from '@/profile-app/providers/ProfileNavigationProvider'
import { TranslationProvider } from '@/profile-app/providers/TranslationProvider'
import { VBizProfileApp } from '@/profile-app/VBizProfileApp'
import { VBizProfileAppV1 } from '@/profile-app/VBizProfileAppV1'
import { VBizProfileAppV3 } from '@/profile-app/VBizProfileAppV3'

/** Renders v1, v2, or v3 profile shell from resolved design settings. */
export function ProfileApp(props: VBizProfileAppProps) {
  const template = props.design?.profileTemplate ?? 'v3'

  const shell =
    template === 'v1' ? (
      <VBizProfileAppV1 {...props} />
    ) : template === 'v2' ? (
      <VBizProfileApp {...props} />
    ) : (
      <VBizProfileAppV3 {...props} />
    )

  return (
    <ProfileDisplayProvider
      personal={props.personal}
      displaySettings={props.displaySettings}
      social={props.social}
      extraFields={props.extraFields}
      education={props.education}
      experience={props.experience}
      services={props.services}
      generalPosts={props.generalPosts}
      faqs={props.faqs}
      design={props.design ?? null}
      avatarMediaUrl={props.avatarVideoUrl}
      embedded={props.embedded}
      cardOwnerId={props.cardOwnerId}
      profileViews={props.profileViews}
    >
      <TranslationProvider cardOwnerId={props.cardOwnerId} profileSlug={props.profileSlug ?? props.shareSlug}>
        <ProfileNavigationProvider sectionId={props.sectionId} onSectionChange={props.onSectionChange}>
          <ProfileIntroProvider
            embedded={props.embedded}
            profileSlug={props.profileSlug}
            shareSlug={props.shareSlug}
            explainerVideoUrl={props.explainerVideoUrl}
          >
            <ProfileForceNotification
              cardOwnerId={props.cardOwnerId}
              cardSlug={props.profileSlug ?? props.shareSlug ?? 'preview'}
              ownerName={props.liveAgentCardData?.ownerName ?? props.ownerName ?? 'Guest'}
              embedded={props.embedded}
            />
            {shell}
          </ProfileIntroProvider>
        </ProfileNavigationProvider>
      </TranslationProvider>
    </ProfileDisplayProvider>
  )
}

export type { VBizProfileAppProps } from '@/profile-app/profilePublicProps'
