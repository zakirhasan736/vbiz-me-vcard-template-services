'use client'

import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { V3EmptyState, V3ErrorState, V3LoadingSkeleton, V3SectionShell } from '@/profile-app/sections'
import { useGetAboutMeQuery } from '@/redux/api'
import { BookOpen, Flag, Lightbulb, Quote, Sparkles, Target, Users } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'

const PILLAR_ICONS = [Lightbulb, Target, Users, Flag] as const
const PILLAR_COLORS = [
  { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' },
  { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
] as const

function resolveOwnerInitial(fullName: string): string {
  const trimmed = fullName.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase()
}

function splitSectionTitle(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { lead: title, accent: '' }
  return {
    lead: words.slice(0, -1).join(' '),
    accent: words[words.length - 1] ?? '',
  }
}

export const AboutSection = () => {
  const { cardOwnerId, personal } = useProfileDisplay()
  const profileId = cardOwnerId?.trim() ?? ''

  const { data, isLoading, isError } = useGetAboutMeQuery(profileId, { skip: !profileId })

  const sectionTitle = data?.sectionTitle ?? 'About Me'
  const aboutItem = data?.items[0]
  const showInitialLoader = isLoading && !aboutItem
  const showEmptyState = !isLoading && !isError && !aboutItem

  if (!profileId) return null

  if (showInitialLoader) {
    return <V3LoadingSkeleton className="min-h-[320px]" />
  }

  if (isError) {
    return <V3ErrorState sectionTitle={sectionTitle} />
  }

  if (showEmptyState || !aboutItem) {
    return (
      <V3EmptyState
        icon={BookOpen}
        title={sectionTitle}
        message="No about me content has been published yet. Add content from the vCard editor."
      />
    )
  }

  const item = aboutItem
  const heroImage = item.featuredImage.trim()
  const hasIntroHtml = item.introHtml.trim().length > 0
  const pillars = item.pillars
  const highlight = item.highlight
  const footer = item.footer
  const ownerInitial = resolveOwnerInitial(personal.fullName)
  const { lead: titleLead, accent: titleAccent } = splitSectionTitle(sectionTitle)
  const showDetailsGrid = Boolean(highlight || pillars.length > 0 || footer)

  return (
    <V3SectionShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col gap-4 md:gap-6"
      >
        <div className="bg-ocean-deep dark:border-gold/20 relative flex min-h-[280px] w-full flex-col overflow-hidden rounded-4xl border border-zinc-800 shadow-xl sm:min-h-[300px] md:min-h-[340px] md:rounded-[2.5rem]">
          <div className="absolute inset-0 z-0 h-full w-full">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={item.title}
                fill
                className="scale-105 object-cover object-top opacity-50 mix-blend-luminosity"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="bg-ocean-deep h-full w-full" />
            )}
            <div className="from-ocean-deep via-ocean-deep/80 to-ocean-deep/30 absolute inset-0 bg-linear-to-t" />
            <div className="from-ocean-deep via-ocean-deep/50 absolute inset-0 hidden bg-linear-to-r to-transparent md:block md:w-2/3" />
          </div>

          {ownerInitial ? (
            <div className="absolute top-4 right-4 z-20 md:top-6 md:right-6">
              <div className="border-gold/30 flex h-10 w-10 flex-col items-center justify-center rounded-xl border bg-black/40 shadow-2xl backdrop-blur-xl md:h-12 md:w-12">
                <span className="mb-0.5 font-serif text-lg font-black tracking-tighter text-white drop-shadow-md md:text-2xl">
                  {ownerInitial}
                </span>
              </div>
            </div>
          ) : null}

          <div className="relative z-10 flex h-full w-full grow flex-col justify-end p-5 sm:p-6 md:p-8 lg:p-10">
            <div className="mt-auto flex max-w-3xl flex-col gap-3 pt-14 sm:gap-4 sm:pt-0 md:gap-5">
              <div className="bg-gold/10 border-gold/30 text-gold inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-[10px] font-bold tracking-widest uppercase shadow-sm backdrop-blur-md md:text-xs">
                <Sparkles size={14} className="text-gold" /> {sectionTitle}
              </div>

              <h2 className="text-2xl leading-[1.15] font-black tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl">
                {titleAccent ? (
                  <>
                    {titleLead}{' '}
                    <span className="from-gold bg-linear-to-r to-yellow-500 bg-clip-text text-transparent">
                      {titleAccent}
                    </span>
                  </>
                ) : (
                  item.title
                )}
              </h2>

              {item.title && item.title !== sectionTitle ? (
                <p className="text-gold/90 max-w-2xl text-base leading-snug font-bold md:text-xl">{item.title}</p>
              ) : null}

              <div className="relative">
                <Quote className="text-gold/10 absolute -top-3 -left-3 -rotate-12" size={32} />
                {hasIntroHtml ? (
                  <div
                    className="prose prose-invert prose-sm md:prose-base relative z-10 max-w-2xl pl-2 leading-relaxed font-medium text-zinc-300 [&_h3]:mb-2 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-white [&_p]:mb-3 [&_strong]:text-white"
                    dangerouslySetInnerHTML={{ __html: item.introHtml }}
                  />
                ) : item.plainDescription ? (
                  <p className="relative z-10 max-w-2xl pl-2 text-sm leading-relaxed font-medium text-zinc-300 md:text-lg">
                    {item.plainDescription}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {showDetailsGrid ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
            {highlight ? (
              <div className="from-gold flex h-full items-center justify-center rounded-4xl bg-linear-to-br to-amber-500 p-6 text-center shadow-sm md:p-8 md:text-left lg:p-10">
                <div className="text-base leading-relaxed font-bold text-black md:text-lg lg:text-xl">
                  {highlight.title ? (
                    <span className="mb-2 block text-3xl font-black tracking-tight md:mb-4 md:text-4xl">
                      {highlight.title}
                    </span>
                  ) : null}
                  {highlight.html ? (
                    <div
                      className="[&_p]:mb-0 [&_strong]:font-black"
                      dangerouslySetInnerHTML={{ __html: highlight.html }}
                    />
                  ) : highlight.plain ? (
                    <span>{highlight.plain}</span>
                  ) : null}
                </div>
              </div>
            ) : null}

            {pillars.length > 0 ? (
              <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${highlight ? '' : 'md:col-span-2'}`}>
                {pillars.map((pillar, idx) => {
                  const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length]
                  const palette = PILLAR_COLORS[idx % PILLAR_COLORS.length]
                  return (
                    <div
                      key={`${pillar.title}-${idx}`}
                      className="group hover:border-gold/30 flex flex-col gap-3 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition-colors md:rounded-4xl md:p-6 dark:border-zinc-800/80 dark:bg-[#031327]"
                    >
                      <div
                        className={`w-fit rounded-xl p-3 ${palette.bg} ${palette.color} transition-transform duration-300 group-hover:scale-110`}
                      >
                        <Icon size={20} strokeWidth={2.5} />
                      </div>
                      <div>
                        <h4 className="mb-1 text-sm font-bold text-zinc-900 md:text-base dark:text-zinc-100">
                          {pillar.title}
                        </h4>
                        {pillar.description ? (
                          <p className="text-xs leading-snug font-medium text-zinc-500 md:text-sm dark:text-zinc-400">
                            {pillar.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : null}

            {footer && (footer.headline || footer.subheadline || footer.tagline) ? (
              <div className="dark:bg-ocean-deep dark:border-gold/20 relative mt-2 flex flex-col items-center justify-between gap-6 overflow-hidden rounded-4xl border border-zinc-800 bg-zinc-950 p-6 text-center shadow-2xl md:col-span-2 md:mt-0 md:flex-row md:gap-8 md:rounded-[2.5rem] md:p-10 lg:p-12">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(238,214,119,0.15)_0%,transparent_70%)]" />
                <div className="via-gold/50 absolute top-0 left-0 h-px w-full bg-linear-to-r from-transparent to-transparent" />

                <div className="relative z-10 flex-1 text-center md:text-left">
                  {footer.headline ? (
                    <h3 className="mb-1.5 text-xl font-black tracking-tight text-white md:mb-2 md:text-2xl lg:text-3xl">
                      {footer.headline}
                    </h3>
                  ) : null}
                  {footer.subheadline ? (
                    <p className="text-base font-bold text-zinc-400 md:text-lg">{footer.subheadline}</p>
                  ) : null}
                </div>

                {footer.tagline ? (
                  <div className="bg-gold/10 border-gold/20 relative z-10 w-full shrink-0 rounded-2xl border p-4 text-center md:w-auto md:p-5 md:text-right">
                    <p className="text-gold text-sm leading-snug font-black tracking-widest uppercase md:text-base">
                      {footer.tagline}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </motion.div>
    </V3SectionShell>
  )
}
