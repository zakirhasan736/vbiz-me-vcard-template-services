'use client'

import { ProfileModalShell } from '@/profile-app/components/ProfileModalShell'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { buildFullContactItems, cleanProfileFieldValue } from '@/profile-app/lib/profileHomeData'
import { Info, X } from 'lucide-react'
import { useMemo } from 'react'

type InfoModalProps = {
  isOpen: boolean
  onClose: () => void
  theme?: string
}

/** Shared "My Info" contact popup — same data + shell behaviour for all templates. */
export function InfoModal({ isOpen, onClose, theme }: InfoModalProps) {
  const isDark = theme === 'dark'
  const { personal, isVisible, field, extraFields } = useProfileDisplay()

  const items = useMemo(
    () => buildFullContactItems(personal, isVisible, field, extraFields),
    [personal, isVisible, field, extraFields]
  )

  const name = (isVisible('MyInfo section Name') && personal.fullName?.trim()) || 'Contact Info'
  const title =
    (isVisible('MyInfo Designation') && personal.designation?.trim() && cleanProfileFieldValue(personal.designation)) ||
    (isVisible('MyInfo Profession') && personal.profession?.trim() && cleanProfileFieldValue(personal.profession)) ||
    (isVisible('MyInfo Company') && personal.company?.trim()) ||
    ''

  return (
    <ProfileModalShell
      isOpen={isOpen}
      onClose={onClose}
      panelClassName={`flex max-h-[85vh] w-full max-w-[400px] flex-col overflow-hidden rounded-t-3xl border shadow-2xl sm:rounded-4xl ${
        isDark ? 'border-zinc-800 bg-zinc-950 text-white' : 'border-zinc-200 bg-white text-zinc-900'
      }`}
    >
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
            <h3 className="notranslate text-lg font-bold tracking-tight">{name}</h3>
            {title ? <p className="notranslate text-xs font-medium text-zinc-500">{title}</p> : null}
          </div>
        </div>

        <button
          type="button"
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

      <div className="no-scrollbar max-h-[70vh] space-y-3.5 overflow-y-auto p-6">
        {items.length === 0 ? (
          <p className="py-6 text-center text-sm text-zinc-500">No contact details available.</p>
        ) : (
          items.map((item, idx) => {
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
                  <p
                    className="truncate text-sm font-semibold"
                    style={item.style?.textColor ? { color: item.style.textColor } : undefined}
                  >
                    {item.value}
                  </p>
                </div>
              </div>
            )

            if (item.isLink && item.href) {
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
          })
        )}
      </div>
    </ProfileModalShell>
  )
}
