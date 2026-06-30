import {
  type CardThemeConfig,
  type ColorToken,
  type ElementAppearance,
  type InteractionState,
  type ShadowToken,
  type SocialIconAppearance,
  type ThemeColorSet,
  type ThemeMode,
} from '@/lib/theme/cardThemeContract'
import { ensureContrastPair } from '@/lib/theme/resolveCardTheme'
import type { CSSProperties } from 'react'

const SHADOW_PRESETS: Record<string, string> = {
  none: 'none',
  soft: '0 4px 14px rgba(0,0,0,0.12)',
  medium: '0 10px 28px rgba(0,0,0,0.18)',
  strong: '0 20px 45px rgba(0,0,0,0.30)',
}

function shadowValue(token: ShadowToken): string {
  return SHADOW_PRESETS[token] ?? String(token)
}

function radiusValue(radius: number | string): string {
  return typeof radius === 'number' ? `${radius}px` : radius
}

/** Resolve a color token against the active color set. */
function colorFromToken(token: ColorToken | undefined, set: ThemeColorSet, fallback: string): string {
  if (!token || token === 'auto') return fallback
  if (token === 'primary') return set.primary
  if (token === 'secondary') return set.secondary
  if (token === 'accent') return set.accent
  return token
}

function stateVars(prefix: string, state: InteractionState | undefined, set: ThemeColorSet): Record<string, string> {
  if (!state) return {}
  const vars: Record<string, string> = {}
  if (state.background) vars[`${prefix}-bg`] = colorFromToken(state.background, set, set.accent)
  if (state.text) vars[`${prefix}-fg`] = colorFromToken(state.text, set, set.text ?? '#fff')
  if (state.border) vars[`${prefix}-border`] = colorFromToken(state.border, set, set.border ?? 'transparent')
  if (typeof state.scale === 'number') vars[`${prefix}-scale`] = String(state.scale)
  if (typeof state.opacity === 'number') vars[`${prefix}-opacity`] = String(state.opacity / 100)
  if (state.shadow) vars[`${prefix}-shadow`] = shadowValue(state.shadow)
  return vars
}

function appearanceVars(prefix: string, appearance: ElementAppearance, set: ThemeColorSet): Record<string, string> {
  const fillColor = colorFromToken(appearance.fill, set, set.accent)
  const { foreground } = ensureContrastPair(
    fillColor,
    appearance.foreground && appearance.foreground !== 'auto'
      ? colorFromToken(appearance.foreground, set, '')
      : undefined
  )
  const borderColor = colorFromToken(appearance.borderColor, set, fillColor)

  const vars: Record<string, string> = {
    [`${prefix}-style`]: appearance.style,
    [`${prefix}-radius`]: radiusValue(appearance.cornerRadius),
    [`${prefix}-fill`]: fillColor,
    [`${prefix}-fg`]: foreground,
    [`${prefix}-border-color`]: borderColor,
    [`${prefix}-border-width`]: `${appearance.borderWidth}px`,
    [`${prefix}-shadow`]: shadowValue(appearance.shadow),
    [`${prefix}-blur`]: appearance.glass ? '12px' : '0px',
    [`${prefix}-glass-alpha`]: appearance.glass ? '0.14' : '1',
  }

  if (typeof appearance.paddingX === 'number') vars[`${prefix}-px`] = `${appearance.paddingX}px`
  if (typeof appearance.paddingY === 'number') vars[`${prefix}-py`] = `${appearance.paddingY}px`
  if (typeof appearance.gap === 'number') vars[`${prefix}-gap`] = `${appearance.gap}px`

  Object.assign(vars, stateVars(`${prefix}-hover`, appearance.hover, set))
  Object.assign(vars, stateVars(`${prefix}-pressed`, appearance.pressed, set))
  Object.assign(vars, stateVars(`${prefix}-active`, appearance.active, set))

  return vars
}

/**
 * Build the full set of CSS custom properties for the active mode.
 * Apply on the profile root: `style={cardThemeCssVars(config, mode)}`.
 */
