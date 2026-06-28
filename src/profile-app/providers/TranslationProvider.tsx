'use client'

import { setTranslationCardScope } from '@/lib/i18n/cardScope'
import { I18N_CONFIG } from '@/lib/i18n/config'
import { initTranslation } from '@/lib/i18n/translation'
import { LanguageModal } from '@/profile-app/components/LanguageModal'
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type TranslationUiContextValue = {
  openLanguageModal: () => void
  closeLanguageModal: () => void
  isLanguageModalOpen: boolean
}

const TranslationUiContext = createContext<TranslationUiContextValue | null>(null)

export function TranslationProvider({
  cardOwnerId,
  profileSlug,
  theme = 'light',
  languageModalPresentation,
  children,
}: {
  cardOwnerId?: string
  profileSlug?: string
  theme?: 'light' | 'dark'
  languageModalPresentation?: 'default' | 'bottom-sheet'
  children: ReactNode
}) {
  const [languageModalOpen, setLanguageModalOpen] = useState(false)

  useEffect(() => {
    setTranslationCardScope(cardOwnerId ?? profileSlug ?? null)
    void initTranslation()
  }, [cardOwnerId, profileSlug])

  const openLanguageModal = useCallback(() => setLanguageModalOpen(true), [])
  const closeLanguageModal = useCallback(() => setLanguageModalOpen(false), [])

  const value = useMemo(
    () => ({
      openLanguageModal,
      closeLanguageModal,
      isLanguageModalOpen: languageModalOpen,
    }),
    [closeLanguageModal, languageModalOpen, openLanguageModal]
  )

  return (
    <TranslationUiContext.Provider value={value}>
      <div id={I18N_CONFIG.googleTranslateElementId} className="hidden" aria-hidden />
      {children}
      <LanguageModal
        isOpen={languageModalOpen}
        onClose={closeLanguageModal}
        theme={theme}
        presentation={languageModalPresentation}
      />
    </TranslationUiContext.Provider>
  )
}

export function useTranslationUi() {
  const ctx = useContext(TranslationUiContext)
  if (!ctx) {
    throw new Error('useTranslationUi must be used within TranslationProvider')
  }
  return ctx
}

/** Optional hook — returns no-op open when provider is absent (embedded previews). */
export function useOptionalTranslationUi() {
  return useContext(TranslationUiContext)
}
