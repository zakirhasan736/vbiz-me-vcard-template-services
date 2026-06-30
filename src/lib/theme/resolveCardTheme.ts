import {
  DEFAULT_BUTTON_APPEARANCE,
  DEFAULT_CARD_THEME_CONFIG,
  DEFAULT_SOCIAL_ICON_APPEARANCE,
  DEFAULT_THEME_COLORS,
  type CardThemeConfig,
  type ElementAppearance,
  type GlobalThemeColors,
  type SocialIconAppearance,
  type ThemeColorSet,
  type ThemeMode,
} from '@/lib/theme/cardThemeContract'

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i

function isColorString(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const v = value.trim()
  if (!v) return false
  return (
    HEX_RE.test(v) || v.startsWith('rgb') || v.startsWith('hsl') || v.startsWith('color-mix') || v.startsWith('var(')
  )
}

/** Relative luminance (WCAG) for a hex color; returns 0–1. */
function hexLuminance(hex: string): number {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/**
 * Pick a readable foreground (black/white) for a given background color.
 * Used to guarantee contrast when an owner changes icon/fill color.
 */
export function readableForeground(background: string, dark = '#0b0b0d', light = '#ffffff'): string {
  if (!isColorString(background) || !HEX_RE.test(background.trim())) {
    return light
  }
  return hexLuminance(background) > 0.55 ? dark : light
}

/**
 * Ensure a fill has a compatible, contrasting companion.
 * If `foreground` is missing/auto, derive it from the fill so contrast is guaranteed.
 */
export function ensureContrastPair(fill: string, foreground?: string): { fill: string; foreground: string } {
  if (foreground && foreground !== 'auto' && isColorString(foreground)) {
    return { fill, foreground }
  }
  return { fill, foreground: readableForeground(fill) }
}

function mergeColorSet(base: ThemeColorSet, override?: Partial<ThemeColorSet> | null): ThemeColorSet {
  if (!override) return base
  const next: ThemeColorSet = { ...base }
  for (const key of Object.keys(base) as (keyof ThemeColorSet)[]) {
    const value = override[key]
    if (isColorString(value)) {
      next[key] = value
    }
  }
  // allow optional keys present only in override
  for (const key of ['background', 'surface', 'text', 'textMuted', 'border'] as (keyof ThemeColorSet)[]) {
    const value = override[key]
    if (isColorString(value)) next[key] = value
  }
  return next
}

function mergeColors(raw: unknown): GlobalThemeColors {
  if (!raw || typeof raw !== 'object') return DEFAULT_THEME_COLORS
  const r = raw as Partial<GlobalThemeColors>
  const defaultMode: ThemeMode =
    r.defaultMode === 'light' || r.defaultMode === 'dark' ? r.defaultMode : DEFAULT_THEME_COLORS.defaultMode!
  return {
    defaultMode,
    light: mergeColorSet(DEFAULT_THEME_COLORS.light, r.light),
    dark: mergeColorSet(DEFAULT_THEME_COLORS.dark, r.dark),
  }
}

function mergeAppearance<T extends ElementAppearance>(base: T, raw: unknown): T {
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<T>
  const next = { ...base }

  const assignIf = <K extends keyof T>(key: K, predicate: (v: unknown) => boolean) => {
    if (key in r && predicate(r[key])) {
      next[key] = r[key] as T[K]
    }
  }

  assignIf('style' as keyof T, (v) => typeof v === 'string')
  assignIf('cornerRadius' as keyof T, (v) => typeof v === 'number' || typeof v === 'string')
  assignIf('glass' as keyof T, (v) => typeof v === 'boolean')
  assignIf('shadow' as keyof T, (v) => typeof v === 'string')
  assignIf('borderWidth' as keyof T, (v) => typeof v === 'number')
  assignIf('borderColor' as keyof T, (v) => typeof v === 'string')
  assignIf('fill' as keyof T, (v) => typeof v === 'string')
  assignIf('foreground' as keyof T, (v) => typeof v === 'string')
  assignIf('paddingX' as keyof T, (v) => typeof v === 'number')
  assignIf('paddingY' as keyof T, (v) => typeof v === 'number')
  assignIf('gap' as keyof T, (v) => typeof v === 'number')
  assignIf('hover' as keyof T, (v) => typeof v === 'object' && v !== null)
  assignIf('pressed' as keyof T, (v) => typeof v === 'object' && v !== null)
  assignIf('active' as keyof T, (v) => typeof v === 'object' && v !== null)

  return next
}

/**
 * Merge a raw `theme_config` from the API with safe defaults.
 * Returns a fully-populated, type-safe config — never throws on bad input.
 */
export function resolveCardThemeConfig(raw: unknown): CardThemeConfig {
  if (!raw || typeof raw !== 'object') {
    return DEFAULT_CARD_THEME_CONFIG
  }

  const r = raw as Partial<CardThemeConfig>
  const socialBase: SocialIconAppearance = mergeAppearance(DEFAULT_SOCIAL_ICON_APPEARANCE, r.socialIcon)
  if (typeof (r.socialIcon as Partial<SocialIconAppearance>)?.iconSize === 'number') {
    socialBase.iconSize = (r.socialIcon as SocialIconAppearance).iconSize
  }
  if (typeof (r.socialIcon as Partial<SocialIconAppearance>)?.size === 'number') {
    socialBase.size = (r.socialIcon as SocialIconAppearance).size
  }

  return {
    version: typeof r.version === 'number' ? r.version : 1,
    colors: mergeColors(r.colors),
    button: mergeAppearance(DEFAULT_BUTTON_APPEARANCE, r.button),
    socialIcon: socialBase,
  }
}

/** Returns true when the backend actually provided a usable theme_config. */
export function hasDynamicTheme(raw: unknown): boolean {
  return Boolean(raw && typeof raw === 'object' && 'colors' in (raw as Record<string, unknown>))
}
