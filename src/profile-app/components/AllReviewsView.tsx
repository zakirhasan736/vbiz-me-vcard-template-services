'use client'

import type { ReviewListItem } from '@/interfaces/api/reviews.interface'
import { ArrowLeft, ExternalLink, Quote, Star } from 'lucide-react'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'

const REVIEW_IMAGE_FALLBACK = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&fit=crop'

type AllReviewsViewProps = {
  sectionTitle: string
  slides: ReviewListItem[]
  onBack: () => void
}

function ReviewCardContent({ item }: { item: ReviewListItem }) {
  if (item.isLinkCard && item.linkUrl) {
    return (
      <Link href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="group/link flex h-full flex-col">
        <div className="mb-6 flex items-center gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800/80">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-zinc-200 dark:border-zinc-700/50">
            <Image
              width={100}
              height={100}
              src={item.image || REVIEW_IMAGE_FALLBACK}
              alt={item.title}
              className="h-full w-full object-cover object-center"
            />
          </div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
        </div>
        {item.htmlDescription ? (
          <div
            className="prose prose-sm dark:prose-invert max-w-none flex-1 text-zinc-700 transition-colors group-hover/link:text-zinc-900 dark:text-zinc-300 dark:group-hover/link:text-zinc-100"
            dangerouslySetInnerHTML={{ __html: item.htmlDescription }}
          />
        ) : (
          <p className="text-lg font-bold text-emerald-700 italic underline dark:text-emerald-400">
            Click here to write or read reviews
          </p>
        )}
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-zinc-600 dark:text-zinc-400">
          Open review page <ExternalLink size={14} />
        </span>
      </Link>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50/80 p-1.5 dark:border-zinc-800 dark:bg-zinc-950/80">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="fill-yellow-primary text-yellow-primary h-4 w-4" />
          ))}
        </div>
        <Quote className="h-8 w-8 text-zinc-200 dark:text-zinc-800" />
      </div>
      {item.htmlDescription ? (
        <div
          className="prose prose-sm dark:prose-invert mb-8 max-w-none text-zinc-700 dark:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: item.htmlDescription }}
        />
      ) : item.plainDescription ? (
        <p className="mb-8 text-lg leading-relaxed font-medium text-zinc-700 italic md:text-xl dark:text-zinc-300">
          &ldquo;{item.plainDescription}&rdquo;
        </p>
      ) : null}
      <div className="mt-auto flex items-center gap-4 border-t border-zinc-200 pt-5 dark:border-zinc-800/80">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-zinc-200 dark:border-zinc-700/50">
          <Image
            width={100}
            height={100}
            src={item.image || REVIEW_IMAGE_FALLBACK}
            alt={item.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{item.title}</p>
        </div>
      </div>
    </>
  )
}

export function AllReviewsView({ sectionTitle, slides, onBack }: AllReviewsViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="w-full pb-20"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white/80 px-4 py-2.5 text-sm font-bold text-zinc-900 shadow-sm transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        <ArrowLeft size={16} />
        Back to {sectionTitle}
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">All Reviews</h2>
        <p className="mt-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {slides.length} {slides.length === 1 ? 'entry' : 'entries'}
        </p>
      </div>

      <div className="vbiz-bento-grid grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {slides.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            className="flex min-h-[280px] flex-col rounded-3xl border border-zinc-200 bg-white/50 p-6 shadow-sm backdrop-blur-xl sm:p-8 dark:border-zinc-800/80 dark:bg-zinc-900/50"
          >
            <ReviewCardContent item={item} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export function SliderReviewCard({ item }: { item: ReviewListItem }) {
  if (item.isLinkCard && item.linkUrl) {
    return (
      <Link href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="group/link flex h-full flex-col">
        <div className="border-yellow-primary/40 mb-6 flex items-center gap-4 border-b pb-4">
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
            className="prose prose-sm dark:prose-invert max-w-none flex-1 font-medium text-zinc-700 transition-colors group-hover/link:text-zinc-900 dark:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: item.htmlDescription }}
          />
        ) : (
          <p className="text-lg font-bold text-emerald-700 italic underline dark:text-emerald-400">
            Click here to write or read reviews
          </p>
        )}
      </Link>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-start justify-between">
        <div className="flex gap-1 rounded-lg border border-zinc-200 bg-zinc-50/80 p-1.5 dark:border-zinc-800 dark:bg-zinc-950/80">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="fill-yellow-primary text-yellow-primary h-4 w-4" />
          ))}
        </div>
        <Quote className="h-8 w-8 text-zinc-200 transition-colors group-hover/card:text-zinc-300 dark:text-zinc-800" />
      </div>
      {item.htmlDescription ? (
        <div
          className="prose prose-sm dark:prose-invert mb-8 max-w-none text-lg leading-relaxed font-medium text-zinc-700 md:text-xl dark:text-zinc-300"
          dangerouslySetInnerHTML={{ __html: item.htmlDescription }}
        />
      ) : item.plainDescription ? (
        <p className="mb-8 text-lg leading-relaxed font-medium text-zinc-700 italic md:text-xl dark:text-zinc-300">
          &ldquo;{item.plainDescription}&rdquo;
        </p>
      ) : null}
      <div className="relative z-10 -mx-8 mt-auto -mb-8 flex items-center gap-4 border-t border-zinc-200 bg-zinc-50/80 px-8 pt-6 pb-8 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/80">
        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-zinc-200 dark:border-zinc-700/50">
          <Image
            width={48}
            height={48}
            src={item.image || REVIEW_IMAGE_FALLBACK}
            alt={item.title}
            className="h-full w-full object-cover grayscale-30 transition-all duration-300 group-hover/card:grayscale-0"
          />
        </div>
        <div>
          <p className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{item.title}</p>
        </div>
      </div>
    </>
  )
}
