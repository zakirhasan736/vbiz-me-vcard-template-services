'use client'

import { hasContactFlowBeenAsked, writeContactFlowAsked } from '@/lib/push/config'
import type { ResolvedProfileDesign } from '@/lib/resolvedProfileDesign'
import { resolveProfileDesign } from '@/lib/resolvedProfileDesign'
import { v3DesignToCssVars } from '@/lib/v3Theme'
import { LiveAgent } from '@/profile-app/components/LiveAgent'
import { NotificationAskModal } from '@/profile-app/components/NotificationAskModal'
import { NotificationSettingsModal } from '@/profile-app/components/NotificationSettingsModal'
import { ProfileSectionOutlet } from '@/profile-app/components/ProfileSectionOutlet'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import type { VBizProfileAppProps } from '@/profile-app/profilePublicProps'
import { DEMO_PROFILE_PROPS } from '@/profile-app/profilePublicProps'
import { ProfileThemeStyles } from '@/profile-app/ProfileThemeStyles'
import { useProfileIntroContext } from '@/profile-app/providers/ProfileIntroProvider'
import { useProfileNavigation } from '@/profile-app/providers/ProfileNavigationProvider'
import { useTranslationUi } from '@/profile-app/providers/TranslationProvider'
import { getV3AnimationProps, type V3AnimationPreset } from '@/profile-app/v3/animationEngine'
import { CursorTrail } from '@/profile-app/v3/components/CursorTrail'
import { DoneModal } from '@/profile-app/v3/components/DoneModal'
import { InfoModal } from '@/profile-app/v3/components/InfoModal'
import { Navigation } from '@/profile-app/v3/components/Navigation'
import { NotepadModal } from '@/profile-app/v3/components/NotepadModal'
import { SaveContactModal } from '@/profile-app/v3/components/SaveContactModal'
import { SaveToWalletModal } from '@/profile-app/v3/components/SaveToWalletModal'
import { ShareModal } from '@/profile-app/v3/components/ShareModal'
import { mapNavItemsToV3Tabs } from '@/profile-app/v3/navCategories'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useState } from 'react'

type V3ModalState = 'contact' | 'wallet' | 'notification' | 'done' | 'settings' | 'notepad' | 'share' | 'info' | null

