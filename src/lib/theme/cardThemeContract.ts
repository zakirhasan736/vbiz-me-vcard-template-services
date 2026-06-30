/**
 * vBiz Me — Global Card Theme Contract
 * ------------------------------------
 * This is the single source of truth for the dynamic color + appearance system
 * (Primary / Secondary / Accent, Light + Dark, plus Button & Social Icon appearance).
 *
 * The BACKEND should send `theme_config` on `GET /v/{slug}` matching `CardThemeConfig`.
 * Everything is OPTIONAL — when the backend omits it, the frontend falls back to the
 * static per-template palette, so this layer is fully backward-compatible.
 */

export type ThemeMode = 'light' | 'dark'

/** Reference to a global color role, or a raw CSS color string. */
export type ColorToken = 'primary' | 'secondary' | 'accent' | 'auto' | (string & {})

/** Visual style shared by buttons and social icons. */
export type ElementStyle = 'filled' | 'outlined' | 'ghost' | 'soft' | 'glass'

export type ShadowToken = 'none' | 'soft' | 'medium' | 'strong' | (string & {})

/** One color set for a single mode (light or dark). */
export type ThemeColorSet = {
  primary: string
  secondary: string
  accent: string
  /** Optional surfaces/text — derived from the three roles when omitted. */
  background?: string
  surface?: string
  text?: string
  textMuted?: string
  border?: string
}

export type GlobalThemeColors = {
  light: ThemeColorSet
  dark: ThemeColorSet
  /** Which mode the card opens in (defaults to dark to match current behavior). */
  defaultMode?: ThemeMode
}

/** Hover / pressed / active overrides for an element. */
export type InteractionState = {
  background?: ColorToken
  text?: ColorToken
  border?: ColorToken
  /** Multiplier, e.g. 1.02 grow / 0.98 shrink. */
  scale?: number
  shadow?: ShadowToken
  /** 0–100 opacity for ghost/soft hover washes. */
  opacity?: number
}

/** Shared appearance config for an interactive element. */
export type ElementAppearance = {
  style: ElementStyle
  /** Corner radius in px (number) or any CSS length string. */
  cornerRadius: number | string
  /** Enable glassmorphism (backdrop blur + translucent fill). */
  glass: boolean
  shadow: ShadowToken
  borderWidth: number
  /** Border color token; `auto` derives from the fill/role. */
  borderColor?: ColorToken
  /** Fill color role for filled/soft styles. */
  fill?: ColorToken
  /** Foreground (label/icon) color role. */
  foreground?: ColorToken
  paddingX?: number
  paddingY?: number
  /** Gap between icon and label / between items. */
  gap?: number
  hover?: InteractionState
  pressed?: InteractionState
  active?: InteractionState
}

export type SocialIconAppearance = ElementAppearance & {
  /** Icon glyph size in px. */
  iconSize: number
  /** Overall tappable size in px (square). */
  size?: number
}

/** Full theme contract sent by the backend under `theme_config`. */
export type CardThemeConfig = {
  colors: GlobalThemeColors
  button: ElementAppearance
  socialIcon: SocialIconAppearance
  /** Schema version so we can evolve the contract safely. */
  version?: number
}

/* ----------------------------- Defaults ----------------------------- */

export const DEFAULT_BUTTON_APPEARANCE: ElementAppearance = {
  style: 'filled',
  cornerRadius: 16,
  glass: false,
  shadow: 'soft',
  borderWidth: 0,
  borderColor: 'auto',
  fill: 'accent',
  foreground: 'auto',
  paddingX: 20,
  paddingY: 12,
  gap: 8,
  hover: { scale: 1.02, opacity: 92 },
  pressed: { scale: 0.98 },
  active: { background: 'accent' },
}

export const DEFAULT_SOCIAL_ICON_APPEARANCE: SocialIconAppearance = {
  style: 'soft',
  cornerRadius: 9999,
  glass: false,
  shadow: 'none',
  borderWidth: 1,
  borderColor: 'auto',
  fill: 'accent',
  foreground: 'auto',
  iconSize: 18,
  size: 40,
  gap: 8,
  hover: { scale: 1.1, opacity: 100 },
  pressed: { scale: 0.95 },
}

/** Fallback color sets mirror the current static dark-first palette. */
export const DEFAULT_THEME_COLORS: GlobalThemeColors = {
  defaultMode: 'dark',
  light: {
    primary: '#eed677',
    secondary: '#0f2c4d',
    accent: '#cca43b',
    background: '#ffffff',
    surface: '#f4f5f7',
    text: '#0b0b0d',
    textMuted: '#52525b',
    border: '#e4e4e7',
  },
  dark: {
    primary: '#eed677',
    secondary: '#0f2c4d',
    accent: '#eed677',
    background: '#020914',
    surface: '#0b1626',
    text: '#f4f4f5',
    textMuted: '#a1a1aa',
    border: '#1e293b',
  },
}

export const DEFAULT_CARD_THEME_CONFIG: CardThemeConfig = {
  colors: DEFAULT_THEME_COLORS,
  button: DEFAULT_BUTTON_APPEARANCE,
  socialIcon: DEFAULT_SOCIAL_ICON_APPEARANCE,
  version: 1,
}
