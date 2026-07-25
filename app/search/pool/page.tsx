"use client";

import Link from "next/link";
import { POOL } from "@/lib/pool.config";

function initials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function CandidatePoolPage() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-[1680px] flex-col overflow-hidden">
      <header className="shrink-0 border-b border-navy-700/70 px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Candidate pool</p>
            <div className="mt-2 flex items-baseline gap-3">
              <h1 className="font-display text-2xl text-cream-50 sm:text-3xl">Board and executive search</h1>
              <span data-testid="pool-count" className="text-sm text-cream-300">{POOL.length}</span>
            </div>
          </div>
          <Link href="/" className="shrink-0 text-xs text-cream-300 hover:text-cream-50">
            Back to xMetrics
          </Link>
        </div>
      </header>

      <div
        aria-label="Reserved for filters and smart search"
        className="mx-5 my-3 flex h-10 shrink-0 items-center rounded-lg border border-dashed border-navy-700 px-4 text-[10px] uppercase tracking-[0.16em] text-cream-300/50 sm:mx-8 lg:mx-10"
      >
        Filters and smart search — next step
      </div>

      <section
        aria-label="Candidates"
        className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 sm:px-8 lg:px-10"
      >
        <div className="grid grid-cols-[repeat(auto-fit,minmax(135px,1fr))] gap-2">
          {POOL.map((candidate) => (
            <article
              data-testid="pool-candidate-card"
              key={candidate.id}
              className="flex min-w-0 items-center gap-2.5 rounded-lg border border-navy-700 bg-navy-900 px-3 py-2.5 transition hover:-translate-y-0.5 hover:border-gold-500/70 motion-reduce:transform-none"
            >
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-gold-500 bg-navy-900 font-display text-xs text-cream-50"
              >
                {initials(candidate.displayName)}
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-display text-sm leading-5 text-cream-50" title={candidate.displayName}>
                  {candidate.displayName}
                </h2>
                <p className="truncate text-[8px] font-semibold uppercase leading-3 tracking-[0.12em] text-gold-400" title={candidate.role}>
                  {candidate.role}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
