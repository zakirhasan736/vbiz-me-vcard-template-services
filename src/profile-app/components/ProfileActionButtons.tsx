'use client'

import { useTranslation } from '@/lib/i18n/translationData'
import {
  buildHomeCtaInlineStyle,
  handleHomeCtaClick,
  resolveHomeCtaLayout,
  type HomeCtaLayout,
  type ResolvedHomeCtaButton,
} from '@/profile-app/lib/profileActionButtons'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import type { ProfileTemplateId } from '@/redux/features/designSettings/designSettings.slice'
import { useMemo } from 'react'

type ProfileActionButtonsProps = {
  theme?: string
  onAction?: (action: string) => void
  /** Classes for the desktop wrapper (or sole wrapper when `visibleOn="desktop"`). */
  className?: string
  /** Extra classes merged onto the mobile hero shell wrapper. */
  mobileClassName?: string
  /** Use when buttons sit in separate mobile/desktop layout slots (e.g. v3 hero). */
  visibleOn?: 'both' | 'mobile' | 'desktop'
}

/** Shared mobile hero shell — mt-auto pins the CTA stack to the bottom of flex heroes. */
export const PROFILE_ACTION_BUTTONS_MOBILE_SHELL_CLASS =
  'relative z-20 mt-auto mb-2 flex w-[90%] max-w-[340px] shrink-0 flex-col gap-2 shadow-xl'

function CtaButtonContent({ button, iconSize }: { button: ResolvedHomeCtaButton; iconSize: number }) {
  const Icon = button.icon
  return (
    <>
      <Icon size={iconSize} className="shrink-0" />
      {/* Clamp translated labels to one line so longer languages never break the button height. */}
      <span className="min-w-0 truncate" title={button.label}>
        {button.label}
      </span>
    </>
  )
}

function getCtaButtonClasses(
  template: ProfileTemplateId,
  theme: string | undefined,
  isFilled: boolean,
  isDesktop: boolean
): string {
  const size = isDesktop ? 'h-[52px] w-full rounded-2xl' : 'h-[38px] min-h-[38px] w-full shrink-0 rounded-[10px]'

  const mobileText = 'text-[13px]'
  const base = `flex min-w-0 items-center justify-center gap-2 overflow-hidden whitespace-nowrap transition-all active:scale-95 ${size}`

  if (template === 'v1') {
    return `${base} px-4 ${isDesktop ? 'text-[11px]' : mobileText} font-semibold uppercase tracking-[0.12em] sm:tracking-[0.15em] ${
      isFilled
        ? 'text-black shadow-[0_20px_40px_-10px_rgba(234,179,8,0.3)]'
        : theme === 'dark'
          ? 'border-yellow-primary/30 text-yellow-primary hover:border-yellow-primary/50 border bg-gray-900/70'
          : 'border border-black/10 bg-white text-gray-900 shadow-sm hover:bg-gray-50'
    }`
  }

  if (template === 'v2') {
    return `${base} ${isDesktop ? 'text-[13px] sm:text-sm' : mobileText} font-semibold tracking-wide shadow-sm ${
      isFilled
        ? 'text-zinc-950 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]'
        : 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
    }`
  }

  // v3
  return `${base} ${isDesktop ? 'text-[13px] font-bold' : `${mobileText} font-semibold`} duration-300 hover:scale-[1.02] ${
    isFilled
      ? isDesktop
        ? 'font-extrabold text-black shadow-lg'
        : 'text-black shadow-lg'
      : theme === 'dark'
        ? 'border-gold/40 bg-ocean-dark hover:border-gold hover:bg-ocean-light/70 border text-white'
        : 'border-gold hover:bg-gold/10 border bg-white text-zinc-900'
  }`
}

function HomeCtaButton({
  button,
  template,
  theme,
  accentColor,
  isDesktop,
  onClick,
}: {
  button: ResolvedHomeCtaButton
  template: ProfileTemplateId
  theme?: string
  accentColor: string
  isDesktop: boolean
  onClick: () => void
}) {
  const isFilled = button.variant === 'accent' || button.variant === 'cta'
  const iconSize = isDesktop ? (template === 'v1' ? 18 : 16) : 16

  return (
    <button
      type="button"
      onClick={onClick}
      className={getCtaButtonClasses(template, theme, isFilled, isDesktop)}
      style={buildHomeCtaInlineStyle(button, accentColor)}
    >
      <CtaButtonContent button={button} iconSize={iconSize} />
    </button>
  )
}

