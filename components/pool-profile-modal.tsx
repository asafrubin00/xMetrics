"use client";

import { useMemo, useState } from "react";
import { compareGridClass } from "@/lib/compare-grid";
import type { ExperienceTag, PoolCandidate } from "@/lib/pool.config";

const EXPERIENCE_GROUPS: {
  key: "industries" | "functions" | "geographies" | "companyTypes" | "specialisms";
  label: string;
}[] = [
  { key: "industries", label: "Industry" },
  { key: "functions", label: "Function" },
  { key: "geographies", label: "Geography" },
  { key: "companyTypes", label: "Company type" },
  { key: "specialisms", label: "Specialism" },
];

function ExperienceChips({ entries }: { entries: ExperienceTag[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {entries.map((entry) => (
        <span
          key={entry.tag}
          className="rounded-full border border-navy-700 bg-navy-950 px-2.5 py-1 text-[10px] text-cream-100"
        >
          {entry.tag} <span className="text-gold-400">· {entry.years}y</span>
        </span>
      ))}
    </div>
  );
}

function ProfilePanel({
  candidate,
  onRemove,
}: {
  candidate: PoolCandidate;
  onRemove: () => void;
}) {
  return (
    <article
      data-testid="profile-panel"
      className="relative min-h-0 overflow-y-auto rounded-2xl border border-gold-500/35 bg-navy-900 p-5 sm:p-6"
    >
      <button
        type="button"
        aria-label={`Remove ${candidate.displayName} from comparison`}
        onClick={onRemove}
        className="absolute right-4 top-3 text-lg text-cream-300 hover:text-cream-50"
      >
        ×
      </button>
      <div className="pr-7">
        <h2 className="font-display text-2xl leading-tight text-cream-50 sm:text-3xl">{candidate.displayName}</h2>
        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-400">{candidate.role}</p>
        <p className="mt-1 text-xs text-cream-300">Age {candidate.age}</p>
      </div>
      <p className="mt-5 text-sm leading-6 text-cream-100">{candidate.bio}</p>
      <div className="mt-6 grid gap-4">
        {EXPERIENCE_GROUPS.map((group) => (
          <section key={group.key}>
            <h3 className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cream-300">{group.label}</h3>
            <ExperienceChips entries={candidate[group.key]} />
          </section>
        ))}
      </div>
    </article>
  );
}

export function PoolProfileModal({
  candidates,
  pool,
  onAdd,
  onRemove,
  onClose,
}: {
  candidates: PoolCandidate[];
  pool: PoolCandidate[];
  onAdd: (candidateId: string) => void;
  onRemove: (candidateId: string) => void;
  onClose: () => void;
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [query, setQuery] = useState("");
  const remainingCandidates = useMemo(() => {
    const shownIds = new Set(candidates.map((candidate) => candidate.id));
    const normalisedQuery = query.trim().toLowerCase();
    return pool.filter((candidate) =>
      !shownIds.has(candidate.id) &&
      (normalisedQuery.length === 0 ||
        candidate.displayName.toLowerCase().includes(normalisedQuery) ||
        candidate.role.toLowerCase().includes(normalisedQuery)),
    );
  }, [candidates, pool, query]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Candidate profiles"
      className="fixed inset-0 z-50 flex h-dvh flex-col overflow-hidden bg-navy-950/95 p-4 backdrop-blur-sm sm:p-6"
    >
      <header className="flex shrink-0 items-center justify-between gap-4 pb-4">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">Candidate profiles</p>
            <p className="mt-1 text-xs text-cream-300">{candidates.length} selected</p>
          </div>
          {candidates.length < 4 && (
            <div className="relative">
              <button
                type="button"
                aria-expanded={addOpen}
                onClick={() => setAddOpen((open) => !open)}
                className="rounded-lg border border-gold-500/50 px-3 py-2 text-xs text-cream-100 hover:border-gold-400"
              >
                ＋ Add
              </button>
              {addOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-10 w-72 rounded-xl border border-navy-700 bg-navy-900 p-3 shadow-2xl">
                  <input
                    aria-label="Search remaining candidates"
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search candidates"
                    className="w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-xs text-cream-50 outline-none placeholder:text-cream-300/50 focus:border-gold-500"
                  />
                  <div className="mt-2 max-h-60 overflow-y-auto">
                    {remainingCandidates.map((candidate) => (
                      <button
                        type="button"
                        key={candidate.id}
                        onClick={() => {
                          onAdd(candidate.id);
                          setAddOpen(false);
                          setQuery("");
                        }}
                        className="block w-full rounded-lg px-3 py-2 text-left hover:bg-navy-800"
                      >
                        <span className="block font-display text-sm text-cream-50">{candidate.displayName}</span>
                        <span className="mt-0.5 block text-[8px] uppercase tracking-wider text-gold-400">{candidate.role}</span>
                      </button>
                    ))}
                    {remainingCandidates.length === 0 && (
                      <p className="px-3 py-4 text-xs text-cream-300">No remaining candidates match.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Close candidate profiles"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-700 text-xl text-cream-300 hover:border-gold-500 hover:text-cream-50"
        >
          X
        </button>
      </header>

      <div className={`grid min-h-0 flex-1 gap-4 ${compareGridClass(candidates.length)}`}>
        {candidates.map((candidate) => (
          <ProfilePanel
            key={candidate.id}
            candidate={candidate}
            onRemove={() => onRemove(candidate.id)}
          />
        ))}
      </div>
    </div>
  );
}
