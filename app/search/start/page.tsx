import Link from "next/link";

export default function SearchStartPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden px-5 py-8 sm:px-8">
      <header className="mx-auto flex w-full max-w-5xl shrink-0 items-start justify-between gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">
            Candidate research
          </p>
          <h1 className="mt-2 font-display text-3xl text-cream-50 sm:text-4xl">
            Board and executive search
          </h1>
          <p className="mt-2 text-sm text-cream-300">
            Choose how you want to build your long list.
          </p>
        </div>
        <Link href="/" className="shrink-0 text-xs text-cream-300 hover:text-cream-50">
          Back to xMetrics
        </Link>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 items-center">
        <div className="grid w-full gap-5 text-left sm:grid-cols-2">
          <Link
            href="/search/pool?mode=agentic"
            className="group rounded-2xl border border-gold-500/70 bg-navy-900 p-7 transition hover:-translate-y-1 hover:border-gold-400 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transform-none sm:p-9"
          >
            <span className="font-display text-3xl text-cream-50">Agentic Research</span>
            <span className="mt-3 block max-w-sm text-sm leading-6 text-cream-300">
              Brief the agent and watch it build your long list.
            </span>
            <span className="mt-8 block text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Go agentic →
            </span>
          </Link>

          <Link
            href="/search/pool"
            className="group rounded-2xl border border-navy-700 bg-navy-900/45 p-7 transition hover:-translate-y-1 hover:border-gold-500/35 hover:bg-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transform-none sm:p-9"
          >
            <span className="font-display text-3xl text-cream-100">Manual Research</span>
            <span className="mt-3 block max-w-sm text-sm leading-6 text-cream-300">
              Browse the pool and pick your long list yourself — with the agent on tap if you want it.
            </span>
            <span className="mt-8 block text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              Go manual →
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
