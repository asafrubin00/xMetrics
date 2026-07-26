"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  buildLongListPlan,
  type ConsideredCandidate,
  type LongListPlan,
} from "@/lib/ai-select";

type ModalState = "brief" | "running" | "done";

function SteerForm({
  value,
  onBlur,
  onChange,
  onFocus,
  onSubmit,
}: {
  value: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  onSubmit: (event: FormEvent) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex min-w-64 flex-1 gap-2">
      <label className="min-w-0 flex-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-cream-300">
        Steer the agent
        <input
          aria-label="Steer the agent"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="Focus on APAC"
          className="mt-1 block w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-2 text-xs normal-case tracking-normal text-cream-50 outline-none placeholder:text-cream-300/45 focus:border-gold-500"
        />
      </label>
      <button type="submit" className="rounded-lg border border-gold-500/50 px-4 py-2 text-xs text-cream-100 hover:border-gold-400">
        Steer
      </button>
    </form>
  );
}

export function AiSelectModal({
  longListIds,
  onAddPicks,
  onClose,
}: {
  longListIds: string[];
  onAddPicks: (candidateIds: string[]) => void;
  onClose: () => void;
}) {
  const [state, setState] = useState<ModalState>("brief");
  const [brief, setBrief] = useState("");
  const [constraints, setConstraints] = useState<string[]>([]);
  const [steer, setSteer] = useState("");
  const [steerFocused, setSteerFocused] = useState(false);
  const [plan, setPlan] = useState<LongListPlan>();
  const [revealedCount, setRevealedCount] = useState(0);
  const [adjustments, setAdjustments] = useState<string[]>([]);
  const [history, setHistory] = useState<ConsideredCandidate[]>([]);
  const steeringActive = steerFocused || steer.trim().length > 0;

  useEffect(() => {
    if (state !== "running" || !plan) return;
    if (steeringActive) return;
    if (revealedCount >= plan.considered.length) {
      setState("done");
      return;
    }
    const timer = window.setTimeout(() => {
      setRevealedCount((current) => current + 1);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [plan, revealedCount, state, steeringActive]);

  const revealed = plan?.considered.slice(0, revealedCount) ?? [];
  const visibleConsidered = [...history, ...revealed];
  const selectedSoFar = visibleConsidered
    .filter((entry) => entry.verdict === "selected")
    .map((entry) => entry.candidate)
    .filter((candidate, index, candidates) =>
      candidates.findIndex((current) => current.id === candidate.id) === index,
    );
  const additions = useMemo(() => {
    const existingIds = new Set(longListIds);
    return plan?.picks.filter((candidate) => !existingIds.has(candidate.id)) ?? [];
  }, [longListIds, plan]);
  const remainingSlots = Math.max(0, 20 - longListIds.length);
  const capacityExceeded = additions.length > remainingSlots;

  const startPlan = () => {
    const nextPlan = buildLongListPlan(brief, constraints);
    setPlan(nextPlan);
    setRevealedCount(0);
    setHistory([]);
    setState("running");
  };

  const submitSteer = (event: FormEvent) => {
    event.preventDefault();
    const nextConstraint = steer.trim();
    if (!nextConstraint) return;
    const nextConstraints = [...constraints, nextConstraint];
    setConstraints(nextConstraints);
    setAdjustments((current) => [...current, `Adjusting — prioritising ${nextConstraint}.`]);
    setHistory((current) => [...current, ...revealed]);
    setPlan(buildLongListPlan(brief, nextConstraints));
    setRevealedCount(0);
    setSteer("");
    setSteerFocused(false);
    setState("running");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AI long-list builder"
      className="fixed inset-0 z-[60] flex h-dvh flex-col overflow-hidden bg-navy-950/95 p-4 backdrop-blur-sm sm:p-6"
    >
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-navy-700 pb-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-400">
            Scripted research simulation
          </p>
          <h2 className="mt-1 font-display text-2xl text-cream-50 sm:text-3xl">
            Let the agent build your long list
          </h2>
        </div>
        <button
          type="button"
          aria-label="Close AI long-list builder"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-navy-700 text-xl text-cream-300 hover:border-gold-500 hover:text-cream-50"
        >
          X
        </button>
      </header>

      {state === "brief" && (
        <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col justify-center py-8">
          <label htmlFor="ai-long-list-brief" className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
            The brief
          </label>
          <textarea
            id="ai-long-list-brief"
            value={brief}
            onChange={(event) => setBrief(event.target.value)}
            rows={6}
            placeholder="An experienced NED to chair the audit committee of my orangutan-farm business"
            className="mt-3 w-full resize-none rounded-2xl border border-navy-700 bg-navy-900 p-5 text-base leading-7 text-cream-50 outline-none placeholder:text-cream-300/45 focus:border-gold-500"
          />
          <button
            type="button"
            onClick={startPlan}
            className="mt-4 self-end rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400"
          >
            Go
          </button>
        </div>
      )}

      {state === "running" && plan && (
        <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col py-5">
          <section aria-label="Agent reasoning log" className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-navy-700 bg-navy-900 p-4 sm:p-5">
            <p className="text-sm leading-6 text-cream-100">{plan.intro}</p>
            {adjustments.map((adjustment, index) => (
              <p key={`${adjustment}-${index}`} className="mt-3 border-l-2 border-gold-500 pl-3 text-sm text-gold-400">
                {adjustment}
              </p>
            ))}
            <ol className="mt-4 space-y-3">
              {visibleConsidered.map((entry, index) => (
                <li key={`${entry.candidate.id}-${index}`} data-testid="ai-considered-line" className="grid gap-1 border-t border-navy-700/70 pt-3 sm:grid-cols-[180px_76px_1fr] sm:gap-3">
                  <span className="font-display text-sm text-cream-50">{entry.candidate.displayName}</span>
                  <span className={entry.verdict === "selected" ? "text-xs font-semibold text-gold-400" : "text-xs text-cream-300"}>
                    {entry.verdict === "selected" ? "✓ selected" : "passed"}
                  </span>
                  <span className="text-xs leading-5 text-cream-300">{entry.reason}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-label="Selected so far" className="mt-3 shrink-0 rounded-xl border border-navy-700 bg-navy-900/70 p-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-cream-300">Selected so far</p>
            <div className="mt-2 flex min-h-6 flex-wrap gap-1.5">
              {selectedSoFar.map((candidate) => (
                <span key={candidate.id} className="rounded-full border border-gold-500/50 px-2.5 py-1 text-[10px] text-cream-100">
                  {candidate.displayName}
                </span>
              ))}
            </div>
          </section>

          <div className="mt-3 flex shrink-0 flex-wrap items-end gap-3">
            <SteerForm
              value={steer}
              onChange={setSteer}
              onFocus={() => setSteerFocused(true)}
              onBlur={() => setSteerFocused(false)}
              onSubmit={submitSteer}
            />
            <button
              type="button"
              onClick={() => {
                setRevealedCount(plan.considered.length);
                setState("done");
              }}
              className="rounded-lg border border-navy-700 px-4 py-2 text-xs text-cream-100 hover:border-gold-500"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => setState("done")}
              className="rounded-lg px-4 py-2 text-xs text-cream-300 hover:text-cream-50"
            >
              Stop
            </button>
          </div>
        </div>
      )}

      {state === "done" && plan && (
        <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col justify-center py-6">
          <section className="min-h-0 overflow-y-auto rounded-2xl border border-gold-500/35 bg-navy-900 p-5 sm:p-7">
            <p className="font-display text-2xl text-cream-50">{plan.summary}</p>
            <p className="mt-2 text-sm text-cream-300">I’ve balanced direct matches with enough range for a credible first conversation.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {plan.picks.map((candidate) => (
                <span key={candidate.id} className="rounded-full border border-gold-500/50 bg-navy-950 px-3 py-1.5 text-xs text-cream-100">
                  {candidate.displayName}
                </span>
              ))}
            </div>
            {capacityExceeded && (
              <p className="mt-4 text-xs text-gold-400">
                Your long list has {remainingSlots} remaining {remainingSlots === 1 ? "place" : "places"}; I’ll add picks in ranked order up to the cap of 20.
              </p>
            )}
          </section>
          <div className="mt-4 flex shrink-0 flex-wrap items-end gap-3">
            <SteerForm
              value={steer}
              onChange={setSteer}
              onFocus={() => setSteerFocused(true)}
              onBlur={() => setSteerFocused(false)}
              onSubmit={submitSteer}
            />
            <button
              type="button"
              onClick={() => {
                setHistory((current) => [...current, ...plan.considered]);
                setRevealedCount(0);
                setAdjustments((current) => [...current, "I’m reopening the search for further direction."]);
                setState("running");
              }}
              className="rounded-full border border-gold-500/50 px-5 py-3 text-sm text-cream-100 hover:border-gold-400"
            >
              Keep refining
            </button>
            <button
              type="button"
              onClick={() => {
                onAddPicks(plan.picks.map((candidate) => candidate.id));
                onClose();
              }}
              className="rounded-full bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400"
            >
              Add to my long list
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