function CtaButtonGrid({
  layout,
  template,
  theme,
  accentColor,
  isDesktop,
  onClick,
}: {
  layout: HomeCtaLayout
  template: ProfileTemplateId
  theme?: string
  accentColor: string
  isDesktop: boolean
  onClick: (button: ResolvedHomeCtaButton) => void
}) {
  const gap = isDesktop ? (template === 'v1' ? 'gap-4' : 'gap-3') : 'gap-2'
  const rowGap = isDesktop ? 'gap-3' : 'gap-2'

  return (
    <div className={`flex flex-col ${gap}`}>
      <div className={layout.row1.length === 2 ? `grid grid-cols-2 ${rowGap}` : 'flex'}>
        {layout.row1.map((button) => (
          <HomeCtaButton
            key={button.key}
            button={button}
            template={template}
            theme={theme}
            accentColor={accentColor}
            isDesktop={isDesktop}
            onClick={() => onClick(button)}
          />
        ))}
      </div>
      {layout.stacked.map((button) => (
        <HomeCtaButton
          key={button.key}
          button={button}
          template={template}
          theme={theme}
          accentColor={accentColor}
          isDesktop={isDesktop}
          onClick={() => onClick(button)}
        />
      ))}
    </div>
  )
}

/** Shared home CTA grid for v1, v2, and v3 — mobile [2,1,1,1], desktop [2,1,1]. */
export function ProfileActionButtons({
  theme,
  onAction,
  className,
  mobileClassName,
  visibleOn = 'both',
}: ProfileActionButtonsProps) {
  const { t } = useTranslation()
  const { actionButtons, design, cardSlug } = useProfileDisplay()
  const accentColor = design?.accentColor ?? '#eab308'
  const template = (design?.profileTemplate ?? 'v3') as ProfileTemplateId

  const labels = useMemo(
    () => ({
      my_info: t('hero.my_info', 'MY INFO'),
      save_my_info: t('hero.save_my_info', 'SAVE MY INFO'),
      my_vcard: t('hero.my_vcard', 'MY VCARD'),
      google_wallet: t('hero.save_to_google_wallet', 'SAVE TO GOOGLE WALLET'),
      get_vcard_now: t('hero.get_your_vcard_now', 'GET YOUR VCARD NOW'),
    }),
    [t]
  )

  const desktopLayout = useMemo(
    () => resolveHomeCtaLayout({ actionButtons, accentColor, labels }),
    [actionButtons, accentColor, labels]
  )

  const mobileLayout = useMemo(
    () => resolveHomeCtaLayout({ actionButtons, accentColor, includeMyInfo: true, labels }),
    [actionButtons, accentColor, labels]
  )

  const click = (button: ResolvedHomeCtaButton) => {
    handleHomeCtaClick(button.key, { onAction, cardSlug })
  }

  const showMobile = visibleOn === 'both' || visibleOn === 'mobile'
  const showDesktop = visibleOn === 'both' || visibleOn === 'desktop'
  const mobileWrapperClass = [PROFILE_ACTION_BUTTONS_MOBILE_SHELL_CLASS, mobileClassName].filter(Boolean).join(' ')
  const desktopWrapperClass = [visibleOn === 'both' ? 'hidden md:block' : undefined, className]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {showMobile ? (
        <div className={visibleOn === 'both' ? `md:hidden ${mobileWrapperClass}` : mobileWrapperClass}>
          <CtaButtonGrid
            layout={mobileLayout}
            template={template}
            theme={theme}
            accentColor={accentColor}
            isDesktop={false}
            onClick={click}
          />
        </div>
      ) : null}
      {showDesktop ? (
        <div className={desktopWrapperClass || undefined}>
          <CtaButtonGrid
            layout={desktopLayout}
            template={template}
            theme={theme}
            accentColor={accentColor}
            isDesktop
            onClick={click}
          />
        </div>
      ) : null}
    </>
  )
}
