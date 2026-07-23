"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/session-provider";
import {
  createDebriefStreamParser,
  type DebriefSections,
} from "@/lib/debrief-stream";
import { TRAITS } from "@/lib/traits.config";
import type { Debrief } from "@/lib/types";

function findingsFromText(text: string): string[] {
  return text
    .split("\n")
    .map((finding) => finding.trim().replace(/^(?:[-*•]|\d+[.)])\s*/, ""))
    .filter(Boolean);
}

function completeDebrief(sections: DebriefSections): Debrief | null {
  if (sections.whatHappened === undefined ||
    sections.choiceAnalysis === undefined ||
    sections.investorFindings === undefined ||
    sections.whatWouldChange === undefined) {
    return null;
  }

  return {
    whatHappened: sections.whatHappened,
    choiceAnalysis: sections.choiceAnalysis,
    investorFindings: findingsFromText(sections.investorFindings),
    whatWouldChange: sections.whatWouldChange,
  };
}

function sectionsFromDebrief(debrief: Debrief | undefined): DebriefSections {
  if (!debrief) return {};
  return {
    whatHappened: debrief.whatHappened,
    choiceAnalysis: debrief.choiceAnalysis,
    investorFindings: debrief.investorFindings.map((finding) => `- ${finding}`).join("\n"),
    whatWouldChange: debrief.whatWouldChange,
  };
}

function NarrativeSection({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="border-t border-navy-700/70 py-10 sm:py-14">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl text-cream-50 sm:text-4xl">{title}</h2>
      <div className="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-cream-100">{text}</div>
    </section>
  );
}

export default function DebriefPage() {
  const router = useRouter();
  const {
    session,
    setDebrief,
    clearGenerated,
    startOver,
  } = useSession();
  const [sections, setSections] = useState<DebriefSections>(
    sectionsFromDebrief(session.debrief),
  );
  const [status, setStatus] = useState<"loading" | "complete" | "error">(
    session.debrief ? "complete" : "loading",
  );
  const generationStarted = useRef(false);

  const generateDebrief = useCallback(async () => {
    if (!session.scenario || !session.chosenOptionId) return;

    setStatus("loading");
    setSections({});
    setDebrief(undefined);
    const parser = createDebriefStreamParser();
    let latestSections: DebriefSections = {};

    try {
      const response = await fetch("/api/debrief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          members: session.members,
          signals: session.signals,
          exposures: session.exposures,
          traitDefinitions: TRAITS,
          scenario: session.scenario,
          chosenOptionId: session.chosenOptionId,
        }),
      });

      if (!response.ok || !response.body) throw new Error("Debrief request failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        latestSections = parser.push(decoder.decode(value, { stream: true }));
        setSections({ ...latestSections });
      }

      const finalText = decoder.decode();
      if (finalText) {
        latestSections = parser.push(finalText);
        setSections({ ...latestSections });
      }

      const debrief = completeDebrief(latestSections);
      if (!debrief) throw new Error("Debrief sections were incomplete");
      setDebrief(debrief);
      setStatus("complete");
    } catch {
      setStatus("error");
    }
  }, [
    session.chosenOptionId,
    session.exposures,
    session.members,
    session.scenario,
    session.signals,
    setDebrief,
  ]);

  useEffect(() => {
    if (session.scenario &&
      session.chosenOptionId &&
      !session.debrief &&
      !generationStarted.current) {
      generationStarted.current = true;
      void generateDebrief();
    }
  }, [
    generateDebrief,
    session.chosenOptionId,
    session.debrief,
    session.scenario,
  ]);

  if (!session.scenario || !session.chosenOptionId) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Debrief unavailable</p>
          <h1 className="mt-4 font-display text-4xl text-cream-50">A decision must come first</h1>
          <p className="mt-4 leading-7 text-cream-300">Run the team through a scenario and choose a course before opening the investor debrief.</p>
          <Link href="/scenario" className="mt-7 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Return to scenario</Link>
        </div>
      </main>
    );
  }

  const chosenOption = session.scenario.options.find(
    (option) => option.id === session.chosenOptionId,
  );

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Debrief interrupted</p>
          <h1 className="mt-4 font-display text-4xl text-cream-50">The analysis could not be completed</h1>
          <p className="mt-4 leading-7 text-cream-300">The scenario and team are still intact. You can retry the debrief without repeating the decision.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/scenario" className="rounded-lg border border-navy-700 px-5 py-3 text-sm text-cream-100">Back to scenario</Link>
            <button onClick={() => { generationStarted.current = true; void generateDebrief(); }} className="rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Try again</button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-5 py-8 sm:px-9 lg:px-14 lg:py-12">
      <header className="border-b border-navy-700/70 pb-6">
        <p className="font-display text-xl text-cream-50">xMetrics</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-400">Investor debrief</p>
      </header>
      <div className="py-10 sm:py-14">
        <p className="max-w-3xl text-sm leading-6 text-cream-300/80">{session.scenario.companyContext}</p>
        <h1 className="mt-7 font-display text-5xl leading-tight text-cream-50 sm:text-6xl">What this team revealed</h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-cream-300">Chosen course: <span className="text-cream-100">{chosenOption?.title}</span></p>
      </div>

      {sections.whatHappened !== undefined && <NarrativeSection eyebrow="01 · Team dynamics" title="What happened here" text={sections.whatHappened} />}
      {sections.choiceAnalysis !== undefined && <NarrativeSection eyebrow="02 · Execution" title="The choice they made" text={sections.choiceAnalysis} />}
      {sections.investorFindings !== undefined && (
        <section className="border-t border-navy-700/70 py-10 sm:py-14">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">03 · Diligence</p>
          <h2 className="mt-3 font-display text-3xl text-cream-50 sm:text-4xl">Investor lens</h2>
          <ul className="mt-7 grid gap-4">
            {findingsFromText(sections.investorFindings).map((finding) => (
              <li key={finding} className="border-l border-gold-500 bg-navy-900 px-5 py-4 text-sm leading-6 text-cream-100">{finding}</li>
            ))}
          </ul>
        </section>
      )}
      {sections.whatWouldChange !== undefined && <NarrativeSection eyebrow="04 · Composition" title="What would change the picture" text={sections.whatWouldChange} />}

      {status === "loading" && (
        <div className="border-t border-navy-700/70 py-10 text-center">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold-500" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cream-300">Building the investor view</p>
        </div>
      )}

      {status === "complete" && (
        <footer className="border-t border-navy-700/70 py-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button onClick={() => { clearGenerated(); router.push("/scenario"); }} className="rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Run a different scenario</button>
            <button onClick={() => router.push("/")} className="rounded-lg border border-navy-700 px-5 py-3 text-sm text-cream-100">Adjust the team</button>
            <button onClick={() => { startOver(); router.push("/"); }} className="rounded-lg px-5 py-3 text-sm text-cream-300 hover:text-cream-50">Start over</button>
          </div>
        </footer>
      )}
    </main>
  );
}
