"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Room, type RoomConnection } from "@/components/room";
import { useSession } from "@/components/session-provider";
import { findingLabel, mostNamedMember } from "@/lib/debrief-highlights";
import {
  createDebriefStreamParser,
  type DebriefSections,
} from "@/lib/debrief-stream";
import { TRAITS } from "@/lib/traits.config";
import type { Debrief, DerivedSignal, TeamMember } from "@/lib/types";

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

function DebriefCard({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 sm:p-8">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">{eyebrow}</p>
      <h2 className="mt-3 font-display text-2xl text-cream-50 sm:text-3xl">{title}</h2>
      <div className="mt-6 whitespace-pre-line text-base leading-8 text-cream-100 min-[1281px]:columns-2 min-[1281px]:gap-12">{text}</div>
    </section>
  );
}

function roomConnections(
  members: TeamMember[],
  signals: DerivedSignal[],
  debrief: Debrief | null,
): RoomConnection[] {
  const polarityConnections = signals
    .filter((signal) => signal.kind === "polarity" && signal.memberIds.length >= 2)
    .map((signal): RoomConnection | null => {
      const involved = signal.memberIds
        .map((id) => members.find((member) => member.id === id))
        .filter((member) => member !== undefined)
        .sort(
          (first, second) =>
            second.traits[signal.traitId] - first.traits[signal.traitId],
        );
      if (involved.length < 2) return null;
      return {
        fromId: involved[0].id,
        toId: involved[involved.length - 1].id,
        kind: "polarity",
      };
    })
    .filter((connection) => connection !== null);

  if (!debrief) return polarityConnections;
  const centralMember = mostNamedMember(members, debrief);
  const dependencyConnections = debrief.investorFindings.flatMap((finding) => {
    if (!/(dependency|bottleneck)/i.test(finding)) return [];
    const named = members.filter((member) =>
      finding.toLowerCase().includes(member.displayName.toLowerCase()),
    );
    if (named.length < 2) return [];
    const target = centralMember && named.some((member) => member.id === centralMember.id)
      ? centralMember
      : named[0];
    return named
      .filter((member) => member.id !== target.id)
      .map((member): RoomConnection => ({
        fromId: member.id,
        toId: target.id,
        kind: "dependency",
      }));
  });

  return [...dependencyConnections, ...polarityConnections];
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
  const [fullAnalysisOpen, setFullAnalysisOpen] = useState(false);
  const generationStarted = useRef(false);
  const currentDebrief = status === "complete"
    ? session.debrief ?? completeDebrief(sections)
    : null;
  const centralMember = currentDebrief
    ? mostNamedMember(session.members, currentDebrief)
    : undefined;
  const connections = useMemo(
    () => roomConnections(session.members, session.signals, currentDebrief),
    [currentDebrief, session.members, session.signals],
  );

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
          <h1 className="mt-4 font-display text-3xl text-cream-50 sm:text-4xl">A decision must come first</h1>
          <p className="mt-4 leading-7 text-cream-300">Run the team through a scenario and choose a course before opening the investor debrief.</p>
          <Link href="/scenario" className="mt-7 inline-block rounded-lg bg-gold-500 px-5 py-3 text-sm font-semibold text-navy-950">Return to scenario</Link>
        </div>
      </main>
    );
  }

  const chosenOption = session.scenario.options.find(
    (option) => option.id === session.chosenOptionId,
  );
  const whatHappenedParagraphs = sections.whatHappened
    ?.split(/\n\s*\n/)
    .filter(Boolean) ?? [];
  const findingCount = currentDebrief?.investorFindings.length;

  if (status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-400">Debrief interrupted</p>
          <h1 className="mt-4 font-display text-3xl text-cream-50 sm:text-4xl">The analysis could not be completed</h1>
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
    <main className="mx-auto min-h-screen w-full max-w-[1680px] px-5 py-7 sm:px-9 lg:px-12 lg:py-9">
      <header className="border-b border-navy-700/70 pb-5">
        <p className="font-display text-xl text-cream-50">xMetrics</p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-gold-400">Investor debrief</p>
      </header>
      <h1 className="py-6 font-display text-3xl leading-tight text-cream-50 sm:text-4xl">What this team revealed</h1>

      <section className="grid items-center gap-7 border-b border-navy-700/70 pb-7 lg:grid-cols-[minmax(0,40%)_minmax(0,60%)] lg:gap-10">
        <div>
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">The room</p>
          <div className="mx-auto w-full max-w-[620px]">
            <Room members={session.members} connections={connections} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="max-w-3xl text-sm leading-6 text-cream-300/80">{session.scenario.companyContext}</p>
          <div aria-label="Debrief takeaways" className="mt-5 overflow-hidden rounded-xl border border-navy-700 bg-navy-900">
            <div className="border-b border-navy-700 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Chosen course</p>
              <p className="mt-1 font-display text-lg text-cream-50">{chosenOption?.title}</p>
            </div>
            <div className="border-b border-navy-700 p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Investor findings</p>
              <p className="mt-1 font-display text-lg text-cream-50">{findingCount ?? "Analysis in progress"}</p>
            </div>
            <div className="p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold-400">Most named</p>
              <p className="mt-1 font-display text-lg text-cream-50">{centralMember?.displayName ?? "Analysis in progress"}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 space-y-5">
      {sections.whatHappened !== undefined && (
        <section className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">01 · Team dynamics</p>
          <h2 className="mt-3 font-display text-2xl text-cream-50 sm:text-3xl">What happened here</h2>
          <div className="min-[1281px]:columns-2 min-[1281px]:gap-12">
            {whatHappenedParagraphs[0] && <p className="mt-6 text-base leading-8 text-cream-100">{whatHappenedParagraphs[0]}</p>}
            {fullAnalysisOpen && whatHappenedParagraphs.slice(1).map((paragraph, index) => (
              <p key={index} className="mt-5 text-base leading-8 text-cream-100">{paragraph}</p>
            ))}
          </div>
          {whatHappenedParagraphs.length > 1 && (
            <button type="button" aria-expanded={fullAnalysisOpen} onClick={() => setFullAnalysisOpen((open) => !open)} className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-gold-400">
              {fullAnalysisOpen ? "Show less" : "Read the full analysis"}
            </button>
          )}
        </section>
      )}
      {sections.choiceAnalysis !== undefined && <DebriefCard eyebrow="02 · Execution" title="The choice they made" text={sections.choiceAnalysis} />}
      {sections.investorFindings !== undefined && (
        <section className="rounded-2xl border border-navy-700 bg-navy-900/60 p-6 sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-gold-400">03 · Diligence</p>
          <h2 className="mt-3 font-display text-2xl text-cream-50 sm:text-3xl">Investor lens</h2>
          <ul className="mt-7 grid gap-4 lg:grid-cols-2 min-[1600px]:!grid-cols-3">
            {findingsFromText(sections.investorFindings).map((finding) => (
              <li key={finding} className="rounded-xl border border-navy-700 bg-navy-950/50 p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-400">{findingLabel(finding)}</p>
                <p className="mt-3 text-sm leading-6 text-cream-100">{finding.replace(/\*\*/g, "")}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
      {sections.whatWouldChange !== undefined && <DebriefCard eyebrow="04 · Composition" title="What would change the picture" text={sections.whatWouldChange} />}
      </div>

      {status === "loading" && (
        <div className="mt-5 rounded-2xl border border-navy-700/70 py-10 text-center">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-gold-500" />
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-cream-300">Building the investor view</p>
        </div>
      )}

      {status === "complete" && (
        <footer className="mt-8 border-t border-navy-700/70 py-8">
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
