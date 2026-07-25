"use client";

import Link from "next/link";
import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { Room } from "@/components/room";
import { CANDIDATES, type Candidate } from "@/lib/candidates.config";
import type { Shortlist } from "@/lib/shortlist";
import { TRAITS } from "@/lib/traits.config";

const DEFAULT_BRIEF = "I need a chair for a mid-cap fintech board — strong on regulatory, calm under pressure, not another dominant voice";
const GROUPS = ["drive", "thinking", "interpersonal", "pressure"] as const;

function groupSummary(candidate: Candidate, group: (typeof GROUPS)[number]): string {
  const groupTraits = TRAITS.filter((trait) => trait.group === group);
  const mostDistinctive = groupTraits
    .map((trait) => ({
      distance: Math.abs(candidate.traits[trait.id] - 50),
      text: candidate.traits[trait.id] >= 50 ? trait.highDescriptor : trait.lowDescriptor,
    }))
    .sort((first, second) => second.distance - first.distance)[0];
  return mostDistinctive.text;
}

export default function SearchPage() {
  const [brief, setBrief] = useState(DEFAULT_BRIEF);
  const [seatCount, setSeatCount] = useState(5);
  const [shortlist, setShortlist] = useState<Shortlist>();
  const [seatedIds, setSeatedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [dragPayload, setDragPayload] = useState<string>();
  const [removeDropActive, setRemoveDropActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const candidateById = useMemo(
    () => new Map(CANDIDATES.map((candidate) => [candidate.id, candidate])),
    [],
  );
  const seatedCandidates = seatedIds
    .map((candidateId) => candidateById.get(candidateId))
    .filter((candidate): candidate is Candidate => Boolean(candidate)) ?? [];
  const rankById = new Map(shortlist?.ranked.map((candidate) => [candidate.candidateId, candidate.rank]));
  const reasonsById = new Map(shortlist?.picks.map((pick) => [pick.candidateId, pick.reason]));
  const seatedIdSet = new Set(seatedIds);
  const runnersUp = shortlist?.ranked
    .filter((ranked) => !seatedIdSet.has(ranked.candidateId))
    .map((ranked) => ({ ...ranked, candidate: candidateById.get(ranked.candidateId) }))
    .filter((ranked): ranked is typeof ranked & { candidate: Candidate } => Boolean(ranked.candidate))
    .slice(0, 5) ?? [];

  const runShortlist = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch("/api/shortlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidates: CANDIDATES,
          brief: brief.trim(),
          seatCount,
          traitDefinitions: TRAITS,
        }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message = typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
          ? result.error
          : "The shortlist could not be generated. Please try again.";
        throw new Error(message);
      }
      const nextShortlist = result as Shortlist;
      setShortlist(nextShortlist);
      setSeatedIds(nextShortlist.picks.map((pick) => pick.candidateId));
      setSelectedId(nextShortlist.picks[0]?.candidateId);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "The shortlist could not be generated. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const dropOnSeat = (slotIndex: number, payload: string) => {
    const [kind, id] = payload.split(":");
    if (!candidateById.has(id)) return;

    if (kind === "candidate") {
      setSeatedIds((current) => {
        if (current.includes(id)) return current;
        const next = [...current];
        if (slotIndex < next.length) next[slotIndex] = id;
        else next.splice(Math.min(slotIndex, next.length), 0, id);
        return next.slice(0, seatCount);
      });
      setSelectedId(id);
    }

    if (kind === "member") {
      setSeatedIds((current) => {
        const fromIndex = current.indexOf(id);
        if (fromIndex < 0 || slotIndex >= current.length || fromIndex === slotIndex) return current;
        const next = [...current];
        [next[fromIndex], next[slotIndex]] = [next[slotIndex], next[fromIndex]];
        return next;
      });
    }
  };

  const moveMember = (memberId: string, direction: -1 | 1) => {
    setSeatedIds((current) => {
      const fromIndex = current.indexOf(memberId);
      const targetIndex = fromIndex + direction;
      if (fromIndex < 0 || targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[fromIndex], next[targetIndex]] = [next[targetIndex], next[fromIndex]];
      return next;
    });
  };

  const dropOnRemoveZone = (event: DragEvent) => {
    event.preventDefault();
    const payload = event.dataTransfer.getData("text/plain");
    if (payload.startsWith("member:")) {
      const memberId = payload.slice("member:".length);
      setSeatedIds((current) => current.filter((candidateId) => candidateId !== memberId));
      setSelectedId((current) => current === memberId ? undefined : current);
    }
    setDragPayload(undefined);
    setRemoveDropActive(false);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col lg:h-screen lg:overflow-hidden">
      <header className="shrink-0 border-b border-navy-700/70 px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-cream-50">xMetrics</h1>
            <p className="mt-1 text-xs tracking-wide text-gold-400">search, multiplied.</p>
          </div>
          <Link href="/" className="text-xs text-cream-300 hover:text-cream-50">Back to xMetrics</Link>
        </div>
      </header>

      <div className="grid flex-1 lg:min-h-0 lg:grid-cols-[34%_66%] xl:grid-cols-[31%_69%]">
        <section className="min-w-0 border-b border-navy-700/70 px-5 py-7 sm:px-8 lg:max-h-[calc(100vh-81px)] lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-7">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Candidate pool</p>
              <h2 className="mt-2 font-display text-2xl text-cream-50">Board and executive search</h2>
            </div>
            <span className="shrink-0 text-sm text-cream-300">{CANDIDATES.length}</span>
          </div>

          <div className="mt-5 grid gap-3">
            {CANDIDATES.map((candidate) => {
              const rank = rankById.get(candidate.id);
              const picked = seatedIdSet.has(candidate.id);
              return (
                <article
                  key={candidate.id}
                  aria-label={`Candidate ${candidate.displayName}`}
                  draggable={!seatedIdSet.has(candidate.id)}
                  onDragStart={(event) => {
                    const payload = `candidate:${candidate.id}`;
                    event.dataTransfer.setData("text/plain", payload);
                    event.dataTransfer.effectAllowed = "move";
                    setDragPayload(payload);
                  }}
                  onDragEnd={() => setDragPayload(undefined)}
                  className={`touch-pan-y rounded-xl border bg-navy-900 p-4 transition-opacity ${picked ? "border-gold-500/70" : "border-navy-700"} ${seatedIdSet.has(candidate.id) ? "opacity-45" : "cursor-grab"}`}
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <h3 className="font-display text-lg text-cream-50">{candidate.displayName}</h3>
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-gold-400">{candidate.role}</p>
                    </div>
                    {rank && (
                      <span className={`flex h-7 min-w-7 items-center justify-center rounded-full border px-2 text-xs ${picked ? "border-gold-500 text-gold-400" : "border-navy-700 text-cream-300"}`}>
                        {rank}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-cream-300">{candidate.background}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-navy-700/70 pt-3">
                    {GROUPS.map((group) => (
                      <div key={group} className="min-w-0">
                        <dt className="text-[9px] font-semibold uppercase tracking-[0.14em] text-gold-400">{group}</dt>
                        <dd className="mt-0.5 truncate text-[10px] text-cream-300" title={groupSummary(candidate, group)}>
                          {groupSummary(candidate, group)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              );
            })}
          </div>
        </section>

        <section className="flex min-w-0 flex-col lg:max-h-[calc(100vh-81px)] lg:overflow-y-auto">
          <form onSubmit={runShortlist} className="shrink-0 border-b border-navy-700/70 px-5 py-6 sm:px-8 lg:px-10">
            <label htmlFor="search-brief" className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">The brief</label>
            <div className="mt-3 grid gap-4 xl:grid-cols-[1fr_auto_auto] xl:items-end">
              <textarea
                id="search-brief"
                required
                rows={3}
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                className="min-h-24 w-full resize-y rounded-xl border border-navy-700 bg-navy-950 px-4 py-3 text-sm leading-6 text-cream-50 outline-none placeholder:text-cream-300/45 focus:border-gold-500"
              />
              <label className="text-xs text-cream-300">
                Finalists
                <select
                  value={seatCount}
                  onChange={(event) => {
                    const nextCount = Number(event.target.value);
                    setSeatCount(nextCount);
                    setSeatedIds((current) => current.slice(0, nextCount));
                  }}
                  className="mt-2 block w-full rounded-lg border border-navy-700 bg-navy-950 px-4 py-3 text-sm text-cream-50 outline-none focus:border-gold-500"
                >
                  {[3, 4, 5, 6].map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <button
                type="submit"
                disabled={loading || brief.trim().length === 0}
                className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-wait disabled:opacity-55"
              >
                {loading ? "Shortlisting…" : shortlist ? "Run again" : "Shortlist"}
              </button>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-cream-100">{error}</p>}
          </form>

          <div className="grid flex-1 gap-8 px-5 py-7 sm:px-8 xl:grid-cols-[minmax(0,1fr)_280px] xl:px-10">
            <div className="flex min-w-0 flex-col items-center">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">The finalist room</p>
              <div className="w-full max-w-[620px]">
                <Room
                  members={seatedCandidates}
                  emptySeatCount={seatCount - seatedCandidates.length}
                  interactive
                  dragPayload={dragPayload}
                  highlightIds={selectedId ? [selectedId] : []}
                  onDragStateChange={setDragPayload}
                  onSeatDrop={dropOnSeat}
                  onMoveMember={moveMember}
                  onSeatClick={setSelectedId}
                />
              </div>
              {shortlist ? (
                <div className="mt-2 w-full max-w-xl">
                  <h2 className="font-display text-xl text-cream-50">Why these finalists</h2>
                  {selectedId && seatedIdSet.has(selectedId) ? (
                    <div aria-live="polite" className="mt-3 rounded-lg border border-gold-500/45 bg-navy-900 px-4 py-3 text-sm text-cream-300">
                      <span className="text-cream-50">{candidateById.get(selectedId)?.displayName}</span>
                      <span className="mx-2 text-gold-400">—</span>
                      {reasonsById.get(selectedId) ?? "Added by you during refinement."}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-cream-300">Click a seated finalist to see the agent&apos;s reason.</p>
                  )}
                </div>
              ) : (
                <p className="mt-2 max-w-sm text-center text-sm leading-6 text-cream-300">
                  Write the brief and ask the agent to fill the finalist room.
                </p>
              )}
            </div>

            <aside className="min-w-0 border-t border-navy-700/70 pt-6 xl:border-l xl:border-t-0 xl:pl-7 xl:pt-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Runners-up</p>
              {runnersUp.length > 0 ? (
                <ol className="mt-4 grid gap-3">
                  {runnersUp.map(({ candidateId, rank, candidate }) => (
                    <li key={candidateId} className="flex gap-3 rounded-lg border border-navy-700 bg-navy-900 p-3">
                      <span className="text-xs text-gold-400">{rank}</span>
                      <span>
                        <span className="block font-display text-base text-cream-50">{candidate.displayName}</span>
                        <span className="mt-1 block text-[10px] uppercase tracking-wider text-cream-300">{candidate.role}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-4 text-sm leading-6 text-cream-300">The next-ranked candidates will appear here.</p>
              )}

              <div
                aria-label="Remove finalist"
                onDragOver={(event) => {
                  if (!dragPayload?.startsWith("member:")) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setRemoveDropActive(true);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setRemoveDropActive(false);
                  }
                }}
                onDrop={dropOnRemoveZone}
                className={`mt-6 rounded-xl border border-dashed p-5 text-center text-xs leading-5 transition-colors motion-reduce:transition-none ${removeDropActive ? "border-gold-500 bg-gold-500/5 text-cream-50" : "border-navy-700 text-cream-300"}`}
              >
                Drag a seated finalist here to return them to the pool.
              </div>
            </aside>
          </div>
        </section>
      </div>

      <footer className="shrink-0 border-t border-navy-700/70 px-5 py-3 text-center text-[10px] text-cream-300/70">
        xMetrics — prototype. Candidate profiles are illustrative, not validated assessments.
      </footer>
    </main>
  );
}
