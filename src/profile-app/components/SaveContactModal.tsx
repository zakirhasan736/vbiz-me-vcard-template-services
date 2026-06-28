'use client'

import { downloadProfileContactVcf } from '@/profile-app/lib/contactVcf'
import { saveGuestUser } from '@/profile-app/lib/saveGuestUser'
import { V1BottomSheet } from '@/profile-app/v1/components/V1BottomSheet'
import { Check, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

export type ModalPresentation = 'default' | 'bottom-sheet'

type SaveContactFormData = {
  firstName: string
  lastName: string
  email: string
}

const EMPTY_FORM: SaveContactFormData = { firstName: '', lastName: '', email: '' }

type SaveContactModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  /** Profile owner id sent to `POST /save-guest-user` and `GET /save-contact/{id}`. */
  profileId?: string
  presentation?: ModalPresentation
}

export const SaveContactModal = ({ isOpen, presentation = 'default', ...props }: SaveContactModalProps) => {
  if (presentation === 'bottom-sheet') {
    return <SaveContactModalPanel isOpen={isOpen} presentation={presentation} {...props} />
  }
  return (
    <AnimatePresence>
      {isOpen ? <SaveContactModalPanel isOpen presentation={presentation} {...props} /> : null}
    </AnimatePresence>
  )
}

function SaveContactModalPanel({
  isOpen = true,
  onClose,
  onSuccess,
  profileId,
  presentation = 'default',
}: Omit<SaveContactModalProps, 'isOpen'> & { isOpen?: boolean }) {
  const [formData, setFormData] = useState<SaveContactFormData>(EMPTY_FORM)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (presentation === 'bottom-sheet') return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [presentation])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    try {
      const trimmedId = profileId?.trim()
      if (!trimmedId || trimmedId === 'preview') {
        await new Promise((resolve) => setTimeout(resolve, 400))
      } else {
        await saveGuestUser({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          profileId: trimmedId,
        })
        await downloadProfileContactVcf(trimmedId)
      }

      setShowSuccess(true)
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        } else {
          onClose()
        }
      }, 1000)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save contact. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const panel = (
    <div className="relative z-10 p-6">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full border border-zinc-800 bg-zinc-900 p-1.5 text-zinc-500 transition-all hover:bg-zinc-800 hover:text-zinc-300 focus:outline-none"
        aria-label="Close save contact dialog"
      >
        <X size={16} />
      </button>

      {!showSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="mb-2 text-xl font-bold tracking-tight text-zinc-100">Save Contact</h3>
          <input
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            disabled={submitting}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none disabled:opacity-60"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            disabled={submitting}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none disabled:opacity-60"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            disabled={submitting}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-700 focus:outline-none disabled:opacity-60"
          />
          {submitError ? (
            <p className="text-center text-xs text-red-400" role="alert">
              {submitError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-zinc-100 py-3 text-sm font-bold text-zinc-950 shadow-sm transition-all hover:bg-white active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Saving…' : 'Save Contact'}
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-green-500"
          >
            <Check size={36} strokeWidth={3} />
          </motion.div>
          <h3 className="mb-2 text-xl font-bold text-zinc-100">Saved!</h3>
          <p className="text-sm text-zinc-400">Your contact file is downloading.</p>
        </div>
      )}
    </div>
  )

  if (presentation === 'bottom-sheet') {
    return (
      <V1BottomSheet isOpen={isOpen} onClose={onClose}>
        <div className="relative w-full overflow-hidden rounded-t-[2.5rem] border-t border-white/10 bg-[#0c0c0e] shadow-[0_40px_100px_rgba(0,0,0,0.85)] sm:rounded-[2.5rem] sm:border">
          {panel}
        </div>
      </V1BottomSheet>
    )
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 shadow-xl"
      >
        {panel}
      </motion.div>
    </div>
  )
}
