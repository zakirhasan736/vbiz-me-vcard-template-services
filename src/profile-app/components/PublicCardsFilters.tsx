'use client'

import type { PublicCardsFilterState } from '@/lib/publicCards/publicCardsSearch'
import type { PublicCardsDropdowns, PublicCardsFilterOption } from '@interfaces/api/publicCards'
import type { LucideIcon } from 'lucide-react'
import { Briefcase, ChevronDown, MapPin, Search, X } from 'lucide-react'
import type { FormEvent } from 'react'

type FilterSelectProps = {
  placeholder: string
  Icon: LucideIcon
  tooltip: string
  options: PublicCardsFilterOption[]
  value: number | null
  onChange: (value: number | null) => void
  disabled?: boolean
}

function FilterSelect({ placeholder, Icon, tooltip, options, value, onChange, disabled }: FilterSelectProps) {
  return (
    <div className="group relative flex-1 md:min-w-[140px]" title={tooltip}>
      <div className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-300 group-hover:text-zinc-300">
        <Icon size={16} />
      </div>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(event) => {
          const next = event.target.value
          onChange(next ? Number(next) : null)
        }}
        className="h-full w-full cursor-pointer appearance-none rounded-xl border border-zinc-800/80 bg-zinc-950/50 py-3 pr-10 pl-11 text-xs font-medium text-zinc-100 shadow-sm transition-all outline-none hover:border-zinc-700/80 hover:bg-zinc-800/50 focus:border-zinc-700 focus:bg-zinc-800/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 lg:text-sm"
      >
        <option value="" className="bg-zinc-900 text-zinc-500">
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id} className="bg-zinc-900 text-zinc-100">
            {option.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500 transition-colors group-hover:text-zinc-300">
        <ChevronDown size={14} />
      </div>
    </div>
  )
}

type PublicCardsFiltersProps = {
  draftFilters: PublicCardsFilterState
  dropdowns: PublicCardsDropdowns
  hasActiveFilters: boolean
  isSearching: boolean
  onFilterChange: <K extends keyof PublicCardsFilterState>(key: K, value: PublicCardsFilterState[K]) => void
  onSearch: () => void
  onClear: () => void
}

export function PublicCardsFilters({
  draftFilters,
  dropdowns,
  hasActiveFilters,
  isSearching,
  onFilterChange,
  onSearch,
  onClear,
}: PublicCardsFiltersProps) {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSearch()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 flex w-full flex-col gap-3 border-t border-zinc-800/80 pt-6 md:flex-row"
    >
      <FilterSelect
        placeholder="State"
        Icon={MapPin}
        tooltip="Filter by US State"
        options={dropdowns.states ?? []}
        value={draftFilters.stateId}
        onChange={(value) => onFilterChange('stateId', value)}
      />
      <FilterSelect
        placeholder="City"
        Icon={MapPin}
        tooltip="Filter by City Region"
        options={dropdowns.cities ?? []}
        value={draftFilters.cityId}
        disabled={!draftFilters.stateId}
        onChange={(value) => onFilterChange('cityId', value)}
      />
      <FilterSelect
        placeholder="Profession"
        Icon={Briefcase}
        tooltip="Find specific expertise"
        options={dropdowns.professions ?? []}
        value={draftFilters.professionId}
        onChange={(value) => onFilterChange('professionId', value)}
      />

      <div className="group relative w-full min-w-[200px] flex-[1.5]">
        <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2 text-zinc-500 transition-colors group-focus-within:text-zinc-300">
          <Search size={16} />
        </div>
        <input
          type="text"
          value={draftFilters.service}
          placeholder="Search by service..."
          onChange={(event) => onFilterChange('service', event.target.value)}
          className="h-full w-full rounded-xl border border-zinc-800/80 bg-zinc-950/50 py-3 pr-4 pl-11 text-xs font-medium text-zinc-100 shadow-sm transition-all placeholder:text-zinc-500 hover:border-zinc-700/80 hover:bg-zinc-800/50 focus:border-zinc-700 focus:bg-zinc-800/50 focus:outline-none lg:text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSearching}
        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-6 py-3 text-xs font-bold text-zinc-950 shadow-sm transition-all hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 lg:text-sm"
      >
        {isSearching ? 'Searching...' : 'Search'}
      </button>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onClear}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-950/50 px-4 py-3 text-xs font-bold text-zinc-300 transition-all hover:bg-zinc-800/50 lg:text-sm"
        >
          <X size={14} />
          Clear
        </button>
      ) : null}
    </form>
  )
}
