import Link from "next/link";

const disclaimer = "xMetrics — prototype. Not a validated assessment instrument.";

export default function CoverPage() {
  return (
    <main className="flex min-h-screen flex-col px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center py-12 text-center">
        <h1 className="font-display text-6xl leading-none text-cream-50 sm:text-7xl lg:text-8xl">xMetrics</h1>
        <p className="mt-4 text-sm tracking-[0.18em] text-gold-400 sm:text-base">psychometrics, multiplied.</p>

        <div className="mt-14 grid w-full gap-5 text-left sm:grid-cols-2">
          <Link
            href="/build"
            className="group rounded-2xl border border-gold-500/70 bg-navy-900 p-7 transition hover:-translate-y-1 hover:border-gold-400 hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transform-none sm:p-9"
          >
            <span className="font-display text-3xl text-cream-50">Demo</span>
            <span className="mt-3 block max-w-sm text-sm leading-6 text-cream-300">
              Build a team, run a pressure scenario, read the debrief.
            </span>
            <span className="mt-8 block text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">Enter demo →</span>
          </Link>

          <Link
            href="/customise"
            className="group rounded-2xl border border-navy-700 bg-navy-900/45 p-7 transition hover:-translate-y-1 hover:border-gold-500/35 hover:bg-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transform-none sm:p-9"
          >
            <span className="font-display text-3xl text-cream-100">Customise</span>
            <span className="mt-3 block max-w-sm text-sm leading-6 text-cream-300">
              How custom scenarios would be authored.
            </span>
            <span className="mt-8 block text-xs font-semibold uppercase tracking-[0.2em] text-cream-300">View concept →</span>
          </Link>
        </div>
      </div>

      <p className="shrink-0 text-center text-[11px] text-cream-300/70">{disclaimer}</p>
    </main>
  );
}
