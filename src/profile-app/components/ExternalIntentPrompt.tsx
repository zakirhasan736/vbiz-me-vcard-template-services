'use client'

import { VBIZ_EXTERNAL_INTENT_EVENT, type ExternalIntentDetail } from '@/profile-app/lib/openExternalIntent'
import { ExternalLink, Mail, MessageSquare, Phone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

function IntentIcon({ href }: { href: string }) {
  const className = 'h-5 w-5 shrink-0'
  if (href.startsWith('tel:')) return <Phone className={className} strokeWidth={2.25} />
  if (href.startsWith('mailto:')) return <Mail className={className} strokeWidth={2.25} />
  if (href.startsWith('sms:')) return <MessageSquare className={className} strokeWidth={2.25} />
  return <ExternalLink className={className} strokeWidth={2.25} />
}

/**
 * One-tap fallback when the AI agent opens call/email/SMS/links from an
 * async tool callback (often blocked without a real user gesture).
 */
export function ExternalIntentPrompt() {
  const [intent, setIntent] = useState<ExternalIntentDetail | null>(null)

  useEffect(() => {
    const onIntent = (event: Event) => {
      const detail = (event as CustomEvent<ExternalIntentDetail>).detail
      if (!detail?.href || !detail.label) return
      setIntent(detail)
    }
    window.addEventListener(VBIZ_EXTERNAL_INTENT_EVENT, onIntent)
    return () => window.removeEventListener(VBIZ_EXTERNAL_INTENT_EVENT, onIntent)
  }, [])

  useEffect(() => {
    if (!intent) return
    const timer = window.setTimeout(() => setIntent(null), 20000)
    return () => window.clearTimeout(timer)
  }, [intent])

  return (
    <AnimatePresence>
      {intent ? (
        <motion.div
          key={intent.href + intent.label}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="pointer-events-auto fixed right-3 bottom-24 left-3 z-200 flex items-center gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-950/95 p-3 shadow-2xl backdrop-blur-md sm:right-6 sm:left-auto sm:max-w-sm md:bottom-8"
          role="status"
          aria-live="polite"
        >
          <a
            href={intent.href}
            target={/^https?:/i.test(intent.href) ? '_blank' : undefined}
            rel="noopener noreferrer"
            onClick={() => setIntent(null)}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-amber-500 px-3 py-2.5 text-zinc-950 transition-transform active:scale-[0.98]"
          >
            <IntentIcon href={intent.href} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold">{intent.label}</span>
              {intent.description ? (
                <span className="block truncate text-[11px] font-medium text-zinc-800/80">{intent.description}</span>
              ) : (
                <span className="block text-[11px] font-medium text-zinc-800/80">Tap to continue</span>
              )}
            </span>
          </a>
          <button
            type="button"
            onClick={() => setIntent(null)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
