"use client";

import Link from "next/link";
import { useState } from "react";

const fieldClass =
  "mt-2 w-full rounded-lg border border-navy-700 bg-navy-950 px-3 py-3 text-sm text-cream-100 opacity-100 disabled:cursor-not-allowed disabled:text-cream-300";

export default function CustomisePage() {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <main className="min-h-screen px-5 py-7 sm:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-6xl">
        <Link href="/" className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400 hover:text-gold-300">
          ← Go back
        </Link>

        <div className="mt-8 rounded-xl border border-gold-500/30 bg-gold-500/[0.06] px-4 py-3 text-sm text-cream-300 sm:px-5">
          For illustrative purposes only — this page does not yet generate scenarios.
        </div>

        <header className="max-w-3xl py-10 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-400">Custom scenario</p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-cream-50 sm:text-5xl">
            Build the scenario you want to test this team against.
          </h1>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <fieldset disabled className="rounded-2xl border border-navy-700 bg-navy-900 p-5 sm:p-7">
            <legend className="px-2 font-display text-2xl text-cream-50">The company</legend>
            <div className="mt-2 grid gap-5 sm:grid-cols-2">
              <label className="text-sm text-cream-300">Name<input className={fieldClass} defaultValue="Veridian Health Technologies" /></label>
              <label className="text-sm text-cream-300">Sector<input className={fieldClass} defaultValue="Digital health" /></label>
              <label className="text-sm text-cream-300">
                Stage
                <select className={fieldClass} defaultValue="Series C">
                  {["Series A", "Series B", "Series C", "Growth", "PE-backed", "Listed"].map((stage) => <option key={stage}>{stage}</option>)}
                </select>
              </label>
              <label className="text-sm text-cream-300">Headcount<input className={fieldClass} defaultValue="340" /></label>
              <label className="text-sm text-cream-300">Revenue<input className={fieldClass} defaultValue="£48m ARR" /></label>
              <label className="text-sm text-cream-300">Geography<input className={fieldClass} defaultValue="UK and Germany" /></label>
              <label className="text-sm text-cream-300 sm:col-span-2">Ownership notes<input className={fieldClass} defaultValue="Single institutional investor holding 38%" /></label>
            </div>
          </fieldset>

          <fieldset disabled className="rounded-2xl border border-navy-700 bg-navy-900 p-5 sm:p-7">
            <legend className="px-2 font-display text-2xl text-cream-50">The situation</legend>
            <div className="mt-2 grid gap-5">
              <label className="text-sm text-cream-300">
                Situation type
                <select className={fieldClass} defaultValue="acquisition approach">
                  {["funding pressure", "customer loss", "regulatory action", "leadership dispute", "acquisition approach", "product failure"].map((type) => <option key={type}>{type}</option>)}
                </select>
              </label>
              <label className="text-sm text-cream-300">Time pressure<input className={fieldClass} defaultValue="Forty-five day exclusivity window" /></label>
              <label className="text-sm text-cream-300">
                Scenario premise
                <textarea
                  className={`${fieldClass} min-h-40 resize-none leading-6`}
                  defaultValue="A listed European healthcare group has made an unsolicited approach at a significant premium, conditional on forty-five days of exclusivity. The board must decide whether to enter talks while a major NHS contract renewal and a product launch are both at critical stages."
                />
              </label>
            </div>
          </fieldset>
        </div>

        <section aria-disabled="true" className="mt-8 rounded-2xl border border-navy-700 bg-navy-900/40 p-5 opacity-60 sm:p-7">
          <h2 className="font-display text-2xl text-cream-100">Beats</h2>
          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            {[
              ["Beat 1 — Setup", "Establish the trigger, stakes and initial information available to the team."],
              ["Beat 2 — Escalation", "Introduce new pressure, competing priorities and a narrowing window to act."],
              ["Beat 3 — Decision point", "Frame the consequential choice the team must make together."],
            ].map(([title, description]) => (
              <div key={title} className="rounded-xl border border-dashed border-navy-700 p-5">
                <h3 className="font-display text-lg text-cream-100">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-cream-300">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="py-10">
          <button
            type="button"
            onClick={() => setShowMessage(true)}
            className="rounded-lg bg-gold-500 px-6 py-3 text-sm font-semibold text-navy-950 hover:bg-gold-400"
          >
            Generate scenario
          </button>
          {showMessage && (
            <p role="status" className="mt-4 text-sm text-cream-300">
              Not yet connected — this is where a custom scenario would be generated.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
