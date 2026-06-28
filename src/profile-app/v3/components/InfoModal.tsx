'use client'

import { Briefcase, Building2, Globe, Info, Mail, MapPin, Phone, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React from 'react'

interface InfoModalProps {
  isOpen: boolean
  onClose: () => void
  theme?: string
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose, theme }) => {
  const isDark = theme === 'dark'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-zinc-950/60 p-4 backdrop-blur-md">
          {/* Backdrop click close */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className={`relative z-10 my-auto flex w-full max-w-[400px] flex-col overflow-hidden rounded-4xl border shadow-2xl ${
              isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-900'
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between border-b p-6 pb-4 ${
                isDark ? 'border-zinc-900' : 'border-zinc-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-500">
                  <Info size={18} className="text-gold" />
                </div>
                <div>
                  <h3 className="notranslate text-lg font-bold tracking-tight">Michaelangelo Casanova</h3>
                  <p className="notranslate text-xs font-medium text-zinc-500">CEO & Founder</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`rounded-full border p-1.5 transition-all focus:outline-none ${
                  isDark
                    ? 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                    : 'border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800'
                }`}
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* List / Grid of Contact Info */}
            <div className="no-scrollbar max-h-[70vh] space-y-3.5 overflow-y-auto p-6">
              {[
                { icon: Briefcase, label: 'Profession', value: 'CEO' },
                { icon: Building2, label: 'Company', value: 'vBiz Me' },
                { icon: Mail, label: 'Email', value: 'mcasanova@vbizme.com', href: 'mailto:mcasanova@vbizme.com' },
                { icon: Phone, label: 'Phone', value: '(860) 770-9893', href: 'tel:+18607709893' },
                { icon: Globe, label: 'Website', value: 'vbizme.com', href: 'https://vbizme.com' },
                { icon: MapPin, label: 'Address', value: 'New Britain, CT' },
              ].map((item, idx) => {
                const Icon = item.icon
                const blockContent = (
                  <div
                    className={`flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all ${
                      isDark
                        ? 'hover:border-gold/40 border-zinc-800/80 bg-zinc-900/50 hover:bg-zinc-900'
                        : 'hover:border-gold/40 border-zinc-200/60 bg-zinc-50 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="text-gold shrink-0 rounded-lg bg-amber-500/10 p-2">
                      <Icon size={16} strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold tracking-wider text-zinc-400 uppercase">{item.label}</p>
                      <p className="truncate text-sm font-semibold">{item.value}</p>
                    </div>
                  </div>
                )

                if (item.href) {
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="block transition-all active:scale-[0.98]"
                    >
                      {blockContent}
                    </a>
                  )
                }

                return <div key={idx}>{blockContent}</div>
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
