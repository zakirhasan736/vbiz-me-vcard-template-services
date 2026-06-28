'use client'

import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import { resolveShareUrl } from '@/profile-app/lib/shareProfile'
import {
  Check,
  Copy,
  Download,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  MessageSquare,
  Phone,
  QrCode as QrIcon,
  Send,
  Twitter,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import QRCode from 'qrcode'
import React, { useEffect, useMemo, useState } from 'react'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  profileName?: string
  profileTitle?: string
  phone?: string
  email?: string
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  profileName = 'Michaelangelo C.',
  profileTitle = 'CEO of vBiz Me',
  phone = '860-770-9893',
  email = 'mcasanova@vbizme.com',
}) => {
  const { design } = useProfileDisplay()
  const accentColor = design?.accentColor ?? '#eab308'
  const shareUrl = useMemo(() => {
    if (!isOpen) return ''
    const url = resolveShareUrl()
    return url.split('?')[0]
  }, [isOpen])
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrColor, setQrColor] = useState<'classic' | 'amber'>('classic')

  useEffect(() => {
    if (isOpen && shareUrl) {
      // Generate clean high-res QR code
      const foregroundColor = qrColor === 'amber' ? accentColor : '#09090b'
      QRCode.toDataURL(shareUrl, {
        width: 600,
        margin: 1,
        color: {
          dark: foregroundColor,
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      })
        .then((url) => {
          setQrCodeUrl(url)
        })
        .catch((err) => {
          console.error('Error generating QR code:', err)
        })
    }
  }, [isOpen, shareUrl, qrColor, accentColor])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const handleDownloadQr = () => {
    if (!qrCodeUrl) return
    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${profileName.toLowerCase().replace(/\s+/g, '_')}_qr_code.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const shareText = `Check out Michaelangelo C.'s digital business card profile here:`

  const socialShares = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color: 'hover:bg-[#25D366] hover:border-[#25D366]/50 hover:text-white',
      textColor: 'text-[#25D366]',
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#0077B5] hover:border-[#0077B5]/50 hover:text-white',
      textColor: 'text-[#0077B5]',
    },
    {
      name: 'X',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'hover:bg-[#1DA1F2] hover:border-[#1DA1F2]/50 hover:text-white',
      textColor: 'text-[#1DA1F2]',
    },
    {
      name: 'Telegram',
      icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      color: 'hover:bg-[#0088cc] hover:border-[#0088cc]/50 hover:text-white',
      textColor: 'text-[#0088cc]',
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-[#1877F2] hover:border-[#1877F2]/50 hover:text-white',
      textColor: 'text-[#1877F2]',
    },
  ]

  const contactLinks = [
    {
      name: 'Email Profile',
      icon: Mail,
      href: `mailto:${email}?subject=${encodeURIComponent('Digital Profile: ' + profileName)}&body=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
      color:
        'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#eab308]',
    },
    {
      name: 'SMS / Text Link',
      icon: MessageSquare,
      href: `sms:?&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      color:
        'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#eab308]',
    },
    {
      name: 'Direct Call',
      icon: Phone,
      href: `tel:${phone.replace(/\D/g, '')}`,
      color:
        'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-[#eab308]',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="share_modal_backdrop"
          className="fixed inset-0 z-100 flex items-center justify-center overflow-y-auto bg-zinc-950/60 p-4 backdrop-blur-md"
        >
          {/* Main Backdrop click escape */}
          <div className="absolute inset-0" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', stiffness: 350, damping: 24 }}
            className="relative z-10 my-auto flex w-full max-w-[460px] flex-col overflow-hidden rounded-4xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-900 dark:bg-zinc-950"
          >
            {/* Header section */}
            <div className="flex items-center justify-between border-b border-zinc-100 p-6 pb-2 dark:border-zinc-900">
              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-500">
                  <QrIcon size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Share Profile</h3>
                  <p className="text-xs font-medium text-zinc-500">Generate QR & connect instantly</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="rounded-full border border-zinc-200 bg-zinc-100 p-1.5 text-zinc-500 transition-all hover:bg-zinc-200 hover:text-zinc-800 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            <div className="no-scrollbar max-h-[75vh] space-y-5 overflow-y-auto p-6">
              {/* Virtual Scan Card Container */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-100 bg-zinc-50 p-5 dark:border-zinc-900/80 dark:bg-zinc-900/40">
                {/* Physical-style Badge Card with QR code */}
                <div className="group relative flex w-full max-w-[260px] flex-col items-center rounded-2xl border border-zinc-200/50 bg-white p-5 text-center text-zinc-950 shadow-lg">
                  {/* Small card accents */}
                  <div className="absolute top-3 left-3 flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
                  </div>
                  <span className="absolute top-3 right-3 font-mono text-[8px] font-bold tracking-wider text-zinc-400">
                    vBIZ PASS
                  </span>

                  {/* Portrait Mini Profile */}
                  <div className="mt-2 mb-3">
                    <h4 className="notranslate text-sm font-bold tracking-tight text-zinc-900">{profileName}</h4>
                    <p className="notranslate text-[10px] font-semibold tracking-wide text-[#eab308] uppercase">
                      {profileTitle}
                    </p>
                  </div>

                  {/* QR Image Frame */}
                  <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50 p-2.5 shadow-inner">
                    {qrCodeUrl ? (
                      <motion.img
                        key={qrCodeUrl}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        src={qrCodeUrl}
                        alt="Profile QR Code"
                        className="pointer-events-none h-full w-full object-contain"
                      />
                    ) : (
                      <div className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-[#eab308]" />
                    )}
                  </div>

                  {/* Bottom Verification Mark */}
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-zinc-400">
                    <span className="inline-block h-1 w-1 rounded-full bg-green-500" />
                    Scan to view digital card
                  </div>
                </div>

                {/* QR Config buttons */}
                <div className="mt-4 flex w-full items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Color:</span>
                    <button
                      onClick={() => setQrColor('classic')}
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${
                        qrColor === 'classic'
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-950'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      Classic
                    </button>
                    <button
                      onClick={() => setQrColor('amber')}
                      className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${
                        qrColor === 'amber'
                          ? 'border-amber-500 bg-amber-500 font-black text-zinc-950'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      Amber
                    </button>
                  </div>

                  <button
                    onClick={handleDownloadQr}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#eab308] transition-all hover:text-[#ca8a04] active:scale-95"
                  >
                    <Download size={14} /> Download PNG
                  </button>
                </div>
              </div>

              {/* Quick Copy Link Box */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Copy Direct Link</label>
                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1.5 pl-3.5 transition-colors focus-within:border-[#eab308]/50 dark:border-zinc-800 dark:bg-zinc-900">
                  <span className="flex-1 truncate font-mono text-xs text-zinc-400 select-all">{shareUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold tracking-tight text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white"
                  >
                    {copied ? (
                      <>
                        <Check size={13} className="stroke-3" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={13} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Social Media Share Platforms */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Share with Social Media</label>
                <div className="grid grid-cols-5 gap-2">
                  {socialShares.map((platform) => (
                    <a
                      key={platform.name}
                      href={platform.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex flex-col items-center justify-center rounded-xl border border-zinc-200/60 bg-zinc-50/50 p-3 transition-all duration-300 dark:border-zinc-800/80 dark:bg-zinc-900/30 ${platform.color} active:scale-95`}
                      title={`Share on ${platform.name}`}
                    >
                      <platform.icon
                        size={20}
                        className={`opacity-80 transition-opacity group-hover:opacity-100 ${platform.textColor} group-hover:text-white`}
                      />
                      <span className="mt-1.5 text-[9px] font-bold text-zinc-500 group-hover:text-white dark:text-zinc-400">
                        {platform.name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Direct Quick Contact Links */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Direct Contact Shortcuts</label>
                <div className="grid grid-cols-3 gap-2">
                  {contactLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-3 text-center text-[11px] font-bold transition-all duration-200 active:scale-95 ${link.color}`}
                    >
                      <link.icon size={13} />
                      <span className="truncate">{link.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
