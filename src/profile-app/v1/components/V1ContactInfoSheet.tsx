'use client'

import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight, X } from 'lucide-react'
import { motion } from 'motion/react'
import { V1BottomSheet } from './V1BottomSheet'

export type V1ContactInfoItem = {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  isLink?: boolean
  href?: string
  style?: { textColor?: string; backgroundColor?: string; iconColor?: string }
}

type V1ContactInfoSheetProps = {
  isOpen: boolean
  onClose: () => void
  items: V1ContactInfoItem[]
}

function ContactRow({ item }: { item: V1ContactInfoItem }) {
  const textStyle = item.style?.textColor ? { color: item.style.textColor } : undefined
  const bgStyle = item.style?.backgroundColor ? { backgroundColor: item.style.backgroundColor } : undefined
  const iconStyle = item.style?.iconColor ? { color: item.style.iconColor } : undefined

  return (
    <div
      className="group hover:border-yellow-primary/40 relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-linear-to-br from-black/3 to-black/1 p-4 backdrop-blur-[30px] transition-all duration-700 dark:border-white/10 dark:from-white/3 dark:to-white/1"
      style={bgStyle}
    >
      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-5 flex items-center justify-between">
          <div
            className="group-hover:border-yellow-primary group-hover:bg-yellow-primary flex h-9 w-9 items-center justify-center rounded-xl border border-black/5 bg-gray-50 text-gray-500 shadow-inner transition-all duration-500 group-hover:rotate-10 group-hover:text-black dark:border-white/10 dark:bg-white/5 dark:text-white/50"
            style={iconStyle}
          >
            <item.icon size={18} strokeWidth={1.5} />
          </div>
          <div className="text-yellow-primary/40 group-hover:text-yellow-primary rounded-md border border-black/5 bg-gray-50 px-2 py-1 text-[7px] font-black tracking-[0.3em] uppercase dark:border-white/5 dark:bg-white/5">
            {item.detail}
          </div>
        </div>
        <div className="mt-auto">
          <span
            className="mb-1.5 block text-[7px] font-black tracking-[0.25em] text-gray-500 uppercase opacity-80 dark:text-white/20"
            style={textStyle}
          >
            {item.label}
          </span>
          {item.isLink ? (
            <a
              href={item.href}
              className="group/link hover:text-yellow-primary flex items-center gap-1 truncate text-xs font-semibold text-gray-900 transition-all dark:text-white/90"
              style={textStyle}
            >
              {item.value}
              <ArrowUpRight
                size={12}
                className="translate-x-1 -translate-y-1 opacity-0 transition-all group-hover/link:translate-x-0 group-hover/link:translate-y-0 group-hover/link:opacity-100"
              />
            </a>
          ) : (
            <span
              className="block truncate text-xs font-semibold tracking-wide text-gray-900 dark:text-white/90"
              style={textStyle}
            >
              {item.value}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

/** Mobile “My Info” sheet — first-template style, v1 bottom animation only. */
export function V1ContactInfoSheet({ isOpen, onClose, items }: V1ContactInfoSheetProps) {
  return (
    <V1BottomSheet isOpen={isOpen} onClose={onClose}>
      <motion.div
        className="flex max-h-[85vh] w-full flex-col rounded-t-3xl border border-black/5 bg-white p-6 shadow-2xl sm:rounded-3xl dark:border-white/10 dark:bg-gray-900"
        layout
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white">Contact Info</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10"
            aria-label="Close contact info"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        <div className="no-scrollbar overflow-y-auto pb-6">
          <div className="grid grid-cols-1 gap-3">
            {items.map((item, idx) => (
              <ContactRow key={`${item.label}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </motion.div>
    </V1BottomSheet>
  )
}
