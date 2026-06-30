'use client'

import type { CardThemeConfig, ThemeMode } from '@/lib/theme/cardThemeContract'
import { buildCardThemeStyleSheet } from '@/lib/theme/cardThemeCssVars'
import { useMemo } from 'react'

/**
 * Injects the dynamic global theme (Primary/Secondary/Accent + button & social
 * appearance) as CSS variables scoped to `.vbiz-profile-root`.
 *
 * Dormant by design: only rendered when the backend sends `theme_config`.
 * Until then the card keeps using the existing static palette.
 */
export function CardThemeStyles({ config, mode }: { config?: CardThemeConfig | null; mode: ThemeMode }) {
  const css = useMemo(() => (config ? buildCardThemeStyleSheet(config, mode) : ''), [config, mode])
  if (!css) return null
  return <style data-vbiz-card-theme="" dangerouslySetInnerHTML={{ __html: css }} />
}
