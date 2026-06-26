'use client'

import { AllReviewsView, SliderReviewCard } from '@/profile-app/components/AllReviewsView'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useGetReviewsQuery } from '@/redux/api'
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  LayoutGrid,
  Loader2,
  MessageCircle,
  Monitor,
  Quote,
  Star,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const REVIEW_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&fit=crop'
const SKELETON_CARD_COUNT = 4

function ReviewsHeaderSkeleton() {
  return (
    <div className="group relative flex min-h-[320px] flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 md:flex-row md:items-center lg:col-span-4 lg:p-12 dark:border-zinc-800/80 dark:bg-zinc-900">
      <div className="w-full space-y-4">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-12 w-3/4 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-20 w-full max-w-xl animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
      </div>
    </div>
  )
}

function ReviewGridCardSkeleton({ idx }: { idx: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
      className="min-h-[280px] animate-pulse rounded-3xl border border-zinc-200 bg-zinc-200 dark:border-zinc-800/80 dark:bg-zinc-800"
    />
  )
}

export const ReviewsSection = () => {
  const { cardOwnerId } = useProfileDisplay()
  const profileId = cardOwnerId?.trim() ?? ''

  const { data, isLoading, isError } = useGetReviewsQuery(profileId, { skip: !profileId })

  const [viewMode, setViewMode] = useState<'grid' | 'slider'>('slider')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)

  const slides = data?.slides ?? []
  const sectionTitle = data?.sectionTitle ?? 'Reviews'
  const leaveReviewUrl = data?.leaveReviewUrl ?? null
  const reviewCount = data?.reviewCount ?? 0
  const clampedActiveIndex = slides.length === 0 ? 0 : Math.min(activeIndex, slides.length - 1)

  const totalReviewsLabel =
    reviewCount >= 50 ? '50+' : reviewCount >= 20 ? '20+' : reviewCount >= 10 ? '10+' : reviewCount

  const nextReview = () => {
    if (isTransitioning || slides.length === 0) return
    setIsTransitioning(true)
    setActiveIndex((prev) => Math.min(slides.length - 1, prev + 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const prevReview = () => {
    if (isTransitioning || slides.length === 0) return
    setIsTransitioning(true)
    setActiveIndex((prev) => Math.max(0, prev - 1))
    setTimeout(() => setIsTransitioning(false), 500)
  }

  if (!profileId) return null

  if (showAllReviews) {
    return <AllReviewsView sectionTitle={sectionTitle} slides={slides} onBack={() => setShowAllReviews(false)} />
  }

  const showInitialLoader = isLoading && slides.length === 0
  const showEmptyState = !isLoading && !isError && slides.length === 0

  return (
    <div className="w-full pb-20">
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {showInitialLoader ? (
          <ReviewsHeaderSkeleton />
        ) : (
          <div className="group relative flex min-h-[320px] flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 md:flex-row md:items-center md:gap-0 lg:col-span-4 lg:p-12 dark:border-zinc-800/80 dark:bg-zinc-900">
            <div className="absolute inset-0 h-full w-full bg-zinc-100 dark:bg-zinc-950">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-multiply grayscale-50 transition-all duration-1000 group-hover:scale-105 group-hover:grayscale-0 dark:opacity-30 dark:mix-blend-screen"
              >
                <source src="https://app.vbizme.com/storage/ecard/profileimages/91/mc%20vbizme.mp4" type="video/mp4" />
              </video>
              <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-zinc-100 via-zinc-100/90 to-zinc-100/40 dark:from-zinc-950 dark:via-zinc-900/80 dark:to-zinc-900/40" />
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-zinc-100 to-transparent dark:from-zinc-950" />
            </div>

            <div className="relative z-10 w-full md:w-auto">
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-600 uppercase shadow-sm backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:text-zinc-300">
                <Star size={12} className="text-yellow-primary" /> {sectionTitle}
              </div>

              <h2 className="mb-4 max-w-2xl text-4xl leading-[1.1] font-bold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-zinc-100">
                Trusted by <span className="text-yellow-primary font-medium italic">Professionals</span>
              </h2>
              <p className="max-w-xl text-lg leading-relaxed font-medium text-zinc-600 dark:text-zinc-300">
                Read what clients and partners are saying, or leave your own review.
              </p>
            </div>

            <div className="relative z-10 flex w-full flex-col items-start md:w-auto md:items-end">
              <div className="mb-6 flex shrink-0 self-start rounded-xl border border-zinc-200 bg-white/80 p-1.5 md:self-end dark:border-zinc-800/80 dark:bg-zinc-950/80">
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${viewMode === 'slider' ? 'bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  <Monitor size={14} /> Slider
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-zinc-100 text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-100' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                >
                  <LayoutGrid size={14} /> Grid
                </button>
              </div>

              <div className="mb-3 flex gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50/80 p-2 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-900/80">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="fill-yellow-primary text-yellow-primary h-5 w-5 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                  />
                ))}
              </div>
              <h3 className="mb-1 flex items-baseline gap-2 text-4xl font-bold tracking-tighter text-zinc-900 drop-shadow-md dark:text-zinc-100">
                5.0 <span className="text-lg text-zinc-500">/ 5.0</span>
              </h3>
              <span className="text-xs font-bold tracking-widest text-zinc-600 uppercase dark:text-zinc-400">
                {totalReviewsLabel} Verified Reviews
              </span>

              {leaveReviewUrl ? (
                <Link
                  href={leaveReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-zinc-900 px-8 py-4 font-bold text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] active:scale-95 md:w-auto dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                  <span className="text-sm font-bold">Leave a Review</span>
                  <MessageCircle size={18} />
                </Link>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {isError ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/80 px-6 py-8 text-center text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Unable to load reviews right now. Please try again later.
        </div>
      ) : null}

      {showEmptyState ? (
        <div className="rounded-3xl border border-zinc-200 bg-white/50 px-6 py-12 text-center backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/50">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">No reviews have been published yet.</p>
        </div>
      ) : null}

      {showInitialLoader ? (
        <div className="vbiz-bento-grid relative z-20 mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, idx) => (
            <ReviewGridCardSkeleton key={idx} idx={idx} />
          ))}
        </div>
      ) : null}

      {!showInitialLoader && slides.length > 0 && viewMode === 'grid' ? (
        <div className="vbiz-bento-grid relative z-20 mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {slides.map((item, idx) => {
            const isFeatured = idx === 0 || idx === 3

            if (item.isLinkCard && item.linkUrl) {
              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  key={item.id}
                  className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white/50 p-6 shadow-sm backdrop-blur-xl sm:p-8 dark:border-zinc-800/80 dark:bg-zinc-900/50 ${isFeatured ? 'md:col-span-2 lg:col-span-2' : 'col-span-1'}`}
                >
                  <Link href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="flex h-full flex-col">
                    <div className="mb-6 flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-zinc-200 dark:border-zinc-700/50">
                        <Image
                          width={100}
                          height={100}
                          src={item.image || REVIEW_IMAGE_FALLBACK}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                    </div>
                    {item.htmlDescription ? (
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none flex-1"
                        dangerouslySetInnerHTML={{ __html: item.htmlDescription }}
                      />
                    ) : null}
                    <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400">
                      Open review page <ExternalLink size={14} />
                    </span>
                  </Link>
                </motion.div>
              )
            }

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={item.id}
                className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white/50 p-6 shadow-sm backdrop-blur-xl transition-colors duration-300 hover:bg-white/80 sm:p-8 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/80 ${isFeatured ? 'bg-linear-to-br from-white to-zinc-50 md:col-span-2 lg:col-span-2 dark:from-zinc-900/80 dark:to-zinc-900/40' : 'col-span-1'}`}
              >
                <div className="relative z-10 w-full">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex gap-1.5 rounded-lg border border-zinc-200/50 bg-zinc-50/50 p-1.5 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-950/50">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="fill-yellow-primary text-yellow-primary h-4 w-4" />
                      ))}
                    </div>
                    <Quote className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
                  </div>
                  {item.htmlDescription ? (
                    <div
                      className={`prose prose-sm dark:prose-invert mb-8 max-w-none ${isFeatured ? 'prose-lg' : ''}`}
                      dangerouslySetInnerHTML={{ __html: item.htmlDescription }}
                    />
                  ) : (
                    <p
                      className={`mb-8 leading-relaxed font-medium text-zinc-700 italic dark:text-zinc-300 ${isFeatured ? 'text-xl' : 'text-base'}`}
                    >
                      &ldquo;{item.plainDescription}&rdquo;
                    </p>
                  )}
                </div>

                <div className="relative z-10 mt-auto flex items-center gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800/80">
                  <div
                    className={`shrink-0 overflow-hidden rounded-full border-2 border-zinc-200 dark:border-zinc-700/50 ${isFeatured ? 'h-14 w-14' : 'h-10 w-10'}`}
                  >
                    <Image
                      width={100}
                      height={100}
                      src={item.image || REVIEW_IMAGE_FALLBACK}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className={`font-bold text-zinc-900 dark:text-zinc-100 ${isFeatured ? 'text-base' : 'text-sm'}`}>
                      {item.title}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : null}

      {!showInitialLoader && slides.length > 0 && viewMode === 'slider' ? (
        <div className="relative z-20 mt-12 mb-8 flex min-h-[500px] w-full flex-col items-center justify-center">
          <div className="relative mx-auto w-full max-w-[1100px] px-14 sm:px-16 md:px-20">
            <button
              type="button"
              onClick={prevReview}
              disabled={clampedActiveIndex === 0}
              aria-label="Previous review"
              className="group absolute top-1/2 left-0 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-xl transition-all hover:bg-zinc-100 hover:text-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ChevronLeft size={22} className="transition-transform group-hover:-translate-x-0.5" />
            </button>

            <button
              type="button"
              onClick={nextReview}
              disabled={clampedActiveIndex === slides.length - 1}
              aria-label="Next review"
              className="group absolute top-1/2 right-0 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-xl transition-all hover:bg-zinc-100 hover:text-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-30 sm:h-12 sm:w-12 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              <ChevronRight size={22} className="transition-transform group-hover:translate-x-0.5" />
            </button>

            <div className="transform-style-3d relative flex h-[460px] w-full items-center justify-center overflow-visible perspective-[1600px]">
              <AnimatePresence initial={false}>
                {slides.map((item, idx) => {
                  const offset = idx - clampedActiveIndex
                  const absOffset = Math.abs(offset)
                  const direction = Math.sign(offset)

                  if (absOffset > 3) return null

                  const zTranslate = absOffset === 0 ? 80 : -absOffset * 100
                  const xTranslate = offset === 0 ? 0 : direction * (absOffset * 150 + 100)
                  const yRotate = offset === 0 ? 0 : direction * -15
                  const scale = absOffset === 0 ? 1 : Math.max(0.75, 1 - absOffset * 0.1)
                  const zIndex = 50 - absOffset
                  const opacity = absOffset === 3 ? 0 : 1

                  return (
                    <motion.div
                      key={item.id}
                      initial={false}
                      animate={{
                        x: xTranslate,
                        z: zTranslate,
                        rotateY: yRotate,
                        scale,
                        zIndex,
                        opacity,
                      }}
                      transition={{
                        duration: 0.6,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      onClick={() => {
                        if (!isTransitioning) {
                          setIsTransitioning(true)
                          setActiveIndex(idx)
                          setTimeout(() => setIsTransitioning(false), 500)
                        }
                      }}
                      className="transform-style-3d group/card absolute flex w-[280px] cursor-pointer flex-col justify-between overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl sm:w-[340px] md:w-[400px] dark:border-zinc-800 dark:bg-zinc-900"
                      style={{ height: '440px' }}
                    >
                      <AnimatePresence>
                        {isTransitioning && absOffset === 0 && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-white/40 backdrop-blur-[2px] dark:bg-zinc-950/40"
                          >
                            <Loader2 size={32} className="text-yellow-primary animate-spin" />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.div
                        animate={{ backgroundColor: absOffset === 0 ? 'rgba(24,24,27,0)' : 'rgba(100,100,100,0.1)' }}
                        className="pointer-events-none absolute inset-0 z-40 rounded-3xl mix-blend-multiply dark:mix-blend-normal"
                      />
                      <motion.div
                        animate={{ backgroundColor: absOffset === 0 ? 'rgba(24,24,27,0)' : 'rgba(24,24,27,0.8)' }}
                        className="pointer-events-none absolute inset-0 z-40 hidden rounded-3xl dark:block"
                      />

                      <div className="bg-yellow-primary/10 dark:bg-yellow-primary/5 pointer-events-none absolute top-0 right-0 -mt-16 -mr-16 rounded-full p-32 blur-3xl" />

                      <div className="relative z-10 flex h-full flex-col">
                        <SliderReviewCard item={item} />
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      ) : null}

      {slides.length > 0 ? (
        <div className="relative z-20 mt-8 mb-8 flex w-full justify-center border-t border-zinc-200 pt-8 dark:border-zinc-800/50">
          <button
            type="button"
            onClick={() => setShowAllReviews(true)}
            className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl border border-zinc-200 bg-white/50 px-8 py-3.5 text-sm font-bold text-zinc-900 shadow-sm backdrop-blur-md transition-all hover:bg-zinc-50 active:scale-95 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <div className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-black/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full dark:via-white/5" />
            See All Reviews{' '}
            <ArrowRight
              size={16}
              className="text-zinc-500 transition-all group-hover:translate-x-1 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
            />
          </button>
        </div>
      ) : null}
    </div>
  )
}
