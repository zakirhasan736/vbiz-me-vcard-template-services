'use client'

/**
 * Shared Public Cards / Global Connections directory.
 * Used by v1, v2, and v3 profile shells — self-contained layout that fits any parent.
 */
import { mapPublicCardProfileUrl } from '@/lib/api/publicCards/mapPublicCards'
import { encodeMediaUrl, isVideoUrl } from '@/lib/mediaUrl'
import { usePublicCardsDirectory } from '@/profile-app/hooks/usePublicCardsDirectory'
import { useProfileDisplay } from '@/profile-app/lib/profileDisplayContext'
import type { PublicCardsFilterOption } from '@interfaces/api/publicCards'
import {
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Loader2,
  MapPin,
  Monitor,
  RotateCcw,
  Search,
  Share2,
  SlidersHorizontal,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

function findOptionName(options: PublicCardsFilterOption[] | undefined, id: number | null): string | null {
  if (id == null) return null
  return options?.find((option) => option.id === id)?.name ?? null
}

type DesktopFilterSelectProps = {
  value: number | null
  onChange: (val: number | null) => void
  options: PublicCardsFilterOption[]
  placeholder: string
  Icon: LucideIcon
  disabled?: boolean
}

function DesktopFilterSelect({ value, onChange, options, placeholder, Icon, disabled }: DesktopFilterSelectProps) {
  return (
    <div className="group relative min-w-[130px] flex-1">
      <div className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-zinc-200 group-hover:text-zinc-200">
        <Icon size={16} />
      </div>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value
          onChange(next ? Number(next) : null)
        }}
        className="h-full w-full cursor-pointer appearance-none rounded-xl border border-zinc-800 bg-zinc-950/60 py-3.5 pr-10 pl-11 text-xs font-semibold text-zinc-100 shadow-sm transition-all hover:border-zinc-700 hover:bg-zinc-900/80 focus:border-[#eab308] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 lg:text-sm"
      >
        <option value="" className="bg-zinc-950 text-zinc-400">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-zinc-950 text-zinc-100">
            {opt.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 transition-colors group-hover:text-zinc-300">
        <ChevronDown size={14} />
      </div>
    </div>
  )
}

