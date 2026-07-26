"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState, type DragEvent, type FormEvent } from "react";
import { Room, type RoomConnection } from "@/components/room";
import { resolveLongList } from "@/lib/long-list";
import { POOL, type PoolCandidate } from "@/lib/pool.config";
import { computeSignals } from "@/lib/signals";
import type { Shortlist } from "@/lib/shortlist";
import { TRAITS } from "@/lib/traits.config";
import type { DerivedSignal } from "@/lib/types";

const DEFAULT_BRIEF = "I need a chair for a mid-cap fintech board — strong on regulatory, calm under pressure, not another dominant voice";
const GROUPS = ["drive", "thinking", "interpersonal", "pressure"] as const;

function groupSummary(candidate: PoolCandidate, group: (typeof GROUPS)[number]): string {
  const groupTraits = TRAITS.filter((trait) => trait.group === group);
  const mostDistinctive = groupTraits
    .map((trait) => ({
      distance: Math.abs(candidate.traits[trait.id] - 50),
      text: candidate.traits[trait.id] >= 50 ? trait.highDescriptor : trait.lowDescriptor,
    }))
    .sort((first, second) => second.distance - first.distance)[0];
  return mostDistinctive.text;
}

function connectionsForSignals(
  signals: DerivedSignal[],
  candidates: PoolCandidate[],
): RoomConnection[] {
  const candidateById = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const weighted: { connection: RoomConnection; priority: number; strength: number }[] = [];

  for (const signal of signals) {
    if (signal.kind === "vacuum") continue;

    if (signal.kind === "concentration") {
      for (let index = 0; index < signal.memberIds.length - 1; index += 1) {
        const fromId = signal.memberIds[index];
        const toId = signal.memberIds[index + 1];
        const from = candidateById.get(fromId);
        const to = candidateById.get(toId);
        if (!from || !to) continue;
        weighted.push({
          connection: { fromId, toId, kind: "concentration" },
          priority: 1,
          strength: (from.traits[signal.traitId] + to.traits[signal.traitId]) / 2,
        });
      }
      continue;
    }

    const members = signal.memberIds
      .map((id) => candidateById.get(id))
      .filter((candidate): candidate is PoolCandidate => Boolean(candidate));
    const scores = members.map((member) => member.traits[signal.traitId]);
    const midpoint = (Math.min(...scores) + Math.max(...scores)) / 2;
    const highCamp = members.filter((member) => member.traits[signal.traitId] >= midpoint);
    const lowCamp = members.filter((member) => member.traits[signal.traitId] < midpoint);

    for (const high of highCamp) {
      for (const low of lowCamp) {
        weighted.push({
          connection: { fromId: high.id, toId: low.id, kind: "polarity" },
          priority: 2,
          strength: high.traits[signal.traitId] - low.traits[signal.traitId],
        });
      }
    }
  }

  return weighted
    .sort((first, second) =>
      second.priority - first.priority || second.strength - first.strength,
    )
    .map(({ connection }) => connection)
    .slice(0, 6);
}

function signalLabel(kind: DerivedSignal["kind"]): string {
  if (kind === "vacuum") return "Gap";
  if (kind === "polarity") return "Fault line";
  return "Overlap";
}

