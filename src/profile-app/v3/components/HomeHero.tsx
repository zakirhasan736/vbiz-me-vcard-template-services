'use client'

import { LANGUAGE_LABELS } from '@/lib/i18n/translation'
import { useTranslation } from '@/lib/i18n/translationData'
import { encodeMediaUrl, isVideoUrl } from '@/lib/mediaUrl'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import {
  buildProfileContactItems,
  cleanProfileFieldValue,
  formatProfileViewCount,
  resolveWhatsappHref,
} from '@/profile-app/lib/profileHomeData'
import { DEFAULT_COVER, DEFAULT_INTRO_VIDEO, resolveProfileAvatarSrc } from '@/profile-app/profilePublicProps'
import {
  Bell,
  CreditCard,
  Download,
  Eye,
  Facebook,
  FileText,
  Globe,
  Info,
  Instagram,
  Linkedin,
  MessageCircle,
  Moon,
  MoreVertical,
  Play,
  Share2,
  Sun,
  VolumeX,
  type LucideIcon,
} from 'lucide-react'
import React, { useMemo } from 'react'

const XIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.14-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.24-2.61 1.05-5.26 3.23-6.6 1.46-.91 3.25-1.29 4.96-1v4.21c-.81-.19-1.7-.17-2.48.24-.95.49-1.64 1.41-1.79 2.49-.16 1.13.25 2.31 1.05 3.12.8.84 2.05 1.25 3.21 1.12 1.58-.16 2.87-1.42 3.15-3 .06-.41.07-.82.06-1.24-.03-6.09-.03-12.18-.03-18.27Z" />
  </svg>
)

type V3SocialItem = {
  label: string
  title: string
  icon: LucideIcon | (() => React.ReactElement)
  isSvg?: boolean
}

const V3_SOCIAL_ITEMS: V3SocialItem[] = [
  { label: 'Twitter', title: 'X', icon: XIcon, isSvg: true },
  { label: 'FaceBook', title: 'Facebook', icon: Facebook },
  { label: 'Instagram', title: 'Instagram', icon: Instagram },
  { label: 'LinkedIn', title: 'LinkedIn', icon: Linkedin },
  { label: 'Whatsapp', title: 'WhatsApp', icon: MessageCircle },
  { label: 'TikTok', title: 'TikTok', icon: TikTokIcon, isSvg: true },
]

function resolveSocialHref(label: string, socialHref: (displayLabel: string) => string, whatsapp: string): string {
  if (label === 'Whatsapp') return resolveWhatsappHref(whatsapp)
  return socialHref(label)
}