export const PublicCardsSection = () => {
  const { homeMedia, isVisible } = useProfileDisplay()
  const {
    cards,
    dropdowns,
    draftFilters,
    hasActiveFilters,
    isLoading,
    isSearching,
    isLoadingMore,
    error,
    hasMore,
    total,
    setDraftFilter,
    applyFilters,
    updateAndApplyFilter,
    clearFilters,
    loadMore,
  } = usePublicCardsDirectory()

  const bannerVideoSrc = useMemo(() => {
    const raw = homeMedia.bgMedia?.trim() ?? ''
    if (!raw || !isVisible('Background Video/Image')) return ''
    const encoded = encodeMediaUrl(raw)
    return isVideoUrl(encoded) ? encoded : ''
  }, [homeMedia.bgMedia, isVisible])

  const [viewMode, setViewMode] = useState<'grid' | 'slider'>('slider')
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const serviceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    return () => {
      if (serviceDebounceRef.current) clearTimeout(serviceDebounceRef.current)
    }
  }, [])

  const handleApplyFilters = useCallback(() => {
    setActiveIndex(0)
    applyFilters()
  }, [applyFilters])

  const handleClearFilters = useCallback(() => {
    setActiveIndex(0)
    clearFilters()
  }, [clearFilters])

  const handleDesktopServiceChange = useCallback(
    (value: string) => {
      setDraftFilter('service', value)
      if (serviceDebounceRef.current) clearTimeout(serviceDebounceRef.current)
      serviceDebounceRef.current = setTimeout(() => {
        updateAndApplyFilter('service', value)
        setActiveIndex(0)
      }, 400)
    },
    [setDraftFilter, updateAndApplyFilter]
  )

  const handleDesktopFilterChange = useCallback(
    <K extends 'stateId' | 'cityId' | 'professionId'>(key: K, value: number | null) => {
      updateAndApplyFilter(key, value)
      setActiveIndex(0)
    },
    [updateAndApplyFilter]
  )

  const selectedStateName = findOptionName(dropdowns.states, draftFilters.stateId)
  const selectedCityName = findOptionName(dropdowns.cities, draftFilters.cityId)
  const selectedProfessionName = findOptionName(dropdowns.professions, draftFilters.professionId)

  const sliderActiveIndex = cards.length === 0 ? 0 : Math.min(activeIndex, cards.length - 1)

  const nextCard = () => {
    if (cards.length <= 1) return
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveIndex((prev) => (prev + 1) % cards.length)
    setTimeout(() => setIsTransitioning(false), 350)
  }

  const prevCard = () => {
    if (cards.length <= 1) return
    if (isTransitioning) return
    setIsTransitioning(true)
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
    setTimeout(() => setIsTransitioning(false), 350)
  }

  const showInitialLoader = isLoading && cards.length === 0
  const showEmptyState = !isLoading && !error && cards.length === 0

  return (
    <div className="vbiz-public-cards-section isolate w-full max-w-full overflow-hidden pb-20">
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Header Card / Cinematic Banner */}
        <div className="bg-ocean-deep group relative flex min-h-[40vh] w-full flex-col overflow-hidden rounded-4xl border border-zinc-800 shadow-xl sm:min-h-[45vh] md:rounded-[2.5rem] lg:col-span-4 lg:min-h-[50vh] dark:border-[#eab308]/20">
          {/* Background Video — only when profile has a background video configured */}
          <div className="absolute inset-0 z-0 h-full w-full">
            {bannerVideoSrc ? (
              <video
                autoPlay
                loop
                muted
                playsInline
                src={bannerVideoSrc}
                className="h-full w-full scale-105 object-cover opacity-40 mix-blend-luminosity transition-transform duration-1000 group-hover:scale-110"
              />
            ) : null}
            <div className="from-ocean-deep via-ocean-deep/85 to-ocean-deep/30 absolute inset-0 bg-linear-to-t" />
            <div className="from-ocean-deep via-ocean-deep/60 absolute inset-0 hidden bg-linear-to-r to-transparent md:block md:w-2/3" />
          </div>

          {/* View Toggle on Banner Top Right */}
          <div className="absolute top-4 right-4 z-20 md:top-8 md:right-8 lg:top-10 lg:right-10">
            <div className="inline-flex items-center rounded-xl border border-zinc-800/80 bg-black/60 p-1 shadow-2xl backdrop-blur-xl">
              <button
                onClick={() => setViewMode('slider')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black transition-all duration-300 md:px-4 md:py-2 md:text-xs ${viewMode === 'slider' ? 'bg-[#eab308] text-black shadow-sm' : 'text-zinc-300 hover:text-white'}`}
              >
                <Monitor size={12} className="md:h-3.5 md:w-3.5" />
                <span>Slider</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-black transition-all duration-300 md:px-4 md:py-2 md:text-xs ${viewMode === 'grid' ? 'bg-[#eab308] text-black shadow-sm' : 'text-zinc-300 hover:text-white'}`}
              >
                <LayoutGrid size={12} className="md:h-3.5 md:w-3.5" />
                <span>Grid</span>
              </button>
            </div>
          </div>

          {/* Content overlay */}
          <div className="relative z-10 flex h-full w-full grow flex-col justify-end p-5 sm:p-8 md:p-10 lg:p-14">
            <div className="mt-auto flex w-full max-w-7xl flex-col items-start justify-between gap-4 md:gap-8">
              <div className="flex max-w-2xl flex-col gap-2 md:gap-4">
                <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-[#eab308]/30 bg-[#eab308]/15 px-3 py-1 text-[9px] font-bold tracking-wider text-[#eab308] uppercase shadow-md backdrop-blur-md md:text-xs">
                  <Users size={12} className="text-[#eab308]" /> Global Connections Directory
                </div>

                <h2 className="text-2xl leading-[1.1] font-black tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                  Global{' '}
                  <span className="bg-linear-to-r from-[#eab308] to-yellow-500 bg-clip-text text-transparent italic">
                    Connections
                  </span>
                </h2>
                <p className="hidden text-[11px] leading-relaxed font-medium text-zinc-300 sm:block sm:text-xs md:text-lg">
                  Discover and connect with top-tier verified professionals across the United States. Filter instantly
                  by state, city, and industry sector to find valuable prospects.
                </p>
                {total > 0 ? (
                  <p className="mt-1 text-[10px] font-semibold text-zinc-400 sm:text-xs">
                    {total.toLocaleString()} public {total === 1 ? 'profile' : 'profiles'} found
                  </p>
                ) : null}
              </div>

              {/* Desktop Filter Bar (md and larger) */}
              <div className="mt-4 hidden w-full items-center gap-3 border-t border-zinc-800/80 pt-6 md:flex">
                <DesktopFilterSelect
                  value={draftFilters.stateId}
                  onChange={(value) => handleDesktopFilterChange('stateId', value)}
                  options={dropdowns.states ?? []}
                  placeholder="All States"
                  Icon={MapPin}
                />
                <DesktopFilterSelect
                  value={draftFilters.cityId}
                  onChange={(value) => handleDesktopFilterChange('cityId', value)}
                  options={dropdowns.cities ?? []}
                  placeholder="All Cities"
                  Icon={MapPin}
                  disabled={!draftFilters.stateId}
                />
                <DesktopFilterSelect
                  value={draftFilters.professionId}
                  onChange={(value) => handleDesktopFilterChange('professionId', value)}
                  options={dropdowns.professions ?? []}
                  placeholder="All Professions"
                  Icon={Briefcase}
                />

                <div className="group relative w-full min-w-[180px] flex-[1.5]">
                  <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-300">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    value={draftFilters.service}
                    onChange={(e) => handleDesktopServiceChange(e.target.value)}
                    placeholder="Search directory..."
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 py-3.5 pr-4 pl-11 text-xs font-medium text-zinc-100 shadow-sm transition-all placeholder:text-zinc-500 hover:border-zinc-700 hover:bg-zinc-900/80 focus:border-[#eab308] focus:outline-none lg:text-sm"
                  />
                </div>

                {(hasActiveFilters || isSearching) && (
                  <button
                    onClick={handleClearFilters}
                    disabled={isSearching}
                    className="hover:bg-zinc-850 flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 text-xs font-bold text-zinc-300 transition-all hover:border-zinc-700 hover:text-white active:scale-95 disabled:opacity-50"
                    title="Reset All Filters"
                  >
                    {isSearching ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />}
                  </button>
                )}
              </div>

              {/* Mobile Search & Filter trigger (md:hidden) */}
              <div className="mt-2 flex w-full gap-2 border-t border-zinc-800/50 pt-4 md:hidden">
                <button
                  onClick={() => setIsFilterOpen(true)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-extrabold text-white shadow-md backdrop-blur-md transition-all active:scale-95"
                >
                  <SlidersHorizontal size={14} className="text-[#eab308]" />
                  <span>Search & Filter Directory</span>
                  {hasActiveFilters && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#eab308]" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Active Filters Bar (if filtered but popup is closed) */}
      {isMobile && hasActiveFilters && (
        <div className="mt-2 flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-900 bg-zinc-950/40 p-3 md:hidden">
          <div className="flex max-w-[80%] flex-wrap gap-1.5">
            {selectedStateName && (
              <span className="rounded-md border border-[#eab308]/20 bg-[#eab308]/10 px-2 py-0.5 text-[10px] text-[#eab308]">
                {selectedStateName}
              </span>
            )}
            {selectedCityName && (
              <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300">
                {selectedCityName}
              </span>
            )}
            {selectedProfessionName && (
              <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300">
                {selectedProfessionName}
              </span>
            )}
            {draftFilters.service.trim() !== '' && (
              <span className="max-w-[100px] truncate rounded-md border border-zinc-800 bg-zinc-900 px-2 py-0.5 text-[10px] text-zinc-300">
                &ldquo;{draftFilters.service}&rdquo;
              </span>
            )}
          </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-white active:scale-95"
          >
            <RotateCcw size={10} /> Reset
          </button>
        </div>
      )}

      {/* Mobile Filter Overlay Modal - Ultra Cinematic Sliding Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center p-0">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Dialog container - Beautiful modern bottom drawer with responsive height */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative z-10 flex max-h-[85vh] w-full flex-col gap-4 overflow-hidden rounded-t-[2.5rem] border-t border-zinc-800 bg-zinc-950 p-6 shadow-2xl"
            >
              {/* Drag indicator bar */}
              <div className="mx-auto -mt-2 mb-2 h-1 w-12 shrink-0 rounded-full bg-zinc-800" />

              {/* Top bar */}
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-900 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-[#eab308]" />
                  <h3 className="text-base font-black text-white">Filter Connections</h3>
                </div>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400 transition-all hover:text-white active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Scrollable Filter Chips Area */}
              <div className="flex-1 space-y-5 overflow-y-auto py-2 pr-1 select-none">
                {/* Keyword Search */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Keyword Search
                  </label>
                  <div className="group relative w-full">
                    <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-300">
                      <Search size={15} />
                    </div>
                    <input
                      type="text"
                      value={draftFilters.service}
                      onChange={(e) => setDraftFilter('service', e.target.value)}
                      placeholder="Search name, job profession..."
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 py-3 pr-4 pl-11 text-xs font-semibold text-zinc-100 shadow-sm transition-all placeholder:text-zinc-500 focus:border-[#eab308] focus:outline-none"
                    />
                  </div>
                </div>

                {/* State Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Filter by State
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setDraftFilter('stateId', null)}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        draftFilters.stateId == null
                          ? 'border-[#eab308] bg-[#eab308]/15 font-black text-[#eab308]'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      All States
                    </button>
                    {(dropdowns.states ?? []).map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setDraftFilter('stateId', st.id)}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                          draftFilters.stateId === st.id
                            ? 'border-[#eab308] bg-[#eab308]/15 font-black text-[#eab308]'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Filter by City
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setDraftFilter('cityId', null)}
                      disabled={!draftFilters.stateId}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 ${
                        draftFilters.cityId == null
                          ? 'border-[#eab308] bg-[#eab308]/15 font-black text-[#eab308]'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      All Cities
                    </button>
                    {(dropdowns.cities ?? []).map((ct) => (
                      <button
                        key={ct.id}
                        onClick={() => setDraftFilter('cityId', ct.id)}
                        disabled={!draftFilters.stateId}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-40 ${
                          draftFilters.cityId === ct.id
                            ? 'border-[#eab308] bg-[#eab308]/15 font-black text-[#eab308]'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {ct.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profession Select */}
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                    Filter by Profession
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setDraftFilter('professionId', null)}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                        draftFilters.professionId == null
                          ? 'border-[#eab308] bg-[#eab308]/15 font-black text-[#eab308]'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      All Professions
                    </button>
                    {(dropdowns.professions ?? []).map((pr) => (
                      <button
                        key={pr.id}
                        onClick={() => setDraftFilter('professionId', pr.id)}
                        className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                          draftFilters.professionId === pr.id
                            ? 'border-[#eab308] bg-[#eab308]/15 font-black text-[#eab308]'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {pr.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom action bar */}
              <div className="flex shrink-0 gap-2 border-t border-zinc-900 pt-3">
                <button
                  onClick={handleClearFilters}
                  className="hover:bg-zinc-850 flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 py-3.5 text-xs font-bold text-zinc-300 transition-all active:scale-95"
                >
                  <RotateCcw size={13} /> Reset
                </button>
                <button
                  onClick={() => {
                    handleApplyFilters()
                    setIsFilterOpen(false)
                  }}
                  disabled={isSearching}
                  className="flex flex-2 items-center justify-center gap-1.5 rounded-xl bg-[#eab308] py-3.5 text-xs font-black text-zinc-950 shadow-lg shadow-yellow-500/10 transition-all hover:bg-yellow-500 active:scale-95 disabled:opacity-60"
                >
                  {isSearching ? <Loader2 size={13} className="animate-spin" /> : `Apply (${cards.length} Cards)`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {error ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-6 flex w-full flex-col items-center justify-center rounded-4xl border border-red-900/40 bg-red-950/20 px-4 py-16 text-center"
        >
          <h3 className="text-lg font-bold text-white">Unable to Load Connections</h3>
          <p className="mt-1.5 max-w-sm text-xs text-red-300/80">
            Public profiles could not be loaded right now. Please try again in a moment.
          </p>
        </motion.div>
      ) : showInitialLoader ? (
        <div className="relative z-20 mt-8 flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-[#eab308]" />
        </div>
      ) : showEmptyState ? (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mt-6 flex w-full flex-col items-center justify-center rounded-4xl border border-zinc-900 bg-zinc-950/20 px-4 py-20 text-center"
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-[#eab308]">
            <Users size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">No Connections Match Your Filters</h3>
          <p className="mt-1.5 max-w-sm text-xs text-zinc-400">
            {hasActiveFilters
              ? 'Try resetting your selected search keyword, city, state, or profession filters to browse other top members.'
              : 'No public profiles are available right now.'}
          </p>
          {hasActiveFilters ? (
            <button
              onClick={handleClearFilters}
              className="mt-6 flex items-center gap-1.5 rounded-xl bg-[#eab308] px-5 py-2.5 text-xs font-bold text-zinc-950 transition-all hover:bg-yellow-500 active:scale-95"
            >
              <RotateCcw size={12} /> Clear Filter Settings
            </button>
          ) : null}
        </motion.div>
      ) : viewMode === 'grid' ? (
        /* Grid of Connections */
        <div className="relative z-20 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards.map((card, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: (idx % 8) * 0.08, ease: 'easeOut' }}
              key={card.id}
              className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl border border-white/5 bg-zinc-950/30 shadow-sm backdrop-blur-3xl transition-colors duration-300 hover:bg-zinc-950/40"
            >
              <div className="relative h-56 overflow-hidden bg-zinc-950">
                <div className="absolute inset-0 z-10 bg-linear-to-t from-zinc-900 to-transparent" />
                <Image
                  src={card.img}
                  alt={card.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-80 grayscale-20 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>

              <div className="relative z-20 -mt-6 flex flex-1 flex-col p-6">
                <div className="flex flex-col items-center text-center">
                  <h3 className="mb-1 w-full truncate text-lg leading-tight font-bold text-zinc-100 transition-colors group-hover:text-white">
                    {card.name}
                  </h3>
                  <div className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-zinc-800/80 bg-zinc-950/50 px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#eab308] uppercase">
                    <Briefcase size={10} /> {card.profession}
                  </div>
                </div>

                <div className="mt-8 flex w-full items-center justify-center gap-2">
                  <Link
                    href={mapPublicCardProfileUrl(card.slug)}
                    className="bg-zinc-850 border-zinc-850 flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border text-xs font-bold text-zinc-100 shadow-sm transition-colors duration-300 group-hover:bg-zinc-100 group-hover:text-zinc-950"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={mapPublicCardProfileUrl(card.slug)}
                    className="bg-zinc-850 border-zinc-850 flex h-10 w-10 items-center justify-center rounded-xl border text-zinc-300 transition-colors hover:bg-zinc-800"
                    title="Share Profile"
                  >
                    <Share2 size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        /* Cinematic Unified 3D Slider Area with swipe & drag on both mobile and desktop! */
        <div className="relative z-20 mt-6 flex min-h-[380px] flex-1 flex-col items-center justify-center perspective-[1600px] md:min-h-[460px]">
          {/* Navigation arrows (desktop floating layout, hidden on mobile for cleaner look) */}
          <div className="pointer-events-none absolute top-1/2 z-40 hidden w-full max-w-[1080px] -translate-y-1/2 justify-between px-2 md:flex">
            <button
              onClick={prevCard}
              disabled={cards.length <= 1}
              className="group pointer-events-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-lg backdrop-blur-md transition-all hover:bg-[#eab308] hover:text-zinc-950 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={20} className="transition-transform group-hover:-translate-x-0.5" />
            </button>
            <button
              onClick={nextCard}
              disabled={cards.length <= 1}
              className="group pointer-events-auto flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-lg backdrop-blur-md transition-all hover:bg-[#eab308] hover:text-zinc-950 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={20} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>

          {/* Swipeable Draggable 3D Card Stack Container */}
          <motion.div
            drag={cards.length > 1 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(e, info) => {
              const threshold = 55
              if (info.offset.x < -threshold) {
                nextCard()
              } else if (info.offset.x > threshold) {
                prevCard()
              }
            }}
            className="transform-style-3d relative flex w-full max-w-[1000px] cursor-grab items-center justify-center select-none active:cursor-grabbing"
            style={{ height: isMobile ? '330px' : '430px' }}
          >
            <AnimatePresence initial={false}>
              {cards.map((card, idx) => {
                const offset = idx - sliderActiveIndex
                const absOffset = Math.abs(offset)
                const direction = Math.sign(offset)

                // Only show nearest cards to look pristine and fit perfectly
                if (absOffset > 2) return null

                // Calculate scales and translations for mobile and desktop
                const cardWidth = isMobile ? 220 : 300
                const cardHeight = isMobile ? 320 : 420

                // Dynamic lateral spacing (xTranslate)
                const xTranslate =
                  offset === 0 ? 0 : direction * (absOffset * (isMobile ? 55 : 130) + (isMobile ? 30 : 80))

                // Dynamic depth layer (zTranslate)
                const zTranslate = offset === 0 ? (isMobile ? 40 : 80) : -absOffset * (isMobile ? 55 : 110)

                // Smooth perspective rotation
                const yRotate = offset === 0 ? 0 : direction * (isMobile ? -14 : -22)

                // Scale cards cleanly
                const scale =
                  absOffset === 0 ? 1 : Math.max(isMobile ? 0.8 : 0.75, 1 - absOffset * (isMobile ? 0.08 : 0.12))

                const zIndex = 50 - absOffset
                const opacity = absOffset === 2 ? 0.6 : 1

                return (
                  <motion.div
                    key={card.id}
                    onMouseMove={(e) => {
                      if (isMobile) return
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left
                      const y = e.clientY - rect.top
                      e.currentTarget.style.setProperty('--mouse-x', `${(x / rect.width - 0.5) * -12}px`)
                      e.currentTarget.style.setProperty('--mouse-y', `${(y / rect.height - 0.5) * -12}px`)
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.setProperty('--mouse-x', '0px')
                      e.currentTarget.style.setProperty('--mouse-y', '0px')
                    }}
                    initial={false}
                    animate={{
                      x: xTranslate,
                      z: zTranslate,
                      rotateY: yRotate,
                      scale: scale,
                      zIndex: zIndex,
                      opacity: opacity,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 24,
                      stiffness: 160,
                    }}
                    onClick={() => {
                      if (absOffset !== 0) {
                        setActiveIndex(idx)
                      }
                    }}
                    className="transform-style-3d group/card absolute cursor-pointer overflow-hidden rounded-4xl border border-zinc-800/80 bg-zinc-900 shadow-2xl transition-colors duration-300"
                    style={{
                      width: `${cardWidth}px`,
                      height: `${cardHeight}px`,
                    }}
                  >
                    {/* Loading overlay */}
                    <AnimatePresence>
                      {isTransitioning && absOffset === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center bg-zinc-950/45 backdrop-blur-[2px]"
                        >
                          <Loader2 size={isMobile ? 24 : 32} className="animate-spin text-[#eab308]" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Background Dimmer for unfocused cards */}
                    <motion.div
                      animate={{ backgroundColor: absOffset === 0 ? 'rgba(24,24,27,0)' : 'rgba(24,24,27,0.72)' }}
                      className="pointer-events-none absolute inset-0 z-20 transition-colors duration-500"
                    />

                    {/* Connection Photo */}
                    <div
                      className="relative w-full overflow-hidden bg-zinc-950"
                      style={{ height: isMobile ? '190px' : '260px' }}
                    >
                      <div className="absolute inset-0 z-10 bg-linear-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

                      <motion.div
                        className="absolute inset-0 h-full w-full overflow-hidden"
                        animate={{ scale: absOffset === 0 ? 1 : 1.05 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div
                          className="absolute top-[-5%] left-[-5%] h-[110%] w-[110%] translate-x-(--mouse-x,0px) translate-y-(--mouse-y,0px) bg-cover bg-center grayscale-15 transition-transform duration-300 ease-out group-hover/card:scale-105"
                          style={{ backgroundImage: `url(${card.img})` }}
                        />
                      </motion.div>
                    </div>

                    {/* Connection Text Details */}
                    <div
                      className="relative z-20 -mt-2 flex flex-col items-center justify-between border-t border-zinc-800/60 bg-zinc-900 p-4 md:p-6"
                      style={{ height: isMobile ? '130px' : '160px' }}
                    >
                      <div className="w-full text-center">
                        <h4
                          className="w-full truncate px-1 text-sm font-extrabold text-zinc-100 md:text-xl"
                          title={card.name}
                        >
                          {card.name}
                        </h4>
                        <p
                          className="mt-1 w-full truncate px-1 text-[9px] font-black tracking-wider text-[#eab308] uppercase md:text-xs"
                          title={card.profession}
                        >
                          {card.profession}
                        </p>
                      </div>

                      <Link
                        href={mapPublicCardProfileUrl(card.slug)}
                        className="mt-2 flex w-full items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-800 py-2 text-[10px] font-black text-zinc-100 shadow-sm transition-all group-hover/card:bg-zinc-100 group-hover/card:text-zinc-950 hover:bg-zinc-700 active:scale-95 md:py-3.5 md:text-xs"
                      >
                        View Profile
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>

          {/* Uniform Bottom Slider Controller (dots & responsive buttons) */}
          <div className="mt-6 flex w-full max-w-[420px] shrink-0 items-center justify-between px-4 select-none">
            {/* Prev Button */}
            <button
              onClick={prevCard}
              disabled={cards.length <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:text-white active:scale-90 disabled:cursor-not-allowed disabled:opacity-20"
            >
              <ChevronLeft size={18} />
            </button>

            {/* Centered Dots Indicator */}
            <div className="no-scrollbar flex max-w-[60%] items-center gap-1.5 overflow-x-auto scroll-smooth py-1.5">
              {cards.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!isTransitioning) {
                      setIsTransitioning(true)
                      setActiveIndex(idx)
                      setTimeout(() => setIsTransitioning(false), 350)
                    }
                  }}
                  className={`h-1.5 shrink-0 rounded-full transition-all duration-300 ${idx === sliderActiveIndex ? 'w-5 bg-[#eab308]' : 'w-1.5 bg-zinc-700 hover:bg-zinc-600'}`}
                  title={`Navigate to connection ${idx + 1}`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={nextCard}
              disabled={cards.length <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-all hover:bg-white/10 hover:text-white active:scale-90 disabled:cursor-not-allowed disabled:opacity-20"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && cards.length > 0 ? (
        <div className="relative z-20 mt-10 flex w-full justify-center border-t border-zinc-800/50 pt-8 pb-8 md:mt-16">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="group flex min-w-[160px] items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/50 px-6 py-3.5 text-sm font-bold text-zinc-100 shadow-sm backdrop-blur-md transition-all hover:bg-zinc-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingMore ? <Loader2 size={16} className="animate-spin" /> : 'Load More Connections'}
          </button>
        </div>
      ) : null}

      {/* Custom CSS for 3D Perspective & Hidden Scrollbars */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
              .perspective-[1600px] {
                 perspective: 1600px;
                 transform-style: preserve-3d;
              }
              .transform-style-3d {
                 transform-style: preserve-3d;
              }
              .no-scrollbar::-webkit-scrollbar {
                 display: none;
              }
              .no-scrollbar {
                 -ms-overflow-style: none;
                 scrollbar-width: none;
              }
            `,
        }}
      />
    </div>
  )
}
