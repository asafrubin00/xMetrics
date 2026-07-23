"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/session-provider";
import { TRAITS } from "@/lib/traits.config";
import type { Scenario } from "@/lib/types";

function LoadingState() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden px-6">
      <div className="relative max-w-lg text-center">
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full border border-gold-500/15" />
        <p className="relative text-xs font-semibold uppercase tracking-[0.3em] text-gold-400">Scenario preparation</p>
        <h1 className="relative mt-5 font-display text-4xl text-cream-50 sm:text-5xl">Convening the team</h1>
        <p className="relative mt-4 text-sm leading-6 text-cream-300">Reading the fault lines, setting the pressure and bringing the decision into focus.</p>
      </div>
    </main>
  );
}

export default function ScenarioPage() {
  const router = useRouter();
  const { session, setScenario, setChosenOptionId } = useSession();
  const [beatIndex, setBeatIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">(
    session.scenario ? "idle" : "loading",
  );
  const generationStarted = useRef(false);

  const generateScenario = useCallback(async () => {
    setStatus("loading");
    setScenario(undefined);
    setChosenOptionId(undefined);
    setBeatIndex(0);

    try {
      const response = await fetch("/api/scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: session.members,
          signals: session.signals,
          exposures: session.exposures,
          traitDefinitions: TRAITS,
        }),
      });

      if (!response.ok) throw new Error("Scenario request failed");
      const generatedScenario = await response.json() as Scenario;
      setScenario(generatedScenario);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }, [session.exposures, session.members, session.signals, setChosenOptionId, setScenario]);

  useEffect(() => {
    if (session.members.length >= 3 && !session.scenario && !generationStarted.current) {
      generationStarted.current = true;
      void generateScenario();
    }
  }, [generateScenario, session.members.length, session.scenario]);

  if (session.members.length < 3) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-lg"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Scenario unavailable</p><h1 className="mt-4 font-display text-4xl text-cream-50">Bring the team into the room first</h1><p className="mt-4 text-cream-300">A scenario needs at least three team members and their combined signals.</p><Link href="/" className="mt-7 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Build the team</Link></div>
      </main>
    );
  }

  if (status === "loading") return <LoadingState />;

  if (status === "error" || !session.scenario) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-lg"><p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Generation interrupted</p><h1 className="mt-4 font-display text-4xl text-cream-50">The room could not be convened</h1><p className="mt-4 leading-7 text-cream-300">The scenario did not arrive in a form we could use. Your team is still intact.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><Link href="/signals" className="rounded-lg border border-navy-700 px-5 py-3 text-sm text-cream-100">Back to signals</Link><button onClick={() => { generationStarted.current = true; void generateScenario(); }} className="rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Try again</button></div></div>
      </main>
    );
  }

  const scenario = session.scenario;
  const beat = scenario.beats[beatIndex];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-7 sm:px-9 lg:px-14 lg:py-10">
      <header className="border-b border-navy-700/70 pb-5"><div><p className="font-display text-xl text-cream-50">xMetrics</p><p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-400">Pressure scenario</p></div></header>
      <p className="mt-6 max-w-3xl text-sm leading-6 text-cream-300/80">{scenario.companyContext}</p>

      <section className="flex flex-1 flex-col justify-center py-12 lg:py-16">
        <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-400"><span>Beat {beat.index} of 3</span><span className="h-px flex-1 bg-gold-500/20" /></div>
        <h1 className="mt-6 max-w-4xl font-display text-4xl leading-tight text-cream-50 sm:text-5xl lg:text-6xl">{beat.title}</h1>
        <div className="mt-7 max-w-3xl whitespace-pre-line text-base leading-8 text-cream-100">{beat.body}</div>

        {beat.memberMoments.length > 0 && <div className="mt-9 grid gap-4 md:grid-cols-2">{beat.memberMoments.map((memberMoment, index) => { const member = session.members.find((candidate) => candidate.id === memberMoment.memberId); return <blockquote key={`${memberMoment.memberId}-${index}`} className="border-l border-gold-500 bg-navy-900 px-5 py-4"><p className="text-sm leading-6 text-cream-100">{memberMoment.moment}</p><footer className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-400">{member?.displayName} · {member?.role}</footer></blockquote>; })}</div>}

        {beatIndex < 2 ? <div className="mt-10 flex justify-end"><button onClick={() => setBeatIndex((current) => current + 1)} className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400">Continue</button></div> : <div className="mt-12"><p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-400">The decision</p><h2 className="mt-2 font-display text-3xl text-cream-50">Choose the course this team takes</h2><div className="mt-6 grid gap-4 lg:grid-cols-3">{scenario.options.map((option) => <button key={option.id} onClick={() => { setChosenOptionId(option.id); router.push("/debrief"); }} className="group rounded-xl border border-navy-700 bg-navy-900 p-6 text-left transition hover:-translate-y-0.5 hover:border-gold-500/70"><span className="font-display text-xl text-cream-50 group-hover:text-gold-400">{option.title}</span><span className="mt-3 block text-sm leading-6 text-cream-300">{option.description}</span></button>)}</div></div>}
      </section>
    </main>
  );
}
