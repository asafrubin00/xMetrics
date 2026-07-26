"use client";

import type { PoolCandidate } from "@/lib/pool.config";

export function LongListPanel({
  candidates,
  onClose,
  onOpenProfile,
  onRemove,
}: {
  candidates: PoolCandidate[];
  onClose: () => void;
  onOpenProfile: (candidateId: string) => void;
  onRemove: (candidateId: string) => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Current long list"
      className="flex min-h-0 w-2/5 shrink-0 overflow-hidden"
    >
      <section className="flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-gold-500/35 bg-navy-900">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-navy-700 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
              Candidate pool
            </p>
            <h2 className="mt-1 font-display text-2xl text-cream-50">Current long list</h2>
          </div>
          <button
            type="button"
            aria-label="Close current long list"
            onClick={onClose}
            className="text-sm text-cream-300 hover:text-cream-50"
          >
            <span aria-hidden="true">[×]</span> close
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 p-5 sm:p-6">
          <section className="flex min-h-0 flex-1 flex-col">
            <div className="mb-2 flex shrink-0 items-center justify-between">
              <h3 className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cream-300">
                Selected candidates
              </h3>
              <span className="text-xs text-gold-400">{candidates.length}</span>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-navy-700 bg-navy-950/45">
              {candidates.length > 0 ? (
                <ul className="divide-y divide-navy-700/70">
                  {candidates.map((candidate) => (
                    <li key={candidate.id} className="flex items-center gap-3 px-4 py-3">
                      <button
                        type="button"
                        aria-label={`Open profile for ${candidate.displayName}`}
                        onClick={() => onOpenProfile(candidate.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <span className="block font-display text-base text-cream-50 hover:text-gold-400">
                          {candidate.displayName}
                        </span>
                        <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.1em] text-gold-400">
                          {candidate.role}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${candidate.displayName} from long list`}
                        onClick={() => onRemove(candidate.id)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-navy-700 text-base text-cream-300 hover:border-gold-500 hover:text-cream-50"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex h-full min-h-24 items-center justify-center px-4 text-center text-xs text-cream-300">
                  No candidates yet — add people with ＋
                </p>
              )}
            </div>
          </section>

          <section className="shrink-0 rounded-xl border border-dashed border-navy-700 bg-navy-950/30 p-5">
            <h3 className="font-display text-lg text-cream-50">Long list dynamics</h3>
            <p className="mt-1 text-xs text-cream-300">Team dynamics will preview here</p>
          </section>
        </div>

        <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-navy-700 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gold-500/50 px-4 py-2 text-xs text-cream-100 hover:border-gold-400"
          >
            Save &amp; close
          </button>
          <button
            type="button"
            disabled
            title="Available in the next step"
            className="cursor-not-allowed rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 opacity-45"
          >
            Build shortlist →
          </button>
        </footer>
      </section>
    </div>
  );
}
