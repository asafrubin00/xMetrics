"use client";

import Link from "next/link";
import { useSession } from "@/components/session-provider";
import { TRAITS } from "@/lib/traits.config";

const signalLabels = {
  concentration: "Concentration",
  vacuum: "Vacuum",
  polarity: "Polarity",
} as const;

export default function TeamSignals() {
  const { session } = useSession();

  if (session.members.length < 3) {
    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <div className="max-w-lg text-center"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Team signals</p><h1 className="mt-3 font-display text-4xl text-cream-50">The room is not assembled yet</h1><p className="mt-4 text-cream-300">Add at least three people before examining how the team may operate together.</p><Link href="/" className="mt-7 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Return to team builder</Link></div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-navy-700/70 pb-8"><div><Link href="/" className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">← Adjust team</Link><h1 className="mt-4 font-display text-4xl text-cream-50 sm:text-5xl">Team signals</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-cream-300">The patterns below show where this team aligns, where capability is absent, and where opposing instincts may produce friction.</p></div><p className="text-sm text-cream-300">{session.members.length} people assessed</p></header>

      <div className="grid gap-10 py-10 xl:grid-cols-[1.2fr_0.8fr]">
        <section aria-labelledby="trait-spread-heading"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Distribution</p><h2 id="trait-spread-heading" className="mt-2 font-display text-3xl text-cream-50">Trait spread</h2><div className="mt-6 space-y-8">{(["drive", "thinking", "interpersonal", "pressure"] as const).map((group) => <div key={group}><h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-cream-300">{group}</h3><div className="space-y-4">{TRAITS.filter((trait) => trait.group === group).map((trait) => { const scores = session.members.map((member) => member.traits[trait.id]); const minimum = Math.min(...scores); const maximum = Math.max(...scores); return <div key={trait.id} className="grid gap-2 sm:grid-cols-[180px_1fr]"><p className="text-sm text-cream-100">{trait.name}</p><div className="relative h-5" aria-label={`${trait.name} spread`}><div className="absolute inset-x-0 top-2 h-px bg-navy-700" /><div className="absolute top-[6px] h-1 rounded-full bg-gold-500/45" style={{ left: `${minimum}%`, width: `${maximum - minimum}%` }} />{session.members.map((member, index) => <span key={member.id} title={`${member.displayName}: ${trait.name}`} className="absolute top-1 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-gold-400 bg-navy-950" style={{ left: `${member.traits[trait.id]}%`, transform: `translate(-50%, ${index % 2 === 0 ? "-1px" : "3px"})` }} />)}</div></div>; })}</div></div>)}</div></section>

        <section aria-labelledby="findings-heading"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Findings</p><h2 id="findings-heading" className="mt-2 font-display text-3xl text-cream-50">What stands out</h2><div className="mt-6 space-y-7">{session.signals.length === 0 ? <p className="rounded-xl border border-navy-700 bg-navy-900 p-5 text-sm leading-6 text-cream-300">No threshold-level concentrations, vacuums or polarities appear in this team.</p> : (["concentration", "vacuum", "polarity"] as const).map((kind) => { const findings = session.signals.filter((signal) => signal.kind === kind); if (findings.length === 0) return null; return <div key={kind}><h3 className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-gold-400">{signalLabels[kind]}</h3><div className="space-y-4">{findings.map((signal) => <article data-testid="signal-card" key={`${signal.kind}-${signal.traitId}-${signal.memberIds.join("-")}`} className="rounded-xl border border-navy-700 bg-navy-900 p-5"><p className="text-sm leading-6 text-cream-100">{signal.narrative}</p></article>)}</div></div>; })}</div></section>
      </div>

      <section className="border-y border-navy-700/70 py-8"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">Under pressure</p><h2 className="mt-2 font-display text-3xl text-cream-50">Pressure profile</h2><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{session.exposures.map((exposure) => <div key={exposure.memberId} className="border-l border-gold-500/60 bg-navy-900/60 px-4 py-3 text-sm leading-6 text-cream-100">{exposure.narrative}</div>)}</div></section>

      <footer className="flex flex-wrap items-center justify-between gap-5 py-8"><p className="max-w-xl text-xs leading-5 text-cream-300">These signals describe likely team dynamics, not individual capability or a validated assessment outcome.</p><Link href="/scenario" className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400">Run scenario</Link></footer>
    </main>
  );
}
