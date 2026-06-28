'use client'

import { CheckCircle2, Download, Share2 } from 'lucide-react'
import React from 'react'

interface ProfileHeaderProps {
  setActiveModal: (modal: any) => void
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ setActiveModal }) => {
  return (
    <header className="relative mb-10 flex flex-col items-center text-center">
      <div className="group relative mb-6">
        <div className="relative z-10 h-32 w-32 overflow-hidden rounded-3xl border border-zinc-700 bg-zinc-900 transition-transform duration-500 group-hover:scale-[1.02]">
          <video
            src="https://app.vbizme.com/storage/ecard/profileimages/91/mc%20vbizme.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full scale-105 object-cover"
          />
        </div>
        <div className="absolute -right-2 -bottom-2 z-20 rounded-full bg-yellow-400 p-2 text-zinc-950 shadow-lg">
          <CheckCircle2 size={16} />
        </div>
      </div>

      <h1 className="notranslate mb-2 text-4xl font-bold tracking-tight text-zinc-100">Michaelangelo C.</h1>
      <p className="mb-6 max-w-sm text-sm font-medium text-zinc-400">
        Visionary founder and growth strategist scaling vBiz ecosystem globally.
      </p>

      <div className="flex w-full max-w-sm items-center justify-center gap-2">
        <button
          onClick={() => setActiveModal('contact')}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-4 text-sm font-bold text-zinc-950 shadow-lg shadow-yellow-400/20 transition-all hover:bg-yellow-500 active:scale-95"
        >
          <Download size={18} /> Save Contact
        </button>
        <button
          onClick={() => setActiveModal('share')}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-700 bg-zinc-800 text-zinc-300 transition-all hover:bg-zinc-700 active:scale-95"
        >
          <Share2 size={20} />
        </button>
      </div>
    </header>
  )
}