export function cardThemeCssVars(config: CardThemeConfig, mode: ThemeMode): CSSProperties {
  const set = mode === 'light' ? config.colors.light : config.colors.dark

  const vars: Record<string, string> = {
    '--vbiz-primary': set.primary,
    '--vbiz-secondary': set.secondary,
    '--vbiz-accent': set.accent,
    '--vbiz-bg': set.background ?? (mode === 'light' ? '#ffffff' : '#020914'),
    '--vbiz-surface': set.surface ?? (mode === 'light' ? '#f4f5f7' : '#0b1626'),
    '--vbiz-text': set.text ?? (mode === 'light' ? '#0b0b0d' : '#f4f4f5'),
    '--vbiz-text-muted': set.textMuted ?? (mode === 'light' ? '#52525b' : '#a1a1aa'),
    '--vbiz-border': set.border ?? (mode === 'light' ? '#e4e4e7' : '#1e293b'),
  }

  Object.assign(vars, appearanceVars('--vbiz-btn', config.button, set))
  Object.assign(vars, appearanceVars('--vbiz-social', config.socialIcon, set))

  const social = config.socialIcon as SocialIconAppearance
  vars['--vbiz-social-icon-size'] = `${social.iconSize}px`
  if (typeof social.size === 'number') vars['--vbiz-social-size'] = `${social.size}px`

  return vars as CSSProperties
}

/** Same variables as a plain record (for serializing into a stylesheet). */
export function cardThemeVarRecord(config: CardThemeConfig, mode: ThemeMode): Record<string, string> {
  return cardThemeCssVars(config, mode) as unknown as Record<string, string>
}

/**
 * Build a complete stylesheet: variables scoped to `.vbiz-profile-root` for the
 * active mode + the class utilities. Inject via a `<style>` tag.
 */
export function buildCardThemeStyleSheet(config: CardThemeConfig, mode: ThemeMode): string {
  const vars = cardThemeVarRecord(config, mode)
  const declarations = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')

  return `.vbiz-profile-root {\n${declarations}\n}\n\n${CARD_THEME_UTILITY_CSS}`
}

/**
 * Static CSS (class-based) so components can consume the variables without
 * touching every file. Scope under `.vbiz-profile-root`.
 */
export const CARD_THEME_UTILITY_CSS = `
.vbiz-profile-root .vbiz-btn {
  border-radius: var(--vbiz-btn-radius, 16px);
  background-color: var(--vbiz-btn-fill);
  color: var(--vbiz-btn-fg);
  border: var(--vbiz-btn-border-width, 0px) solid var(--vbiz-btn-border-color, transparent);
  box-shadow: var(--vbiz-btn-shadow, none);
  padding: var(--vbiz-btn-py, 12px) var(--vbiz-btn-px, 20px);
  gap: var(--vbiz-btn-gap, 8px);
  backdrop-filter: blur(var(--vbiz-btn-blur, 0px));
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease, opacity 0.18s ease;
}
.vbiz-profile-root .vbiz-btn:hover {
  transform: scale(var(--vbiz-btn-hover-scale, 1));
  opacity: var(--vbiz-btn-hover-opacity, 1);
  box-shadow: var(--vbiz-btn-hover-shadow, var(--vbiz-btn-shadow, none));
}
.vbiz-profile-root .vbiz-btn:active {
  transform: scale(var(--vbiz-btn-pressed-scale, 0.98));
}

.vbiz-profile-root .vbiz-social {
  width: var(--vbiz-social-size, 40px);
  height: var(--vbiz-social-size, 40px);
  border-radius: var(--vbiz-social-radius, 9999px);
  background-color: var(--vbiz-social-fill);
  color: var(--vbiz-social-fg);
  border: var(--vbiz-social-border-width, 1px) solid var(--vbiz-social-border-color, transparent);
  box-shadow: var(--vbiz-social-shadow, none);
  backdrop-filter: blur(var(--vbiz-social-blur, 0px));
  transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
}
.vbiz-profile-root .vbiz-social svg {
  width: var(--vbiz-social-icon-size, 18px);
  height: var(--vbiz-social-icon-size, 18px);
}
.vbiz-profile-root .vbiz-social:hover {
  transform: scale(var(--vbiz-social-hover-scale, 1.1));
  box-shadow: var(--vbiz-social-hover-shadow, var(--vbiz-social-shadow, none));
}
.vbiz-profile-root .vbiz-social:active {
  transform: scale(var(--vbiz-social-pressed-scale, 0.95));
}
`.trim()
