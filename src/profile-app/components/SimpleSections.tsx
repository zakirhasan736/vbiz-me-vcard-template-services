import { ArrowUpRight, BookOpen, Calendar } from 'lucide-react'

export { MissionSection } from '@/profile-app/components/MissionSection'

export const BlogSection = () => (
  <div className="vbiz-bento-grid grid w-full grid-cols-1 gap-4 pb-20 md:grid-cols-3 lg:grid-cols-4">
    {/* Featured Article - Takes up 3 cols */}
    <div className="group relative flex min-h-100 cursor-pointer flex-col justify-end overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 md:col-span-3 lg:col-span-3 dark:border-zinc-800/80 dark:bg-zinc-900">
      {/* Background Image */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555529733-0e67056058e1?q=80&w=1200&fit=crop')] bg-cover bg-center opacity-30 mix-blend-multiply grayscale transition-transform duration-1000 group-hover:scale-105 dark:opacity-40 dark:mix-blend-overlay" />

      <div className="absolute inset-0 bg-linear-to-t from-zinc-50 via-zinc-100/90 to-transparent dark:from-zinc-950 dark:via-zinc-900/80" />

      <div className="relative z-10 w-full p-8 lg:p-10">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <span className="rounded-md bg-zinc-900 px-3 py-1.5 text-[.625rem] font-bold tracking-wider text-white uppercase sm:text-xs dark:bg-zinc-100 dark:text-zinc-950">
            Latest Article
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-zinc-600 sm:text-sm dark:text-zinc-400">
            <Calendar size={14} /> Sep 22, 2026
          </span>
          <span className="hidden text-zinc-400 sm:block dark:text-zinc-600">•</span>
          <span className="text-xs font-medium text-zinc-600 sm:text-sm dark:text-zinc-400">5 min read</span>
        </div>

        <h2 className="mb-6 max-w-2xl text-3xl leading-[1.1] font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-black sm:text-4xl lg:text-5xl dark:text-zinc-100 dark:group-hover:text-white">
          Impressions That Last —<br className="hidden lg:block" />
          <span className="text-yellow-primary font-medium italic">Connections That Matter.</span>
        </h2>

        <p className="mb-8 max-w-xl text-base leading-relaxed font-medium text-zinc-600 lg:text-lg dark:text-zinc-400">
          Explore actionable insights into building a magnetic digital presence. Learn how to maximize first impressions
          and turn passive networking into active, thriving business relationships.
        </p>

        <div className="mt-auto flex w-full items-center justify-between border-t border-zinc-200 pt-6 md:max-w-xl dark:border-zinc-800/80">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
              <span className="font-serif text-lg font-bold text-zinc-900 dark:text-zinc-100">V</span>
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Editorial Team</div>
              <div className="text-yellow-primary mt-0.5 text-[.625rem] font-bold tracking-wider uppercase">
                vBiz Me insights
              </div>
            </div>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 dark:bg-zinc-100 dark:text-zinc-950">
            <ArrowUpRight
              size={20}
              strokeWidth={2.5}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Small Sidebar Card */}
    <div className="group relative flex min-h-75 flex-col items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-white/50 p-6 backdrop-blur-xl transition-all duration-500 hover:border-zinc-300 md:col-span-3 lg:col-span-1 lg:p-8 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-zinc-700">
      <div className="group-hover:text-yellow-primary mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-100 text-center text-zinc-900 shadow-sm backdrop-blur-md transition-all duration-500 group-hover:-translate-y-1 dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-100">
        <BookOpen size={24} />
      </div>

      <h3 className="mb-2 text-center text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        Stay Updated
      </h3>
      <p className="mb-6 max-w-50 text-center text-sm leading-relaxed font-medium text-zinc-600 dark:text-zinc-400">
        Get the latest strategies delivered straight to your inbox.
      </p>

      <button className="flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 py-3.5 text-sm font-bold text-zinc-900 transition-colors hover:bg-zinc-200 active:scale-95 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700">
        Subscribe
      </button>
    </div>
  </div>
)
