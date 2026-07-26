"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AiSelectModal } from "@/components/ai-select-modal";
import { LongListPanel } from "@/components/long-list-panel";
import { PoolProfileModal } from "@/components/pool-profile-modal";
import { filterPool, type FacetSelection, type PoolFilterState } from "@/lib/pool-filter";
import {
  COMPANY_TYPES,
  FUNCTIONS,
  GEOGRAPHIES,
  INDUSTRIES,
  POOL,
  SPECIALISMS,
} from "@/lib/pool.config";

const poolAges = POOL.map((candidate) => candidate.age);
const MIN_POOL_AGE = Math.min(...poolAges);
const MAX_POOL_AGE = Math.max(...poolAges);

type FacetKey = "industries" | "functions" | "geographies" | "companyTypes" | "specialisms";

const FACETS: {
  key: FacetKey;
  label: string;
  vocabulary: readonly string[];
}[] = [
  { key: "industries", label: "Industry", vocabulary: INDUSTRIES },
  { key: "functions", label: "Function", vocabulary: FUNCTIONS },
  { key: "geographies", label: "Geography", vocabulary: GEOGRAPHIES },
  { key: "companyTypes", label: "Company type", vocabulary: COMPANY_TYPES },
  { key: "specialisms", label: "Specialism", vocabulary: SPECIALISMS },
];

function initialFilterState(): PoolFilterState {
  return {
    industries: [],
    functions: [],
    geographies: [],
    companyTypes: [],
    specialisms: [],
    minAge: MIN_POOL_AGE,
    maxAge: MAX_POOL_AGE,
  };
}

