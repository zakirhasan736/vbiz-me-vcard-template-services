'use client'

import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { useGetFaqQuery } from '@/redux/api'
import { ChevronDown, Lightbulb, MessageCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'

type FAQSectionProps = {
  template?: 'v1' | 'v2'
}

type FaqItem = {
  id: number
  question: string
  answer: string
}

function FaqSkeleton({ cardClass }: { cardClass: string }) {
  return (
    <div className="w-full pb-20">
      <div className={`mb-4 min-h-[200px] animate-pulse ${cardClass}`} />
      <div className="mt-4 flex flex-col gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={`min-h-[72px] animate-pulse ${cardClass}`} />
        ))}
      </div>
    </div>
  )
}

export const FAQSection = ({ template: templateProp }: FAQSectionProps = {}) => {
  const { cardOwnerId, design } = useProfileDisplay()
  const profileId = cardOwnerId?.trim() ?? ''
  const template = templateProp ?? (design?.profileTemplate === 'v1' ? 'v1' : 'v2')
  const accent = design?.accentColor ?? (template === 'v1' ? '#dcc969' : '#eab308')

  const { data, isLoading, isError } = useGetFaqQuery(profileId, { skip: !profileId })

  const faqs = useMemo<FaqItem[]>(() => {
    return [...(data?.posts ?? [])]
      .reverse()
      .filter((item) => item.title.trim().length > 0 && item.description.trim().length > 0)
      .map((item) => ({
        id: item.id,
        question: item.title,
        answer: item.description,
      }))
  }, [data?.posts])

  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const isV1 = template === 'v1'
  const cardClass = isV1
    ? 'rounded-[2rem] border border-black/5 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/40'
    : 'rounded-[1.5rem] border border-zinc-200 bg-white/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-900/50'

  const showInitialLoader = isLoading && faqs.length === 0
  const showEmptyState = !isLoading && !isError && faqs.length === 0

  if (!profileId) return null

  if (showInitialLoader) {
    return <FaqSkeleton cardClass={cardClass} />
  }

  if (isError) {
    return (
      <div className="w-full pb-20">
        <div className="rounded-3xl border border-red-200 bg-red-50/80 px-6 py-8 text-center text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          Unable to load FAQs right now. Please try again later.
        </div>
      </div>
    )
  }

  return (
    <div className="w-full pb-20">
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className={`group relative flex flex-col overflow-hidden p-8 lg:col-span-4 lg:p-10 ${cardClass}`}
        >
          <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-zinc-100/50 to-transparent dark:from-zinc-800/20" />
          <div
            className="pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 rounded-full p-32 blur-3xl transition-transform duration-1000 group-hover:scale-110"
            style={{ backgroundColor: `${accent}18` }}
          />

          <div className="relative z-10 w-full">
            <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-100 px-3 py-1.5 text-[10px] font-bold tracking-wider text-zinc-600 uppercase shadow-sm backdrop-blur-sm dark:border-zinc-700/50 dark:bg-zinc-800/80 dark:text-zinc-300">
              <MessageCircle size={12} style={{ color: accent }} /> Support & Knowledge Base
            </div>

            <h2
              className={`mb-4 max-w-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 ${isV1 ? 'text-3xl sm:text-4xl lg:text-[2.75rem]' : 'text-3xl sm:text-4xl lg:text-5xl'} leading-[1.1]`}
            >
              Frequently Asked{' '}
              <span className="font-medium italic" style={{ color: accent }}>
                Questions
              </span>
            </h2>
            <p className="max-w-xl text-base leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
              {faqs.length > 0
                ? 'Answers to common questions about working with us.'
                : 'Frequently asked questions will appear here once they are published.'}
            </p>
          </div>
        </motion.div>
      </div>

      <div className="relative z-20 mt-4 flex flex-col gap-4">
        {faqs.length > 0 ? (
          <AnimatePresence>
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`group relative overflow-hidden shadow-sm transition-all duration-500 ${cardClass} ${isOpen ? 'border-zinc-300/80 bg-zinc-100/30 dark:border-zinc-700/80 dark:bg-zinc-800/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/80'}`}
                >
                  {isOpen && <div className="absolute top-0 left-0 h-full w-1.5" style={{ backgroundColor: accent }} />}
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="relative z-10 flex w-full cursor-pointer items-center justify-between p-6 text-left focus:outline-none lg:p-8"
                  >
                    <h4
                      className={`pr-8 text-base font-bold transition-colors duration-300 md:text-lg ${isOpen ? 'text-zinc-900 dark:text-zinc-100' : 'text-zinc-600 group-hover:text-zinc-900 dark:text-zinc-300 dark:group-hover:text-zinc-100'}`}
                    >
                      {faq.question}
                    </h4>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${isOpen ? 'rotate-180 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950' : 'border border-zinc-200 bg-zinc-100 text-zinc-500 group-hover:bg-white group-hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:group-hover:bg-zinc-100 dark:group-hover:text-zinc-950'}`}
                    >
                      <ChevronDown size={18} strokeWidth={2.5} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10"
                      >
                        <div className="mt-2 border-t border-zinc-200 px-6 pt-0 pb-8 text-sm leading-relaxed font-medium text-zinc-600 md:text-base lg:px-8 dark:border-zinc-800/50 dark:text-zinc-400">
                          <div
                            className="prose prose-sm prose-zinc dark:prose-invert max-w-none pt-6"
                            dangerouslySetInnerHTML={{ __html: faq.answer }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </AnimatePresence>
        ) : showEmptyState ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`col-span-full flex flex-col items-center justify-center p-12 text-center ${cardClass}`}
          >
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500 dark:bg-zinc-800">
              <Lightbulb size={28} style={{ color: accent }} />
            </div>
            <h4 className="mb-2 text-xl font-bold text-zinc-900 dark:text-zinc-100">No FAQs published yet</h4>
            <p className="max-w-sm font-medium text-zinc-500">
              Add questions and answers from the vCard editor FAQ tab to show them here.
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