function ProfileMedia({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const encoded = encodeMediaUrl(src)
  if (isVideoUrl(encoded)) {
    return <video src={encoded} autoPlay loop muted playsInline className={className} />
  }
  return <img src={encoded} alt={alt} className={className} />
}

function contactColSpan(label: string): 1 | 2 {
  return label === 'Email' || label === 'Address' ? 2 : 1
}

export const HomeHero: React.FC<{
  theme?: string
  onAction?: (action: string) => void
  toggleTheme?: () => void
}> = ({ theme, onAction, toggleTheme }) => {
  const { t, lang } = useTranslation()
  const { personal, isVisible, field, homeMedia, socialHref, profileViews } = useProfileDisplay()

  const introSrc = homeMedia.introVideo || personal.explainerVideoUrl || undefined
  const profileSrc = useMemo(
    () => resolveProfileAvatarSrc(homeMedia.profileMedia, introSrc, DEFAULT_INTRO_VIDEO),
    [homeMedia.profileMedia, introSrc]
  )
  const coverSrc = encodeMediaUrl(homeMedia.bgMedia || DEFAULT_COVER)
  const profileIsVideo = isVideoUrl(profileSrc)
  const showName = isVisible('MyInfo section Name') && Boolean(personal.fullName?.trim())
  const showShare = isVisible('Share Btn')
  const showSaveContact = isVisible('Save Contact')
  const showMyVcard = isVisible('My vCard Btn')
  const showGetVcard = isVisible('Get your VCard Now')
  const showViewCounter = isVisible('Vcard View Counter') && profileViews > 0

  const designationLine =
    isVisible('MyInfo Designation') && personal.designation?.trim() ? cleanProfileFieldValue(personal.designation) : ''

  const contactItems = useMemo(
    () =>
      buildProfileContactItems(personal, isVisible, field).map((item) => ({
        ...item,
        colSpan: contactColSpan(item.label),
      })),
    [personal, isVisible, field]
  )

  const visibleSocials = useMemo(
    () =>
      V3_SOCIAL_ITEMS.filter(
        (item) => isVisible(item.label) && Boolean(resolveSocialHref(item.label, socialHref, personal.whatsapp))
      ),
    [isVisible, socialHref, personal.whatsapp]
  )

  const viewCountLabel = formatProfileViewCount(profileViews)

  const triggerHaptic = (duration = 10) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(duration)
    }
  }

  const renderSocialIcon = (item: V3SocialItem, size: number) => {
    if (item.isSvg) {
      const Icon = item.icon as () => React.ReactElement
      return <Icon />
    }
    const Icon = item.icon as LucideIcon
    return <Icon size={size} strokeWidth={2.5} />
  }

  return (
    <div
      className={`border-gold/20 relative mx-auto flex min-h-[calc(100dvh-72px)] w-full max-w-[480px] flex-col overflow-x-hidden rounded-none border-x-0 font-sans shadow-2xl transition-colors duration-500 md:max-w-none md:border-0 ${theme === 'dark' ? 'bg-[#031327] text-white' : 'bg-white text-zinc-900'}`}
    >
      <div
        className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${theme === 'dark' ? 'bg-[#030914]' : 'bg-white'}`}
      >
        <div className="absolute inset-0 mx-auto h-full w-full md:max-w-[1032px]">
          <video
            src={coverSrc}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 aspect-video h-full w-full object-cover opacity-[0.78] mix-blend-screen md:aspect-auto dark:mix-blend-lighten"
          />
          <div
            className={`absolute inset-0 bg-linear-to-b ${theme === 'dark' ? 'from-[#030914]/15 via-[#031327]/30 to-[#031327]' : 'from-white/10 via-white/20 to-white'}`}
          />
        </div>
      </div>

      <div className="relative z-10 flex min-h-full w-full flex-1 flex-col justify-start">
        <div className="pointer-events-none absolute top-5 left-0 z-40 flex w-full justify-center px-2 md:top-28 md:px-0">
          <div className="relative h-0 w-full max-w-[1032px]">
            <div className="pointer-events-auto absolute top-8 right-2 flex flex-col gap-3 md:right-6">
              {showViewCounter && (
                <div className="group relative transition-transform hover:scale-105" onClick={() => triggerHaptic(10)}>
                  <div className="absolute -top-2 -right-2 z-10 rounded-full border border-red-800 bg-[#e3342f] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    {viewCountLabel}
                  </div>
                  <div
                    className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 md:h-12 md:w-12 ${theme === 'dark' ? 'border-gold bg-ocean-dark hover:bg-ocean-light/80 hover:shadow-[0_0_18px_rgba(238,214,119,0.75)]' : 'border-gold hover:bg-gold/20 bg-white hover:shadow-[0_0_15px_rgba(238,214,119,0.55)]'}`}
                  >
                    <Eye size={18} strokeWidth={2.5} className="text-gold md:h-[22px] md:w-[22px]" />
                  </div>
                </div>
              )}
              <div
                onClick={() => triggerHaptic(10)}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 md:h-12 md:w-12 ${theme === 'dark' ? 'border-gold bg-ocean-dark hover:bg-ocean-light/80 hover:shadow-[0_0_18px_rgba(238,214,119,0.75)]' : 'border-gold hover:bg-gold/20 bg-white hover:shadow-[0_0_15px_rgba(238,214,119,0.55)]'}`}
              >
                <Globe size={18} strokeWidth={2.5} className="text-gold md:h-[20px] md:w-[20px]" />
              </div>
              <div
                title="Language"
                className={`notranslate flex h-10 w-10 cursor-pointer flex-col items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 md:h-12 md:w-12 ${
                  theme === 'dark'
                    ? 'border-gold bg-ocean-dark hover:bg-ocean-light/80 hover:shadow-[0_0_18px_rgba(238,214,119,0.75)]'
                    : 'border-gold hover:bg-gold/20 bg-white hover:shadow-[0_0_15px_rgba(238,214,119,0.55)]'
                }`}
                onClick={() => {
                  triggerHaptic(10)
                  onAction?.('language')
                }}
              >
                <span className="text-base leading-none md:text-lg">
                  {(LANGUAGE_LABELS[lang] || { flag: '🇬🇧' }).flag}
                </span>
                <span className="text-gold mt-0.5 text-[7px] font-bold tracking-wider md:text-[8px]">
                  {(LANGUAGE_LABELS[lang] || { label: 'EN' }).label}
                </span>
              </div>
              <div
                title="Toggle Theme"
                onClick={() => {
                  triggerHaptic(10)
                  toggleTheme?.()
                }}
                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 md:h-12 md:w-12 ${theme === 'dark' ? 'border-gold bg-ocean-dark hover:bg-ocean-light/80 hover:shadow-[0_0_18px_rgba(238,214,119,0.75)]' : 'border-gold hover:bg-gold/20 bg-white hover:shadow-[0_0_15px_rgba(238,214,119,0.55)]'}`}
              >
                {theme === 'dark' ? (
                  <Sun size={18} strokeWidth={2.5} className="text-gold md:h-[20px] md:w-[20px]" />
                ) : (
                  <Moon size={18} strokeWidth={2.5} className="text-gold md:h-[20px] md:w-[20px]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="relative flex flex-1 flex-col items-center pt-[25px] pb-4 md:hidden">
          {visibleSocials.length > 0 && (
            <div className="absolute top-8 left-2 z-30 flex flex-col gap-2">
              {visibleSocials.map((item) => {
                const href = resolveSocialHref(item.label, socialHref, personal.whatsapp)
                return (
                  <a
                    key={item.label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => triggerHaptic(10)}
                    className="bg-gold flex h-10 w-10 items-center justify-center rounded-full text-[16px] font-black text-black shadow-md transition-all duration-300 hover:scale-[1.12] hover:bg-yellow-400 hover:shadow-[0_0_18px_rgba(238,214,119,0.85)]"
                  >
                    {renderSocialIcon(item, 18)}
                  </a>
                )
              })}
            </div>
          )}

          <div className="relative z-20 mx-auto mb-4 aspect-4/5 w-[65%] max-w-[240px] border-2 border-white bg-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <ProfileMedia
              src={profileSrc}
              alt={personal.fullName ? `${personal.fullName} profile` : 'Profile'}
              className="h-full w-full object-cover"
            />
            {profileIsVideo && (
              <div className="absolute right-0 bottom-2 left-0 px-3">
                <div className="mb-2 h-1 w-full rounded-full bg-white/30">
                  <div className="h-full w-1/3 rounded-full bg-white" />
                </div>
                <div className="flex items-center justify-between text-white drop-shadow-md">
                  <Play size={18} fill="currentColor" />
                  <div className="flex gap-2">
                    <VolumeX size={18} />
                    <MoreVertical size={18} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-20 mt-1.5 flex justify-center gap-2">
            {showShare && (
              <button
                title="Share"
                className={`group flex items-center justify-center rounded-xl border p-2 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(238,214,119,0.75)] ${theme === 'dark' ? 'border-gold/45 bg-ocean-dark/60 hover:border-gold hover:bg-ocean-light/60 text-white' : 'border-gold/50 hover:border-gold hover:bg-gold/20 bg-white text-zinc-950'}`}
                onClick={() => {
                  triggerHaptic(10)
                  onAction?.('share')
                }}
              >
                <Share2 size={20} />
              </button>
            )}
            <button
              title="Notification"
              className={`group relative flex items-center justify-center rounded-xl border p-2 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(238,214,119,0.75)] ${theme === 'dark' ? 'border-gold/45 bg-ocean-dark/60 hover:border-gold hover:bg-ocean-light/60 text-white' : 'border-gold/50 hover:border-gold hover:bg-gold/20 bg-white text-zinc-950'}`}
              onClick={() => {
                triggerHaptic(10)
                onAction?.('notification')
              }}
            >
              <Bell size={20} />
              <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border border-black bg-red-500" />
            </button>
            <button
              title="Notepad"
              className={`group flex items-center justify-center rounded-xl border p-2 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(238,214,119,0.75)] ${theme === 'dark' ? 'border-gold/45 bg-ocean-dark/60 hover:border-gold hover:bg-ocean-light/60 text-white' : 'border-gold/50 hover:border-gold hover:bg-gold/20 bg-white text-zinc-950'}`}
              onClick={() => {
                triggerHaptic(10)
                onAction?.('notepad')
              }}
            >
              <FileText size={20} />
            </button>
          </div>

          {showName && (
            <h1
              className={`notranslate mt-2 mb-1 px-4 text-center text-[22px] leading-tight font-bold tracking-tight drop-shadow-md ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}
              style={
                field('MyInfo section Name').textColor ? { color: field('MyInfo section Name').textColor } : undefined
              }
            >
              {personal.fullName}
            </h1>
          )}
          {designationLine && (
            <p
              className={`notranslate mb-6 text-[16px] font-medium opacity-90 drop-shadow-sm ${theme === 'dark' ? 'text-white/90' : 'text-zinc-700'}`}
              style={
                field('MyInfo Designation').textColor ? { color: field('MyInfo Designation').textColor } : undefined
              }
            >
              {designationLine}
            </p>
          )}

          {(showMyVcard || showSaveContact) && (
            <div className="relative z-20 mb-2 flex w-[90%] max-w-[340px] flex-col gap-2 shadow-xl">
              <div className="flex gap-3">
                {showSaveContact && (
                  <button
                    className={`flex h-[40px] flex-1 flex-row items-center justify-center gap-2 rounded-xl border text-[11px] font-bold transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(238,214,119,0.65)] ${theme === 'dark' ? 'border-gold/40 bg-ocean-dark hover:border-gold hover:bg-ocean-light/70 text-white' : 'border-gold hover:bg-gold/10 bg-white text-zinc-900'}`}
                    onClick={() => {
                      triggerHaptic(10)
                      onAction?.('info')
                    }}
                  >
                    <Info size={18} className="text-gold" strokeWidth={1.5} /> MY INFO
                  </button>
                )}
                {showMyVcard && (
                  <button
                    className="from-gold flex h-[40px] flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-linear-to-br to-yellow-500 text-[11px] font-extrabold text-black shadow-lg transition-all hover:scale-[1.03] hover:shadow-[0_0_18px_rgba(250,204,21,0.7)] hover:brightness-110"
                    onClick={() => {
                      triggerHaptic(10)
                      onAction?.('contact')
                    }}
                  >
                    <CreditCard size={18} strokeWidth={1.5} /> MY VCARD
                  </button>
                )}
              </div>
            </div>
          )}

          {showSaveContact && (
            <div className="relative z-20 mb-2 flex w-[90%] max-w-[340px] justify-between gap-2">
              <button
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-2 py-3 text-[10px] font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(238,214,119,0.55)] ${theme === 'dark' ? 'border-white/5 bg-white/10 text-white hover:bg-white/20' : 'border-zinc-900/10 bg-zinc-900/15 text-zinc-900 hover:bg-zinc-900/20'}`}
                onClick={() => {
                  triggerHaptic(10)
                  onAction?.('contact')
                }}
              >
                <Download size={14} className={theme === 'dark' ? 'text-gold' : 'text-amber-800'} /> SAVE MY INFO
              </button>
              <button
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-2 py-3 text-[10px] font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(238,214,119,0.55)] ${theme === 'dark' ? 'border-white/5 bg-white/10 text-white hover:bg-white/20' : 'border-zinc-900/10 bg-zinc-900/15 text-zinc-900 hover:bg-zinc-900/20'}`}
                onClick={() => {
                  triggerHaptic(10)
                  onAction?.('wallet')
                }}
              >
                GOOGLE WALLET
              </button>
            </div>
          )}

          {showGetVcard && (
            <div className="from-gold relative z-20 mx-auto mt-auto mb-[100px] w-[90%] max-w-[340px] overflow-hidden rounded-xl bg-linear-to-r to-yellow-500 shadow-[0_10px_30px_rgba(238,214,119,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_22px_rgba(238,214,119,0.85)]">
              <button
                className="flex h-[45px] w-full items-center justify-center gap-2 text-[12px] font-black text-black transition-all hover:brightness-110 active:scale-95"
                onClick={() => {
                  triggerHaptic(10)
                  onAction?.('contact')
                }}
              >
                <Download size={20} strokeWidth={2.5} /> GET YOUR VCARD NOW
              </button>
            </div>
          )}
        </div>

        {/* Desktop View */}
        <div className="relative z-20 mx-auto hidden h-full w-full max-w-[1032px] flex-col justify-between gap-8 px-6 pb-24 md:flex">
          <div className="mt-16 flex items-start gap-12 xl:gap-20">
            <div className="group relative mt-4 h-[320px] w-[280px] shrink-0 overflow-hidden rounded-2xl border-4 border-white/20 bg-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-md xl:h-[350px] xl:w-[300px]">
              <ProfileMedia
                src={profileSrc}
                alt={personal.fullName ? `${personal.fullName} profile` : 'Profile'}
                className="h-full w-full object-cover opacity-90 transition-opacity hover:opacity-100"
              />
              {profileIsVideo && (
                <div className="border-gold/40 absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full border bg-black/60 px-3 py-1.5 shadow-lg backdrop-blur-md transition-colors group-hover:bg-black/80">
                  <CreditCard size={14} className="text-gold" />
                  <span className="text-gold text-[10px] font-black tracking-widest">
                    {t('hero.premium', 'PREMIUM')}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-1 flex-col pt-8 drop-shadow-2xl xl:pt-12">
              {showName && (
                <h1
                  className={`notranslate mt-6 mb-2 text-[44px] leading-[1.1] font-black tracking-tight drop-shadow-md xl:text-[56px] ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}
                  style={
                    field('MyInfo section Name').textColor
                      ? { color: field('MyInfo section Name').textColor }
                      : undefined
                  }
                >
                  {personal.fullName}
                </h1>
              )}
              {designationLine && (
                <p
                  className={`notranslate mb-5 ml-1 w-fit overflow-hidden bg-linear-to-r bg-clip-text text-[20px] font-bold text-transparent drop-shadow-lg xl:text-[24px] ${theme === 'dark' ? 'from-gold to-yellow-400' : 'from-amber-700 to-amber-950'}`}
                  style={
                    field('MyInfo Designation').textColor ? { color: field('MyInfo Designation').textColor } : undefined
                  }
                >
                  {designationLine}
                </p>
              )}

              <div className="mb-4 flex gap-2">
                {showShare && (
                  <button
                    title="Share"
                    className={`flex items-center justify-center rounded-full border p-2 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(238,214,119,0.75)] ${theme === 'dark' ? 'border-gold/35 bg-ocean-dark/65 hover:border-gold hover:bg-ocean-light/65 text-white' : 'border-gold/45 hover:border-gold hover:bg-gold/20 bg-white text-zinc-950'}`}
                    onClick={() => {
                      triggerHaptic(10)
                      onAction?.('share')
                    }}
                  >
                    <Share2 size={18} />
                  </button>
                )}
                <button
                  title="Notification"
                  className={`group relative flex items-center justify-center rounded-full border p-2 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(238,214,119,0.75)] ${theme === 'dark' ? 'border-gold/35 bg-ocean-dark/65 hover:border-gold hover:bg-ocean-light/65 text-white' : 'border-gold/45 hover:border-gold hover:bg-gold/20 bg-white text-zinc-950'}`}
                  onClick={() => {
                    triggerHaptic(10)
                    onAction?.('notification')
                  }}
                >
                  <Bell size={18} />
                  <div className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full border border-black bg-red-500" />
                </button>
                <button
                  title="Notepad"
                  className={`flex items-center justify-center rounded-full border p-2 transition-all duration-300 hover:scale-110 hover:shadow-[0_0_16px_rgba(238,214,119,0.75)] ${theme === 'dark' ? 'border-gold/35 bg-ocean-dark/65 hover:border-gold hover:bg-ocean-light/65 text-white' : 'border-gold/45 hover:border-gold hover:bg-gold/20 bg-white text-zinc-950'}`}
                  onClick={() => {
                    triggerHaptic(10)
                    onAction?.('notepad')
                  }}
                >
                  <FileText size={18} />
                </button>
              </div>

              {visibleSocials.length > 0 && (
                <div className="ml-1 flex gap-3">
                  {visibleSocials.map((item) => {
                    const href = resolveSocialHref(item.label, socialHref, personal.whatsapp)
                    return (
                      <a
                        key={item.label}
                        title={item.title}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex h-10 w-10 items-center justify-center rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-110 ${theme === 'dark' ? 'border-gold/30 text-gold hover:bg-gold border bg-black/60 backdrop-blur-md hover:text-black hover:shadow-[0_0_18px_rgba(238,214,119,0.85)]' : 'hover:border-gold hover:bg-gold border border-zinc-300 bg-zinc-200 text-zinc-900 hover:text-[#0c1e35] hover:shadow-[0_0_15px_rgba(238,214,119,0.6)]'}`}
                      >
                        {renderSocialIcon(item, 18)}
                      </a>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="mt-auto mb-16 flex w-full items-end justify-between xl:mb-20">
            <div className="flex w-full items-end justify-between gap-12 xl:gap-24">
              {(showSaveContact || showMyVcard || showGetVcard) && (
                <div className="flex w-full max-w-[420px] flex-col gap-3 xl:max-w-[480px]">
                  {(showSaveContact || showMyVcard) && (
                    <div className="grid grid-cols-2 gap-3">
                      {showSaveContact && (
                        <button
                          className={`h-[52px] rounded-2xl border text-[13px] font-bold shadow-lg transition-all hover:scale-[1.02] ${theme === 'dark' ? 'border-gold/40 bg-ocean-dark text-gold hover:border-gold hover:bg-ocean-light/50 hover:shadow-[0_0_20px_rgba(238,214,119,0.6)]' : 'border-gold hover:bg-gold/10 bg-white text-zinc-900 hover:shadow-[0_0_18px_rgba(238,214,119,0.45)]'}`}
                          onClick={() => {
                            triggerHaptic(10)
                            onAction?.('contact')
                          }}
                        >
                          SAVE MY INFO
                        </button>
                      )}
                      {showMyVcard && (
                        <button
                          className="from-gold flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-linear-to-r to-yellow-500 text-[13px] font-extrabold text-black shadow-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(238,214,119,0.7)] hover:brightness-110"
                          onClick={() => {
                            triggerHaptic(10)
                            onAction?.('contact')
                          }}
                        >
                          <CreditCard size={18} /> MY VCARD
                        </button>
                      )}
                    </div>
                  )}
                  {showSaveContact && (
                    <button
                      className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl border text-[13px] font-bold shadow-lg transition-all hover:scale-[1.01] ${theme === 'dark' ? 'border-gold/30 bg-ocean-dark hover:border-gold hover:bg-ocean-light/50 text-white hover:shadow-[0_0_20px_rgba(238,214,119,0.65)]' : 'border-gold hover:bg-gold/10 bg-white text-zinc-950 hover:shadow-[0_0_18px_rgba(238,214,119,0.4)]'}`}
                      onClick={() => {
                        triggerHaptic(10)
                        onAction?.('wallet')
                      }}
                    >
                      <Download size={16} /> SAVE TO GOOGLE WALLET
                    </button>
                  )}
                  {showGetVcard && (
                    <button
                      className="bg-gold h-[52px] w-full rounded-2xl text-[12px] font-black tracking-wide text-black shadow-[0_10px_30px_rgba(238,214,119,0.3)] transition-all hover:scale-[1.02] hover:bg-yellow-400 hover:shadow-[0_0_25px_rgba(238,214,119,0.85)]"
                      onClick={() => {
                        triggerHaptic(10)
                        onAction?.('contact')
                      }}
                    >
                      GET YOUR VCARD NOW
                    </button>
                  )}
                </div>
              )}

              {contactItems.length > 0 && (
                <div className="mt-auto grid max-w-[480px] flex-1 shrink-0 grid-cols-2 gap-x-3 gap-y-2">
                  {contactItems.map((item) => (
                    <div
                      key={item.label}
                      className={`group flex flex-col justify-center rounded-xl p-3 shadow-md transition-all ${theme === 'dark' ? 'border-gold/20 bg-ocean-dark/60 hover:border-gold hover:bg-ocean-light/50 border' : 'border-gold/55 hover:border-gold hover:bg-gold/5 border bg-white'} ${item.colSpan === 2 ? 'col-span-2' : 'col-span-1'}`}
                      style={item.style?.backgroundColor ? { backgroundColor: item.style.backgroundColor } : undefined}
                    >
                      <div className="mb-0.5 flex items-center gap-2">
                        <item.icon
                          className={`transition-colors ${theme === 'dark' ? 'text-gold/70 group-hover:text-gold' : 'text-amber-800 group-hover:text-amber-900'}`}
                          size={12}
                          strokeWidth={2.5}
                          style={item.style?.iconColor ? { color: item.style.iconColor } : undefined}
                        />
                        <span
                          className={`text-[10px] font-bold tracking-widest uppercase ${theme === 'dark' ? 'text-white/40' : 'text-zinc-400'}`}
                        >
                          {item.label}
                        </span>
                      </div>
                      {item.isLink && item.href ? (
                        <a
                          href={item.href}
                          className={`truncate text-[13px] font-semibold hover:underline ${theme === 'dark' ? 'text-white' : 'text-zinc-800'}`}
                          style={item.style?.textColor ? { color: item.style.textColor } : undefined}
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span
                          className={`truncate text-[13px] font-semibold ${theme === 'dark' ? 'text-white' : 'text-zinc-800'}`}
                          style={item.style?.textColor ? { color: item.style.textColor } : undefined}
                        >
                          {item.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