function SearchInner() {
  const searchParams = useSearchParams();
  const candidates = useMemo(() => {
    const longListParam = searchParams.get("ll");
    if (!longListParam) return POOL.slice(0, 18);
    const resolved = resolveLongList(longListParam.split(","));
    return resolved.length > 0 ? resolved : POOL.slice(0, 18);
  }, [searchParams]);
  const maxFinalists = Math.max(3, Math.min(6, candidates.length));
  const [brief, setBrief] = useState(DEFAULT_BRIEF);
  const [seatCount, setSeatCount] = useState(() => Math.min(5, maxFinalists));
  const [shortlist, setShortlist] = useState<Shortlist>();
  const [seatedIds, setSeatedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>();
  const [revealedCandidateId, setRevealedCandidateId] = useState<string>();
  const [dragPayload, setDragPayload] = useState<string>();
  const [removeDropActive, setRemoveDropActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const candidateById = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.id, candidate])),
    [candidates],
  );
  const seatedCandidates = useMemo(
    () => seatedIds
      .map((candidateId) => candidateById.get(candidateId))
      .filter((candidate): candidate is PoolCandidate => Boolean(candidate)),
    [candidateById, seatedIds],
  );
  const teamSignals = useMemo(
    () => computeSignals(seatedCandidates),
    [seatedCandidates],
  );
  const roomConnections = useMemo(
    () => connectionsForSignals(teamSignals, seatedCandidates),
    [seatedCandidates, teamSignals],
  );
  const groupProfiles = useMemo(() => GROUPS.map((group) => {
    const traits = TRAITS.filter((trait) => trait.group === group);
    const memberPositions = seatedCandidates.map((candidate) =>
      traits.reduce((total, trait) => total + candidate.traits[trait.id], 0) / traits.length,
    );
    const average = memberPositions.length > 0
      ? memberPositions.reduce((total, position) => total + position, 0) / memberPositions.length
      : 50;
    return {
      group,
      average,
      minimum: memberPositions.length > 0 ? Math.min(...memberPositions) : 50,
      maximum: memberPositions.length > 0 ? Math.max(...memberPositions) : 50,
    };
  }), [seatedCandidates]);
  const frictionCallouts = useMemo(
    () => [...teamSignals]
      .sort((first, second) => {
        const priority = { vacuum: 3, polarity: 2, concentration: 1 };
        return priority[second.kind] - priority[first.kind];
      })
      .slice(0, 3),
    [teamSignals],
  );
  const rankById = new Map(shortlist?.ranked.map((candidate) => [candidate.candidateId, candidate.rank]));
  const reasonsById = new Map(shortlist?.picks.map((pick) => [pick.candidateId, pick.reason]));
  const seatedIdSet = new Set(seatedIds);
  const runnersUp = shortlist?.ranked
    .filter((ranked) => !seatedIdSet.has(ranked.candidateId))
    .map((ranked) => ({ ...ranked, candidate: candidateById.get(ranked.candidateId) }))
    .filter((ranked): ranked is typeof ranked & { candidate: PoolCandidate } => Boolean(ranked.candidate))
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
          candidates,
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
      setSelectedId(undefined);
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
      setSelectedId(undefined);
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
    <main className="mx-auto flex h-dvh w-full max-w-[1680px] flex-col overflow-hidden">
      <header className="shrink-0 border-b border-navy-700/70 px-5 py-3 sm:px-8 lg:px-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-cream-50">xMetrics</h1>
            <p className="mt-1 text-xs tracking-wide text-gold-400">search, multiplied.</p>
          </div>
          <Link href="/" className="text-xs text-cream-300 hover:text-cream-50">Back to xMetrics</Link>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[31%_69%]">
        <section className="flex min-h-0 min-w-0 flex-col border-b border-navy-700/70 px-5 py-4 sm:px-8 lg:border-b-0 lg:border-r lg:px-6">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Long list</p>
              <h2 className="mt-2 font-display text-2xl text-cream-50">Board and executive search</h2>
            </div>
            <span className="shrink-0 text-sm text-cream-300">{candidates.length}</span>
          </div>

          <div className="mt-3 grid min-h-0 flex-1 content-start gap-2 overflow-y-auto pr-1">
            {candidates.map((candidate) => {
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
                  className={`group touch-pan-y rounded-lg border bg-navy-900 px-3 py-2.5 transition-opacity ${picked ? "border-gold-500/70" : "border-navy-700"} ${seatedIdSet.has(candidate.id) ? "opacity-45" : "cursor-grab"}`}
                >
                  <div className="flex items-start gap-2.5">
                    {rank ? (
                      <span className={`mt-0.5 flex h-6 min-w-6 items-center justify-center rounded-full border px-1.5 text-[10px] ${picked ? "border-gold-500 text-gold-400" : "border-navy-700 text-cream-300"}`}>
                        {rank}
                      </span>
                    ) : (
                      <span className="mt-0.5 flex h-6 min-w-6 items-center justify-center text-[10px] text-cream-300/50">—</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <h3 className="truncate font-display text-base leading-5 text-cream-50">{candidate.displayName}</h3>
                        <p className="truncate text-[9px] font-semibold uppercase tracking-wider text-gold-400">{candidate.role}</p>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] leading-4 text-cream-300" title={candidate.background}>{candidate.background}</p>
                    </div>
                    <button
                      type="button"
                      aria-label={`Show ${candidate.displayName} profile`}
                      aria-expanded={revealedCandidateId === candidate.id}
                      onClick={() => setRevealedCandidateId((current) => current === candidate.id ? undefined : candidate.id)}
                      className="mt-0.5 shrink-0 text-xs text-cream-300 hover:text-cream-50"
                    >
                      {revealedCandidateId === candidate.id ? "−" : "+"}
                    </button>
                  </div>
                  <dl className={`grid grid-cols-2 gap-x-3 gap-y-1 overflow-hidden border-navy-700/70 transition-[max-height,margin,padding] group-hover:mt-2 group-hover:max-h-20 group-hover:border-t group-hover:pt-2 ${revealedCandidateId === candidate.id ? "mt-2 max-h-20 border-t pt-2" : "max-h-0"}`}>
                    {GROUPS.map((group) => (
                      <div key={group} className="min-w-0">
                        <dt className="text-[8px] font-semibold uppercase tracking-[0.14em] text-gold-400">{group}</dt>
                        <dd className="truncate text-[9px] text-cream-300" title={groupSummary(candidate, group)}>
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

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <form onSubmit={runShortlist} className="shrink-0 border-b border-navy-700/70 px-5 py-3 sm:px-8 lg:px-8">
            <label htmlFor="search-brief" className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">The brief</label>
            <div className="mt-2 grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
              <textarea
                id="search-brief"
                required
                rows={2}
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                className="h-16 w-full resize-none rounded-xl border border-navy-700 bg-navy-950 px-3 py-2 text-sm leading-5 text-cream-50 outline-none placeholder:text-cream-300/45 focus:border-gold-500"
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
                  className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-2 text-sm text-cream-50 outline-none focus:border-gold-500"
                >
                  {[3, 4, 5, 6]
                    .filter((count) => count <= maxFinalists)
                    .map((count) => <option key={count} value={count}>{count}</option>)}
                </select>
              </label>
              <button
                type="submit"
                disabled={loading || brief.trim().length === 0}
                className="rounded-lg bg-gold-500 px-5 py-2 text-sm font-semibold text-navy-950 hover:bg-gold-400 disabled:cursor-wait disabled:opacity-55"
              >
                {loading ? "Shortlisting…" : shortlist ? "Run again" : "Shortlist"}
              </button>
            </div>
            {error && <p role="alert" className="mt-3 text-sm text-cream-100">{error}</p>}
          </form>

          <div className="grid min-h-0 flex-1 gap-5 overflow-hidden px-5 py-3 sm:px-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:px-8">
            <div className="flex min-h-0 min-w-0 flex-col items-center">
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">Shortlist</p>
              <div className="min-h-0 w-full max-w-[min(48dvh,520px)]">
                <Room
                  members={seatedCandidates}
                  emptySeatCount={seatCount - seatedCandidates.length}
                  interactive
                  dragPayload={dragPayload}
                  highlightIds={selectedId ? [selectedId] : []}
                  connections={roomConnections}
                  onDragStateChange={setDragPayload}
                  onSeatDrop={dropOnSeat}
                  onMoveMember={moveMember}
                  onSeatClick={(memberId) => setSelectedId((current) => current === memberId ? undefined : memberId)}
                />
              </div>
              {shortlist && (
                <div aria-label="Connection legend" className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] text-cream-300">
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-5 bg-signal-tension" />
                    Fault line — the group splits here
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-0.5 w-5 bg-gold-500" />
                    Overlap — several crowd the same strength
                  </span>
                </div>
              )}
              {shortlist ? (
                <section aria-labelledby="dynamics-heading" className="mt-2 grid w-full max-w-3xl gap-3 rounded-xl border border-navy-700 bg-navy-900/60 p-3 lg:grid-cols-[0.8fr_1.2fr]">
                  <div>
                    <h2 id="dynamics-heading" className="font-display text-lg text-cream-50">Team dynamics</h2>
                    <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
                      {groupProfiles.map(({ group, average, minimum, maximum }) => (
                        <div key={group}>
                          <div className="flex justify-between text-[8px] font-semibold uppercase tracking-[0.12em] text-cream-300">
                            <span>{group}</span>
                            <span>{Math.round(average)}</span>
                          </div>
                          <div
                            aria-label={`${group} team profile`}
                            className="relative mt-1 h-1.5 rounded-full bg-navy-700"
                          >
                            <span
                              className="absolute top-0 h-1.5 rounded-full bg-gold-500/30"
                              style={{ left: `${minimum}%`, width: `${Math.max(maximum - minimum, 1)}%` }}
                            />
                            <span
                              className="absolute top-1/2 h-2.5 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold-400"
                              style={{ left: `${average}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div aria-live="polite" className="mt-3 border-t border-navy-700/70 pt-2 text-[10px] leading-4 text-cream-300">
                      {selectedId && seatedIdSet.has(selectedId) ? (
                        <>
                          <span className="text-cream-50">{candidateById.get(selectedId)?.displayName}</span>
                          <span className="mx-1 text-gold-400">—</span>
                          {reasonsById.get(selectedId) ?? "Added by you during refinement."}
                        </>
                      ) : (
                        "Click a seated finalist to see the agent’s reason."
                      )}
                    </div>
                  </div>
                  <div className="min-w-0 border-t border-navy-700/70 pt-2 lg:border-l lg:border-t-0 lg:pl-3 lg:pt-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold-400">Friction to examine</p>
                    {frictionCallouts.length > 0 ? (
                      <ul className="mt-2 grid gap-1.5">
                        {frictionCallouts.map((signal) => (
                          <li key={`${signal.kind}-${signal.traitId}`} className="flex min-w-0 items-center gap-2 text-[10px] text-cream-300">
                            <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[8px] uppercase tracking-wide ${signal.kind === "polarity" ? "border-signal-tension/60 text-signal-tension" : "border-gold-500/50 text-gold-400"}`}>
                              {signalLabel(signal.kind)}
                            </span>
                            <span className="truncate" title={signal.narrative}>{signal.narrative}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-[10px] leading-4 text-cream-300">No threshold-level gaps, fault lines or overlaps appear in this room.</p>
                    )}
                  </div>
                </section>
              ) : (
                <p className="mt-2 max-w-sm text-center text-sm leading-6 text-cream-300">
                  Write the brief and ask the agent to fill the finalist room.
                </p>
              )}
            </div>

            <aside className="min-h-0 min-w-0 overflow-hidden border-l border-navy-700/70 pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Runners-up</p>
              {runnersUp.length > 0 ? (
                <ol className="mt-3 grid gap-2">
                  {runnersUp.map(({ candidateId, rank, candidate }) => (
                    <li key={candidateId} className="flex gap-2 rounded-lg border border-navy-700 bg-navy-900 p-2">
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
                className={`mt-4 rounded-xl border border-dashed p-3 text-center text-[10px] leading-4 transition-colors motion-reduce:transition-none ${removeDropActive ? "border-gold-500 bg-gold-500/5 text-cream-50" : "border-navy-700 text-cream-300"}`}
              >
                Drag a seated finalist here to return them to the pool.
              </div>
            </aside>
          </div>
        </section>
      </div>

      <footer className="shrink-0 border-t border-navy-700/70 px-5 py-2 text-center text-[10px] text-cream-300/70">
        xMetrics — prototype. Candidate profiles are illustrative, not validated assessments.
      </footer>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
