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
import { useMemo } from 'react'

type ProfileActionButtonsProps = {
  variant: 'v2' | 'v3-mobile' | 'v3-desktop' | 'v1'
  theme?: string
  onAction?: (action: string) => void
  className?: string
}

function CtaButtonContent({ button, iconSize }: { button: ResolvedHomeCtaButton; iconSize: number }) {
  const Icon = button.icon
  return (
    <>
      <Icon size={iconSize} />
      {button.label}
    </>
  )
}

function V2CtaButton({
  button,
  accentColor,
  fullWidth,
  onClick,
}: {
  button: ResolvedHomeCtaButton
  accentColor: string
  fullWidth?: boolean
  onClick: () => void
}) {
  const inlineStyle = buildHomeCtaInlineStyle(button, accentColor)
  const isFilled = button.variant === 'accent' || button.variant === 'cta'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-xs font-bold tracking-wide whitespace-nowrap shadow-sm transition-all active:scale-95 sm:text-sm md:h-[46px] md:py-0 ${
        fullWidth ? 'w-full' : 'flex-1'
      } ${
        isFilled
          ? 'text-zinc-950 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)]'
          : 'border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
      }`}
      style={inlineStyle}
    >
      <CtaButtonContent button={button} iconSize={16} />
    </button>
  )
}

function V3CtaButton({
  button,
  theme,
  desktop,
  accentColor,
  onClick,
}: {
  button: ResolvedHomeCtaButton
  theme?: string
  desktop?: boolean
  accentColor: string
  onClick: () => void
}) {
  const inlineStyle = buildHomeCtaInlineStyle(button, accentColor)
  const isFilled = button.variant === 'accent' || button.variant === 'cta'

  if (desktop) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl text-[13px] font-bold shadow-lg transition-all hover:scale-[1.02] ${
          isFilled
            ? 'font-extrabold text-black'
            : theme === 'dark'
              ? 'border-gold/40 bg-ocean-dark text-gold hover:border-gold hover:bg-ocean-light/50 border hover:shadow-[0_0_20px_rgba(238,214,119,0.6)]'
              : 'border-gold hover:bg-gold/10 border bg-white text-zinc-900 hover:shadow-[0_0_18px_rgba(238,214,119,0.45)]'
        }`}
        style={inlineStyle}
      >
        <CtaButtonContent button={button} iconSize={16} />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[40px] flex-1 flex-row items-center justify-center gap-2 rounded-xl text-[11px] font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(238,214,119,0.65)] ${
        isFilled
          ? 'font-extrabold text-black shadow-lg'
          : theme === 'dark'
            ? 'border-gold/40 bg-ocean-dark hover:border-gold hover:bg-ocean-light/70 border text-white'
            : 'border-gold hover:bg-gold/10 border bg-white text-zinc-900'
      }`}
      style={inlineStyle}
    >
      <CtaButtonContent button={button} iconSize={18} />
    </button>
  )
}

function V1CtaButton({
  button,
  accentColor,
  onClick,
}: {
  button: ResolvedHomeCtaButton
  accentColor: string
  onClick: () => void
}) {
  const inlineStyle = buildHomeCtaInlineStyle(button, accentColor)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group/btn flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4.5 text-[10px] font-black tracking-[0.2em] text-black uppercase shadow-[0_20px_40px_-10px_rgba(234,179,8,0.3)] transition-all hover:shadow-[0_25px_50px_-10px_rgba(234,179,8,0.6)] sm:text-xs"
      style={inlineStyle}
    >
      <CtaButtonContent button={button} iconSize={18} />
    </button>
  )
}

function renderV2Layout(layout: HomeCtaLayout, accentColor: string, onClick: (button: ResolvedHomeCtaButton) => void) {
  return (
    <div className="flex flex-col gap-4">
      <div className={`flex gap-3 sm:gap-4 ${layout.row1.length === 1 ? '' : ''}`}>
        {layout.row1.map((button) => (
          <V2CtaButton
            key={button.key}
            button={button}
            accentColor={accentColor}
            fullWidth={layout.row1.length === 1}
            onClick={() => onClick(button)}
          />
        ))}
      </div>
      <V2CtaButton button={layout.row2} accentColor={accentColor} fullWidth onClick={() => onClick(layout.row2)} />
      <V2CtaButton button={layout.row3} accentColor={accentColor} fullWidth onClick={() => onClick(layout.row3)} />
    </div>
  )
}

function renderV3Layout(
  layout: HomeCtaLayout,
  accentColor: string,
  onClick: (button: ResolvedHomeCtaButton) => void,
  theme?: string,
  desktop?: boolean,
  className?: string
) {
  const Button = ({ button, fullWidth }: { button: ResolvedHomeCtaButton; fullWidth?: boolean }) => (
    <V3CtaButton
      button={button}
      theme={theme}
      desktop={desktop}
      accentColor={accentColor}
      onClick={() => onClick(button)}
    />
  )

  return (
    <div className={className}>
      <div className={`${layout.row1.length === 2 ? 'grid grid-cols-2 gap-3' : 'flex'}`}>
        {layout.row1.map((button) => (
          <Button key={button.key} button={button} />
        ))}
      </div>
      <div className={desktop ? 'mt-3' : 'mt-2'}>
        <Button button={layout.row2} />
      </div>
      <div className={desktop ? 'mt-3' : 'mt-2'}>
        <Button button={layout.row3} />
      </div>
    </div>
  )
}

function renderV1Layout(layout: HomeCtaLayout, accentColor: string, onClick: (button: ResolvedHomeCtaButton) => void) {
  const buttons = [...layout.row1, layout.row2, layout.row3]
  return (
    <div className="relative z-10 flex flex-col gap-4">
      {buttons.map((button) => (
        <V1CtaButton key={button.key} button={button} accentColor={accentColor} onClick={() => onClick(button)} />
      ))}
    </div>
  )
}

export function ProfileActionButtons({ variant, theme, onAction, className }: ProfileActionButtonsProps) {
  const { t } = useTranslation()
  const { actionButtons, design } = useProfileDisplay()
  const accentColor = design?.accentColor ?? '#eab308'

  const layout = useMemo(
    () =>
      resolveHomeCtaLayout({
        actionButtons,
        accentColor,
        labels: {
          save_my_info: t('hero.save_my_info', 'SAVE MY INFO'),
          my_vcard: t('hero.my_vcard', 'MY VCARD'),
          google_wallet: t('hero.save_to_google_wallet', 'SAVE TO GOOGLE WALLET'),
          get_vcard_now: t('hero.get_your_vcard_now', 'GET YOUR VCARD NOW'),
        },
      }),
    [actionButtons, accentColor, t]
  )

  const click = (button: ResolvedHomeCtaButton) => {
    handleHomeCtaClick(button.key, { onAction })
  }

  if (variant === 'v1') {
    return <div className={className}>{renderV1Layout(layout, accentColor, click)}</div>
  }

  if (variant === 'v2') {
    return <div className={className}>{renderV2Layout(layout, accentColor, click)}</div>
  }

  const containerClass =
    variant === 'v3-desktop'
      ? `flex w-full max-w-[420px] flex-col gap-3 xl:max-w-[480px] ${className ?? ''}`
      : `relative z-20 mb-2 flex w-[90%] max-w-[340px] flex-col gap-2 shadow-xl ${className ?? ''}`

  return renderV3Layout(layout, accentColor, click, theme, variant === 'v3-desktop', containerClass)
}