export function VBizProfileAppV3({
  cardOwnerId = DEMO_PROFILE_PROPS.cardOwnerId,
  ownerName = DEMO_PROFILE_PROPS.ownerName,
  liveAgentCardData = DEMO_PROFILE_PROPS.liveAgentCardData,
  liveAgentSystemPrompt,
  design: designProp,
  shareSlug,
  profileSlug,
  embedded = false,
  previewTheme,
  onPreviewThemeChange,
}: VBizProfileAppProps) {
  const { design: contextDesign } = useProfileDisplay()

  const design: ResolvedProfileDesign =
    designProp ??
    contextDesign ??
    resolveProfileDesign(
      {
        vcardPrimaryColor: '#eed677',
        vcardAccentColor: '#eed677',
        dashboardAccent: 'amber',
        fontFamily: 'inter',
        profileTemplate: 'v3',
        layoutStyle: 'classic',
        buttonStyle: 'solid',
        cornerStyle: 'round',
      },
      { darkMode: false }
    )

  const { visibleTabs, activeSectionId, goToSection } = useProfileNavigation()
  const navTabs = useMemo(() => mapNavItemsToV3Tabs(visibleTabs), [visibleTabs])

  const [internalTheme, setInternalTheme] = useState<'light' | 'dark'>(() => {
    if (embedded) return design.darkMode ? 'dark' : 'light'
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (saved === 'dark' || saved === 'light') return saved
    return 'light'
  })
  const theme = embedded && previewTheme !== undefined ? previewTheme : internalTheme
  const [activeModal, setActiveModal] = useState<V3ModalState>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [animationPreset] = useState<V3AnimationPreset>(() => {
    if (typeof window === 'undefined') return 'dynamic'
    return (localStorage.getItem('animationPreset') as V3AnimationPreset) || 'dynamic'
  })
  const [animationDuration] = useState<number>(() => {
    if (typeof window === 'undefined') return 0.65
    const saved = localStorage.getItem('animationDuration')
    return saved ? parseFloat(saved) : 0.65
  })

  const { introAllowed } = useProfileIntroContext()
  const { openLanguageModal } = useTranslationUi()
  const cardSlug = profileSlug ?? shareSlug ?? 'preview'

  useEffect(() => {
    localStorage.setItem('animationPreset', animationPreset)
  }, [animationPreset])

  useEffect(() => {
    localStorage.setItem('animationDuration', animationDuration.toString())
  }, [animationDuration])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (embedded) return
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.className = 'bg-[#020914] text-zinc-100 transition-colors duration-500 ease-in-out font-sans'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.className = 'bg-white text-zinc-900 transition-colors duration-500 ease-in-out font-sans'
    }
    localStorage.setItem('theme', theme)
  }, [theme, embedded])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setInternalTheme(e.matches ? 'dark' : 'light')
      }
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])
  const handleHeroAction = useCallback(
    (action: string) => {
      if (action === 'language') {
        openLanguageModal()
        return
      }
      setActiveModal(action as V3ModalState)
    },
    [openLanguageModal]
  )

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark'
    if (embedded && onPreviewThemeChange) {
      onPreviewThemeChange(next)
    } else {
      setInternalTheme(next)
    }
  }, [embedded, onPreviewThemeChange, theme])

  useEffect(() => {
    const handleSaveContactEvent = () => setActiveModal('contact')
    const handleOpenNotepadEvent = () => setActiveModal('notepad')
    window.addEventListener('saveContactAction', handleSaveContactEvent)
    window.addEventListener('openNotepadAction', handleOpenNotepadEvent)
    return () => {
      window.removeEventListener('saveContactAction', handleSaveContactEvent)
      window.removeEventListener('openNotepadAction', handleOpenNotepadEvent)
    }
  }, [])

  const rootStyle = v3DesignToCssVars(design)
  const homeHeroProps = {
    theme,
    onAction: handleHeroAction,
    toggleTheme,
  }

  return (
    <div
      data-profile-template="v3"
      data-embedded={embedded ? '' : undefined}
      className={`vbiz-profile-root vbiz-profile-v3 no-scrollbar relative flex min-h-dvh w-full flex-col items-center overflow-x-clip transition-colors duration-500 ${theme === 'dark' ? 'bg-ocean-deep text-zinc-100' : 'bg-white text-zinc-900'} ${embedded ? 'min-h-0 max-w-full' : ''}`}
      style={rootStyle}
    >
      <ProfileThemeStyles design={design} />
      <CursorTrail />

      <div className="pointer-events-none fixed bottom-1 left-0 z-100 w-full px-2 md:top-5 md:bottom-auto md:px-20">
        <div
          className={`pointer-events-auto relative mx-auto flex max-w-[1032px] items-center justify-center rounded-[14px] px-2 py-2 md:rounded-[20px] ${theme === 'dark' ? 'border-gold/30 bg-ocean-dark/85 border text-zinc-100 backdrop-blur-xl' : 'border-gold/40 border bg-white/95 text-zinc-900 backdrop-blur-xl'}`}
        >
          <div className="no-scrollbar flex flex-1 justify-center overflow-x-auto">
            <Navigation tabs={navTabs} activeTab={activeSectionId} setActiveTab={goToSection} theme={theme} />
          </div>
        </div>
      </div>

      <div className="relative z-20 mt-0 flex h-full w-full flex-1 flex-col px-0 md:mt-[72px]">
        <main
          className="no-scrollbar relative flex w-full flex-1 flex-col overflow-x-hidden md:overflow-x-visible"
          role="tabpanel"
          id={`panel-${activeSectionId}`}
          aria-labelledby={`tab-${activeSectionId}`}
          style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
        >
          <AnimatePresence mode="wait">
            {(() => {
              const anim = getV3AnimationProps(activeSectionId, animationPreset, animationDuration, isMobile)
              return (
                <motion.div
                  key={activeSectionId}
                  initial={anim.initial}
                  animate={anim.animate}
                  exit={anim.exit}
                  transition={anim.transition}
                  style={{
                    ...anim.style,
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                  className="flex h-full w-full flex-1 flex-col"
                >
                  {activeSectionId === 'home' ? (
                    <ProfileSectionOutlet sectionId={activeSectionId} template="v3" homeHeroProps={homeHeroProps} />
                  ) : (
                    <div className="mx-auto mt-10 mb-10 min-h-screen w-full max-w-[1032px] px-6 md:mt-28">
                      <ProfileSectionOutlet sectionId={activeSectionId} template="v3" />
                    </div>
                  )}
                </motion.div>
              )
            })()}
          </AnimatePresence>
        </main>
      </div>

      <LiveAgent
        embedded={embedded}
        accentColor={design.accentColor}
        cardData={liveAgentCardData}
        systemInstruction={liveAgentSystemPrompt}
        readyToConnect={introAllowed}
      />

      {!embedded && (
        <>
          <NotepadModal
            isOpen={activeModal === 'notepad'}
            onClose={() => setActiveModal(null)}
            cardOwnerId={cardOwnerId ?? 'michaelangelo_casanova'}
          />
          <SaveContactModal
            isOpen={activeModal === 'contact'}
            onClose={() => setActiveModal(null)}
            onSuccess={() => {
              if (hasContactFlowBeenAsked(cardOwnerId ?? '91')) {
                setActiveModal('done')
              } else {
                setActiveModal('wallet')
              }
            }}
          />
          <SaveToWalletModal
            isOpen={activeModal === 'wallet'}
            onClose={() => setActiveModal(null)}
            onAction={() => setActiveModal('notification')}
          />
          <NotificationAskModal
            isOpen={activeModal === 'notification'}
            onClose={() => {
              writeContactFlowAsked(cardOwnerId ?? '91', false)
              setActiveModal(null)
            }}
            cardOwnerId={cardOwnerId ?? '91'}
            cardSlug={cardSlug}
            ownerName={liveAgentCardData?.ownerName ?? ownerName}
            onAccept={(preferences) => {
              writeContactFlowAsked(cardOwnerId ?? '91', true, preferences)
              setActiveModal('done')
            }}
          />
          <NotificationSettingsModal
            isOpen={activeModal === 'settings'}
            onClose={() => setActiveModal(null)}
            cardSlug={cardSlug}
          />
          <DoneModal isOpen={activeModal === 'done'} onClose={() => setActiveModal(null)} />
          <ShareModal isOpen={activeModal === 'share'} onClose={() => setActiveModal(null)} />
          <InfoModal isOpen={activeModal === 'info'} onClose={() => setActiveModal(null)} theme={theme} />
        </>
      )}
    </div>
  )
}
