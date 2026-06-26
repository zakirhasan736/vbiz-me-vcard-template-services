'use client'

import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useGetAboutMeQuery } from '@/redux/api'
import { ArrowRight, Award, BookOpen, Quote, Rocket, Target } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'

const PILLAR_ICONS = [Target, Award, Rocket] as const
const PILLAR_ACCENTS = ['from-[#eab308]/20', 'from-zinc-900/10 dark:from-zinc-100/20', 'from-blue-500/20'] as const

function AboutSectionSkeleton() {
  return (
    <div className="vbiz-bento-grid grid w-full grid-cols-1 gap-4 pb-20 md:grid-cols-3 lg:grid-cols-4">
      <div className="min-h-[360px] animate-pulse rounded-3xl border border-zinc-200 bg-zinc-200 md:col-span-3 lg:col-span-3 dark:border-zinc-800/80 dark:bg-zinc-800" />
      <div className="min-h-[300px] animate-pulse rounded-3xl border border-zinc-200 bg-zinc-200 md:col-span-3 lg:col-span-1 dark:border-zinc-800/80 dark:bg-zinc-800" />
      {Array.from({ length: 3 }, (_, idx) => (
        <div
          key={idx}
          className="min-h-[180px] animate-pulse rounded-3xl border border-zinc-200 bg-zinc-200 dark:border-zinc-800/80 dark:bg-zinc-800"
        />
      ))}
    </div>
  )
}

export const AboutSection = () => {
  const { cardOwnerId } = useProfileDisplay()
  const profileId = cardOwnerId?.trim() ?? ''

  const { data, isLoading, isError } = useGetAboutMeQuery(profileId, { skip: !profileId })

  const sectionTitle = data?.sectionTitle ?? 'About Me'
  const aboutItem = data?.items[0]
  const showInitialLoader = isLoading && !aboutItem
  const showEmptyState = !isLoading && !isError && !aboutItem

  if (!profileId) return null

  if (showInitialLoader) {
    return <AboutSectionSkeleton />
  }

  if (isError) {
    return (
      <div className="w-full pb-20">
        <div className="rounded-3xl border border-red-200 bg-red-50/80 px-6 py-8 text-center text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Unable to load {sectionTitle.toLowerCase()} right now. Please try again later.
        </div>
      </div>
    )
  }

  if (showEmptyState || !aboutItem) {
    return (
      <div className="w-full pb-20">
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 bg-white/40 p-10 text-center dark:border-zinc-800/80 dark:bg-zinc-900/30">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-[#eab308] dark:border-zinc-700 dark:bg-zinc-800/80">
            <BookOpen size={24} />
          </div>
          <h2 className="mb-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{sectionTitle}</h2>
          <p className="max-w-md text-sm leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
            No about me content has been published yet. Add content from the vCard editor.
          </p>
        </div>
      </div>
    )
  }

  const item = aboutItem
  const heroImage = item.featuredImage.trim()
  const hasIntroHtml = item.introHtml.trim().length > 0
  const pillars = item.pillars

  return (
    <div className="vbiz-bento-grid grid w-full grid-cols-1 gap-4 pb-20 md:grid-cols-3 lg:grid-cols-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white/50 p-8 backdrop-blur-xl md:col-span-3 lg:col-span-3 lg:p-10 dark:border-zinc-800/80 dark:bg-zinc-900/50"
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-zinc-100/50 to-transparent dark:from-zinc-800/20" />
        <div className="pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 rounded-full bg-[#eab308]/10 p-32 blur-3xl transition-transform duration-1000 group-hover:scale-110 dark:bg-[#eab308]/5" />
        <div className="pointer-events-none absolute bottom-0 left-0 -mb-24 -ml-24 rounded-full bg-black/5 p-24 blur-3xl transition-transform delay-100 duration-1000 group-hover:scale-110 dark:bg-white/5" />

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-white/80 px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-600 uppercase shadow-sm backdrop-blur-sm transition-colors dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:text-zinc-300"
          >
            <BookOpen size={12} className="text-[#eab308]" /> {sectionTitle}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6 max-w-3xl text-3xl leading-[1.1] font-bold tracking-tight text-zinc-900 sm:text-4xl lg:text-5xl dark:text-zinc-100"
          >
            {item.title}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative"
          >
            <Quote size={40} className="absolute -top-4 -left-4 -rotate-12 text-zinc-200 dark:text-zinc-800/50" />
            {hasIntroHtml ? (
              <div
                className="prose prose-zinc dark:prose-invert relative z-10 max-w-3xl px-4 text-base leading-relaxed font-medium lg:text-lg [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-4"
                dangerouslySetInnerHTML={{ __html: item.introHtml }}
              />
            ) : item.plainDescription ? (
              <p className="relative z-10 mb-4 max-w-2xl px-4 text-base leading-relaxed font-medium text-zinc-600 lg:text-lg dark:text-zinc-400">
                {item.plainDescription}
              </p>
            ) : null}
          </motion.div>
        </div>
      </motion.div>

      {heroImage ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-3xl border border-zinc-200 bg-white p-4 transition-all duration-500 hover:border-zinc-300 md:col-span-3 lg:col-span-1 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
        >
          <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-white via-white/40 to-transparent dark:from-zinc-950 dark:via-zinc-900/40" />
          <Image
            src={heroImage}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-[2s] group-hover:scale-105 group-hover:opacity-80"
            width={800}
            height={800}
          />

          <div className="relative z-20 mt-auto mb-2 w-full px-2">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#eab308]/30 bg-[#eab308]/20 text-[#eab308] shadow-lg backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1">
                <Award size={20} />
              </div>
              <div>
                <p className="text-base leading-tight font-bold text-zinc-900 dark:text-zinc-100">Professional</p>
                <p className="text-xs font-semibold tracking-wide text-[#eab308] uppercase">Journey</p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}

      {pillars.map((pillar, idx) => {
        const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length]
        const accent = PILLAR_ACCENTS[idx % PILLAR_ACCENTS.length]

        return (
          <motion.div
            key={`${pillar.title}-${idx}`}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: 'easeOut' }}
            className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl transition-colors duration-500 hover:bg-white/80 md:col-span-1 lg:col-span-1 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80"
          >
            <div
              className={`absolute top-0 left-0 h-full w-full bg-linear-to-br ${accent} pointer-events-none to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-10 dark:group-hover:opacity-10`}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 text-zinc-600 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-zinc-900 group-hover:text-white group-hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950">
              <Icon size={20} />
            </div>
            <div>
              <h4 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">{pillar.title}</h4>
              {pillar.description ? (
                <p className="text-sm leading-relaxed font-medium text-zinc-600 transition-colors group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-zinc-300">
                  {pillar.description}
                </p>
              ) : null}
            </div>
          </motion.div>
        )
      })}

      {pillars.length > 0 && pillars.length < 4 ? (
        <div className="group relative hidden cursor-default flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-zinc-200 bg-zinc-100/50 p-6 text-center opacity-50 backdrop-blur-xl transition-all duration-500 hover:border-[#eab308]/50 hover:opacity-100 lg:col-span-1 lg:flex dark:border-zinc-800/50 dark:bg-zinc-900/30">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 transition-all duration-500 group-hover:rotate-12 group-hover:bg-[#eab308]/10 group-hover:text-[#eab308] dark:bg-zinc-800/50">
            <ArrowRight size={20} />
          </div>
          <p className="text-xs font-bold tracking-widest text-zinc-500 uppercase group-hover:text-[#eab308]">
            Explore More
          </p>
        </div>
      ) : null}
    </div>
  )
}