function FacetDropdown({
  label,
  vocabulary,
  selections,
  onChange,
}: {
  label: string;
  vocabulary: readonly string[];
  selections: FacetSelection[];
  onChange: (selections: FacetSelection[]) => void;
}) {
  const selectionByTag = new Map(selections.map((selection) => [selection.tag, selection]));

  return (
    <details className="group relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg border border-navy-700 bg-navy-900 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream-100 hover:border-gold-500/60 [&::-webkit-details-marker]:hidden">
        {label}
        {selections.length > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[9px] text-navy-950">
            {selections.length}
          </span>
        )}
        <span aria-hidden="true" className="ml-auto text-gold-400 transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="absolute left-0 top-[calc(100%+6px)] z-30 grid w-[420px] grid-cols-2 gap-x-4 gap-y-2 rounded-xl border border-navy-700 bg-navy-900 p-4 shadow-2xl">
        {vocabulary.map((tag) => {
          const selection = selectionByTag.get(tag);
          return (
            <div key={tag} className="min-w-0">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-cream-100">
                <input
                  type="checkbox"
                  checked={Boolean(selection)}
                  onChange={(event) => {
                    if (event.target.checked) {
                      onChange([...selections, { tag, minYears: 0 }]);
                    } else {
                      onChange(selections.filter((current) => current.tag !== tag));
                    }
                  }}
                  className="h-3.5 w-3.5 accent-gold-500"
                />
                <span className="truncate">{tag}</span>
              </label>
              {selection && (
                <label className="mt-1.5 block pl-5 text-[9px] text-cream-300">
                  <span className="flex justify-between gap-2">
                    <span>Min years</span>
                    <span className="text-gold-400">{selection.minYears}</span>
                  </span>
                  <input
                    aria-label={`${tag} minimum years`}
                    type="range"
                    min="0"
                    max="40"
                    value={selection.minYears}
                    onChange={(event) => onChange(selections.map((current) =>
                      current.tag === tag
                        ? { ...current, minYears: Number(event.target.value) }
                        : current,
                    ))}
                    className="block w-full accent-gold-500"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}

export default function CandidatePoolPage() {
  const [filters, setFilters] = useState<PoolFilterState>(initialFilterState);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [longListIds, setLongListIds] = useState<string[]>([]);
  const [longListOpen, setLongListOpen] = useState(false);
  const [aiSelectOpen, setAiSelectOpen] = useState(false);
  const [modalIds, setModalIds] = useState<string[]>();
  const visibleCandidates = useMemo(
    () => filterPool(POOL, filters),
    [filters],
  );
  const fullPoolVisible = visibleCandidates.length === POOL.length;
  const comparedIdSet = new Set(compareIds);
  const longListIdSet = new Set(longListIds);
  const longListCandidates = longListIds
    .map((candidateId) => POOL.find((candidate) => candidate.id === candidateId))
    .filter((candidate) => candidate !== undefined);
  const modalCandidates = modalIds
    ?.map((candidateId) => POOL.find((candidate) => candidate.id === candidateId))
    .filter((candidate) => candidate !== undefined) ?? [];

  const toggleCompare = (candidateId: string) => {
    setCompareIds((current) => {
      if (current.includes(candidateId)) {
        return current.filter((id) => id !== candidateId);
      }
      return current.length < 4 ? [...current, candidateId] : current;
    });
  };

  const toggleLongList = (candidateId: string) => {
    setLongListIds((current) => {
      if (current.includes(candidateId)) {
        return current.filter((id) => id !== candidateId);
      }
      return current.length < 20 ? [...current, candidateId] : current;
    });
  };

  const removeFromModal = (candidateId: string) => {
    setCompareIds((current) => current.filter((id) => id !== candidateId));
    setModalIds((current) => {
      const next = current?.filter((id) => id !== candidateId) ?? [];
      return next.length > 0 ? next : undefined;
    });
  };

  const addToModal = (candidateId: string) => {
    const current = modalIds ?? [];
    if (current.length >= 4 || current.includes(candidateId)) return;
    const next = [...current, candidateId];
    setModalIds(next);
    setCompareIds(next);
  };

  return (
    <main className="mx-auto flex h-dvh w-full max-w-[1680px] flex-col overflow-hidden">
      <header className="shrink-0 border-b border-navy-700/70 px-5 py-3 sm:px-8 lg:px-10">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Candidate pool</p>
            <div className="mt-1.5 flex items-baseline gap-3">
              <h1 className="font-display text-2xl text-cream-50 sm:text-3xl">Board and executive search</h1>
              <span data-testid="pool-count" className="text-sm text-cream-300">
                {visibleCandidates.length} of {POOL.length}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setAiSelectOpen(true)}
              className="rounded-full bg-gold-500 px-4 py-2 text-xs font-semibold text-navy-950 hover:bg-gold-400"
            >
              ✦ Let AI build your long list
            </button>
            {longListIds.length > 0 && (
              <button
                type="button"
                onClick={() => setLongListOpen(true)}
                className="rounded-full border border-gold-500/50 px-3 py-2 text-xs text-cream-100 hover:border-gold-400"
              >
                View current long list ({longListIds.length})
              </button>
            )}
            <Link href="/" className="text-xs text-cream-300 hover:text-cream-50">
              Back to xMetrics
            </Link>
          </div>
        </div>
      </header>

      <section
        aria-label="Candidate filters"
        className="relative z-20 mx-5 my-2 flex h-12 shrink-0 items-center gap-2 rounded-xl border border-navy-700 bg-navy-950 px-3 sm:mx-8 lg:mx-10"
      >
        {FACETS.map((facet) => (
          <FacetDropdown
            key={facet.key}
            label={facet.label}
            vocabulary={facet.vocabulary}
            selections={filters[facet.key]}
            onChange={(selections) => setFilters((current) => ({
              ...current,
              [facet.key]: selections,
            }))}
          />
        ))}

        <fieldset className="ml-auto flex h-9 min-w-[190px] items-center gap-2 rounded-lg border border-navy-700 bg-navy-900 px-3">
          <legend className="sr-only">Age range</legend>
          <span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-cream-100">Age</span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between text-[8px] text-gold-400">
              <span>{filters.minAge}</span>
              <span>{filters.maxAge}</span>
            </div>
            <div className="relative h-3">
              <input
                aria-label="Minimum age"
                type="range"
                min={MIN_POOL_AGE}
                max={MAX_POOL_AGE}
                value={filters.minAge}
                onChange={(event) => setFilters((current) => ({
                  ...current,
                  minAge: Math.min(Number(event.target.value), current.maxAge),
                }))}
                className="pointer-events-none absolute inset-x-0 top-0 w-full accent-gold-500 [&::-webkit-slider-thumb]:pointer-events-auto"
              />
              <input
                aria-label="Maximum age"
                type="range"
                min={MIN_POOL_AGE}
                max={MAX_POOL_AGE}
                value={filters.maxAge}
                onChange={(event) => setFilters((current) => ({
                  ...current,
                  maxAge: Math.max(Number(event.target.value), current.minAge),
                }))}
                className="pointer-events-none absolute inset-x-0 top-0 w-full accent-gold-500 [&::-webkit-slider-thumb]:pointer-events-auto"
              />
            </div>
          </div>
        </fieldset>

        <button
          type="button"
          onClick={() => setFilters(initialFilterState())}
          className="shrink-0 px-2 text-[10px] text-cream-300 hover:text-cream-50"
        >
          Clear all
        </button>
      </section>

      <div className={`relative z-10 flex min-h-0 flex-1 ${
        longListOpen ? "gap-3 px-5 pb-3 sm:px-8 lg:px-10" : ""
      }`}>
        {longListOpen && (
          <LongListPanel
            candidates={longListCandidates}
            longListIds={longListIds}
            onRemove={(candidateId) => setLongListIds((current) => current.filter((id) => id !== candidateId))}
            onOpenProfile={(candidateId) => setModalIds([candidateId])}
            onClose={() => setLongListOpen(false)}
          />
        )}

        <section
          aria-label="Candidates"
          className={`min-h-0 overflow-y-auto ${
            longListOpen
              ? "min-w-0 flex-1"
              : "w-full px-5 pb-3 sm:px-8 lg:px-10"
          }`}
        >
          {visibleCandidates.length > 0 ? (
            <div className={`grid min-h-full gap-2 ${
              longListOpen
                ? "auto-rows-[96px] grid-cols-1 content-start sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
                : `grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-9 2xl:grid-cols-10 ${
                  fullPoolVisible
                    ? "grid-rows-[repeat(25,minmax(88px,1fr))] sm:grid-rows-[repeat(13,minmax(88px,1fr))] md:grid-rows-[repeat(9,minmax(88px,1fr))] lg:grid-rows-[repeat(7,minmax(88px,1fr))] xl:grid-rows-[repeat(6,minmax(88px,1fr))] 2xl:grid-rows-[repeat(5,minmax(88px,1fr))]"
                    : "auto-rows-[96px] content-start"
                }`
            }`}>
              {visibleCandidates.map((candidate) => (
                <article
                  data-testid="pool-candidate-card"
                  key={candidate.id}
                  className={`relative flex min-h-[88px] min-w-0 rounded-xl border bg-navy-900 transition hover:-translate-y-0.5 hover:border-gold-500/70 motion-reduce:transform-none ${
                    longListIdSet.has(candidate.id)
                      ? "border-gold-500 shadow-[0_0_14px_rgba(201,162,39,0.16)]"
                      : "border-navy-700"
                  }`}
                >
                  <button
                    type="button"
                    aria-label={`Open profile for ${candidate.displayName}`}
                    onClick={() => setModalIds([candidate.id])}
                    className="flex min-w-0 flex-1 flex-col items-center justify-center px-3 py-3 text-center"
                  >
                    <h2 className="break-words font-display text-[15px] leading-tight text-cream-50">
                      {candidate.displayName}
                    </h2>
                    <p className="mt-1.5 break-words text-[8px] font-semibold uppercase leading-3 tracking-[0.1em] text-gold-400">
                      {candidate.role}
                    </p>
                  </button>
                  <button
                    type="button"
                    aria-label="Compare"
                    title="Compare"
                    aria-pressed={comparedIdSet.has(candidate.id)}
                    disabled={compareIds.length >= 4 && !comparedIdSet.has(candidate.id)}
                    onClick={() => toggleCompare(candidate.id)}
                    className={`absolute right-8 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                      comparedIdSet.has(candidate.id)
                        ? "border-gold-400 bg-gold-500 text-navy-950"
                        : "border-navy-700 bg-navy-950 text-cream-300 hover:border-gold-500 hover:text-cream-50 disabled:cursor-not-allowed disabled:opacity-25"
                    }`}
                  >
                    ~
                  </button>
                  <button
                    type="button"
                    aria-label="Add to long list"
                    title="Add to long list"
                    aria-pressed={longListIdSet.has(candidate.id)}
                    disabled={longListIds.length >= 20 && !longListIdSet.has(candidate.id)}
                    onClick={() => toggleLongList(candidate.id)}
                    className={`absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${
                      longListIdSet.has(candidate.id)
                        ? "border-gold-400 bg-gold-500 text-navy-950"
                        : "border-navy-700 bg-navy-950 text-cream-300 hover:border-gold-500 hover:text-cream-50 disabled:cursor-not-allowed disabled:opacity-25"
                    }`}
                  >
                    {longListIdSet.has(candidate.id) ? "✓" : "+"}
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-center">
              <div>
                <p className="font-display text-2xl text-cream-50">No candidates match</p>
                <button type="button" onClick={() => setFilters(initialFilterState())} className="mt-3 text-xs text-gold-400 hover:text-gold-500">
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {compareIds.length > 0 && (
        <button
          type="button"
          onClick={() => setModalIds([...compareIds])}
          className="fixed bottom-5 right-5 z-30 rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 shadow-2xl hover:bg-gold-400"
        >
          Compare ({compareIds.length})
        </button>
      )}

      {modalCandidates.length > 0 && (
        <PoolProfileModal
          candidates={modalCandidates}
          pool={POOL}
          onAdd={addToModal}
          onRemove={removeFromModal}
          onClose={() => setModalIds(undefined)}
        />
      )}

      {aiSelectOpen && (
        <AiSelectModal
          longListIds={longListIds}
          onAddPicks={(candidateIds) => setLongListIds((current) => {
            const merged = [...current];
            for (const candidateId of candidateIds) {
              if (merged.length >= 20) break;
              if (!merged.includes(candidateId)) merged.push(candidateId);
            }
            return merged;
          })}
          onClose={() => setAiSelectOpen(false)}
        />
      )}
    </main>
  );
}
