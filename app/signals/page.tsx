"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Room, type RoomConnection } from "@/components/room";
import { useSession } from "@/components/session-provider";
import { TRAITS } from "@/lib/traits.config";
import type { DerivedSignal } from "@/lib/types";

const signalKinds = ["concentration", "vacuum", "polarity"] as const;
type SignalKind = (typeof signalKinds)[number];

const signalLabels: Record<SignalKind, string> = {
  concentration: "Concentration",
  vacuum: "Vacuum",
  polarity: "Polarity",
};

function signalKey(signal: DerivedSignal): string {
  return `${signal.kind}-${signal.traitId}-${signal.memberIds.join("-")}`;
}

export default function TeamSignals() {
  const { session } = useSession();
  const firstKind = signalKinds.find((kind) =>
    session.signals.some((signal) => signal.kind === kind),
  );
  const [expandedKinds, setExpandedKinds] = useState<Set<SignalKind>>(
    () => new Set(firstKind ? [firstKind] : []),
  );
  const [hoveredKey, setHoveredKey] = useState<string>();
  const [pinnedKey, setPinnedKey] = useState<string>();
  const [spreadOpen, setSpreadOpen] = useState(false);
  const activeKey = hoveredKey ?? pinnedKey;
  const activeSignal = session.signals.find((signal) => signalKey(signal) === activeKey);

  const activeConnections = useMemo<RoomConnection[]>(() => {
    if (!activeSignal || activeSignal.memberIds.length < 2) return [];

    if (activeSignal.kind === "polarity") {
      const members = activeSignal.memberIds
        .map((id) => session.members.find((member) => member.id === id))
        .filter((member) => member !== undefined)
        .sort(
          (first, second) =>
            second.traits[activeSignal.traitId] - first.traits[activeSignal.traitId],
        );
      if (members.length < 2) return [];
      return [{
        fromId: members[0].id,
        toId: members[members.length - 1].id,
        kind: "polarity",
      }];
    }

    return [{
      fromId: activeSignal.memberIds[0],
      toId: activeSignal.memberIds[1],
      kind: "concentration",
    }];
  }, [activeSignal, session.members]);

  const ghostSeatLabel = activeSignal?.kind === "vacuum"
    ? `no natural ${TRAITS.find((trait) => trait.id === activeSignal.traitId)?.name.toLowerCase()}`
    : undefined;

  if (session.members.length < 3) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-lg text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Team signals</p>
          <h1 className="mt-3 font-display text-3xl text-cream-50 sm:text-4xl">The room is not assembled yet</h1>
          <p className="mt-4 text-cream-300">Add at least three people before examining how the team may operate together.</p>
          <Link href="/" className="mt-7 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Return to team builder</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-[1680px] px-5 py-7 sm:px-8 lg:px-12 lg:py-9">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-navy-700/70 pb-6">
        <div>
          <Link href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">← Adjust team</Link>
          <h1 className="mt-4 font-display text-3xl text-cream-50 sm:text-4xl">Team signals</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-cream-300">Explore the patterns that may shape how this team acts together under pressure.</p>
        </div>
        <p className="text-sm text-cream-300">{session.members.length} people assessed</p>
      </header>

      <div className="grid gap-8 py-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-12">
        <aside>
          <div className="lg:sticky lg:top-8">
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">The room</p>
            <div className="mx-auto w-full max-w-[560px]">
              <Room
                members={session.members}
                highlightIds={activeSignal?.memberIds}
                dimUnhighlighted={Boolean(activeSignal && activeSignal.memberIds.length > 0)}
                connections={activeConnections}
                ghostSeatLabel={ghostSeatLabel}
              />
            </div>

            <div className="mt-5 border-t border-navy-700/70 pt-5">
              <button
                type="button"
                aria-expanded={spreadOpen}
                onClick={() => setSpreadOpen((open) => !open)}
                className="flex w-full items-center justify-between py-2 text-left"
              >
                <span className="font-display text-xl text-cream-50">Trait spread</span>
                <span className="text-xs uppercase tracking-[0.16em] text-gold-400">{spreadOpen ? "Hide" : "Show"}</span>
              </button>
              {spreadOpen && (
                <div className="mt-5 space-y-7">
                  {(["drive", "thinking", "interpersonal", "pressure"] as const).map((group) => (
                    <div key={group}>
                      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-cream-300">{group}</h3>
                      <div className="space-y-4">
                        {TRAITS.filter((trait) => trait.group === group).map((trait) => {
                          const scores = session.members.map((member) => member.traits[trait.id]);
                          const minimum = Math.min(...scores);
                          const maximum = Math.max(...scores);
                          return (
                            <div key={trait.id} className="grid gap-2 sm:grid-cols-[160px_1fr] lg:grid-cols-1 xl:grid-cols-[145px_1fr]">
                              <p className="text-xs text-cream-100">{trait.name}</p>
                              <div className="relative h-5" aria-label={`${trait.name} spread`}>
                                <div className="absolute inset-x-0 top-2 h-px bg-navy-700" />
                                <div className="absolute top-[6px] h-1 rounded-full bg-gold-500/45" style={{ left: `${minimum}%`, width: `${maximum - minimum}%` }} />
                                {session.members.map((member, index) => (
                                  <span
                                    key={member.id}
                                    title={`${member.displayName}: ${trait.name}`}
                                    className="absolute top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-gold-400 bg-navy-950"
                                    style={{ left: `${member.traits[trait.id]}%`, transform: `translate(-50%, ${index % 2 === 0 ? "-1px" : "3px"})` }}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        <section aria-labelledby="findings-heading">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Findings</p>
          <h2 id="findings-heading" className="mt-2 font-display text-2xl text-cream-50 sm:text-3xl">What stands out</h2>
          {session.signals.length === 0 ? (
            <p className="mt-6 rounded-xl border border-navy-700 bg-navy-900 p-5 text-sm leading-6 text-cream-300">No threshold-level concentrations, vacuums or polarities appear in this team.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {signalKinds.map((kind) => {
                const findings = session.signals.filter((signal) => signal.kind === kind);
                if (findings.length === 0) return null;
                const expanded = expandedKinds.has(kind);

                return (
                  <section key={kind} className="overflow-hidden rounded-xl border border-navy-700 bg-navy-900/50">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setExpandedKinds((current) => {
                        const next = new Set(current);
                        if (next.has(kind)) next.delete(kind);
                        else next.add(kind);
                        return next;
                      })}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gold-400">{signalLabels[kind]}</span>
                      <span className="rounded-full border border-navy-700 px-2 py-0.5 text-xs text-cream-300">{findings.length}</span>
                    </button>
                    {expanded && (
                      <div className="grid gap-3 border-t border-navy-700/70 p-3 min-[1440px]:grid-cols-2">
                        {findings.map((signal) => {
                          const key = signalKey(signal);
                          const pinned = pinnedKey === key;
                          return (
                            <button
                              type="button"
                              data-testid="signal-card"
                              key={key}
                              aria-pressed={pinned}
                              onMouseEnter={() => setHoveredKey(key)}
                              onMouseLeave={() => setHoveredKey(undefined)}
                              onFocus={() => setHoveredKey(key)}
                              onBlur={() => setHoveredKey(undefined)}
                              onClick={() => setPinnedKey((current) => current === key ? undefined : key)}
                              className={`block w-full rounded-lg border p-4 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-400 ${pinned ? "border-gold-500/70 bg-navy-800" : "border-navy-700/70 bg-navy-900 hover:border-gold-500/40"}`}
                            >
                              <span className="text-sm leading-6 text-cream-100">{signal.narrative}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          <section className="mt-8 border-t border-navy-700/70 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Under pressure</p>
            <h2 className="mt-2 font-display text-2xl text-cream-50">Pressure profile</h2>
            <div className="mt-5 grid gap-3">
              {session.exposures.map((exposure) => (
                <div key={exposure.memberId} className="border-l border-gold-500/60 bg-navy-900/60 px-4 py-3 text-sm leading-6 text-cream-100">{exposure.narrative}</div>
              ))}
            </div>
          </section>
        </section>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-5 border-t border-navy-700/70 py-6">
        <p className="max-w-xl text-xs leading-5 text-cream-300">These signals describe likely team dynamics, not individual capability or a validated assessment outcome.</p>
        <Link href="/scenario" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400">Run scenario</Link>
      </footer>
    </main>
  );
}
