'use client'

import { notify } from '@/lib/toast/toast'
import { ProfileModalShell } from '@/profile-app/components/ProfileModalShell'
import { downloadProfileContactVcf } from '@/profile-app/lib/contactVcf'
import { saveGuestUser, SaveGuestUserError } from '@/profile-app/lib/saveGuestUser'
import { Check, X } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

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
}

export const SaveContactModal = ({ isOpen, onClose, onSuccess, profileId }: SaveContactModalProps) => {
  const [formData, setFormData] = useState<SaveContactFormData>(EMPTY_FORM)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const finishSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      if (onSuccess) {
        onSuccess()
      } else {
        onClose()
      }
    }, 1000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError(null)

    const trimmedId = profileId?.trim()

    try {
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

      notify.success('Contact saved — your card is downloading.')
      finishSuccess()
    } catch (error) {
      // Duplicate email isn't a real failure: the visitor already exists, so just
      // hand them the contact file again and continue the flow with a friendly note.
      if (error instanceof SaveGuestUserError && error.isDuplicate) {
        notify.info('You have already saved this contact.')
        try {
          if (trimmedId && trimmedId !== 'preview') await downloadProfileContactVcf(trimmedId)
        } catch {
          /* ignore secondary download errors */
        }
        finishSuccess()
        return
      }

      const message = error instanceof Error ? error.message : 'Failed to save contact. Please try again.'
      setSubmitError(message)
      notify.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProfileModalShell
      isOpen={isOpen}
      onClose={onClose}
      backdropClassName="fixed inset-0 z-100 flex items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      panelClassName="relative w-full overflow-hidden rounded-t-3xl border border-zinc-800 bg-zinc-950 shadow-xl sm:max-w-sm sm:rounded-3xl"
    >
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
    </ProfileModalShell>
  )
}
