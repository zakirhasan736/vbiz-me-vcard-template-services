export * from '@/lib/i18n/cardScope'
export * from '@/lib/i18n/config'
export {
  applyTranslation,
  getCardOwnerId,
  initTranslation,
  injectTranslateStyles,
  resetToEnglish,
  setTranslationCardScope,
  type BackendLanguage,
  type TranslationConfig,
} from '@/lib/i18n/translation'
export {
  DEFAULT_EN_TRANSLATIONS,
  LANGUAGE_CHANGE_EVENT,
  TRANSLATION_LOADING_EVENT,
  getSyncingState,
  syncTranslations,
  useTranslation,
} from '@/lib/i18n/translationData'
