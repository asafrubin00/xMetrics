# xMetrics — Product Spec (v0.1)

Companion to `xmetrics-foundation.md` (problem statement, trait schema, design principles). Read that first. This document defines the prototype's screens, flow, data model, and AI generation architecture. Together the two documents are a complete implementation brief.

**Tagline:** psychometrics, multiplied.

---

## 1. Stack

- Next.js (App Router), TypeScript, React, Tailwind CSS
- Deployed on Vercel; repo on GitHub (`asafrubin00`)
- Local development path: `~/Developer/xmetrics` (never an iCloud-synced folder)
- AI: Anthropic API, Claude Haiku or Sonnet, streaming, called from a Next.js API route. API key in Vercel/`.env.local` env var `ANTHROPIC_API_KEY`; never client-side.
- No database. All state client-side in React; a session lives and dies in the browser tab. `localStorage` may be used to persist the current team between reloads, nothing more.

## 2. User flow (single path, four screens)

```
[1] Team Builder → [2] Team Signals → [3] Scenario → [4] Debrief
```

A demo run takes under 10 minutes. Every screen must be presentable to an investor audience cold.

---

## 3. Screen 1 — Team Builder

Purpose: assemble a team of 3–6 members with psychometric profiles.

### Layout
- Header: product name, tagline.
- Team roster: cards for each member (name, role, mini trait summary). Add / edit / remove.
- Two ways to add a member:
  1. **Preset personas** (primary demo path): a library of ~10 pre-built profiles with realistic names, roles, and trait scores (defined in `personas.config.ts`). One click to add.
  2. **Manual entry**: name, role, and 16 sliders (0–100) grouped by the four trait groups. Sliders show the low/high descriptors from `traits.config.ts`, not numbers alone.
- A "Load demo team" button that populates a pre-designed 5-person team with deliberately interesting dynamics (one concentration, one vacuum, one polarity — see foundation spec §3 derived signals). This is the 10-second path to a demo.
- Continue button (enabled at 3+ members).

### Preset persona design guidance
Personas must be trait-coherent (a cautious CFO shouldn't have risk_appetite 90) and collectively cover the interesting derived signals. Include at least: two high-dominance profiles (to enable concentration), one profile weak on all Group A traits (to enable vacuum), pairs at opposite extremes of conflict_approach and optimism_bias (to enable polarity). Mixed genders and naming conventions.

## 4. Screen 2 — Team Signals

Purpose: show the computed team-level picture before the scenario, so the audience sees the analysis isn't generic.

- Radar or grouped bar visualisation of the team's trait spread (per trait: min, max, mean — polarity gaps visually obvious).
- Derived signal cards, computed per foundation spec §3: each concentration, vacuum, and polarity detected, stated in plain behavioural language with the members named. E.g. "Contested leadership: Sarah and Marcus both score high on dominance. Under pressure, expect competing decisions rather than a shared one."
- Pressure profile strip: each member's Group D exposure summarised in one line.
- Continue button: "Run scenario".

Computation rules (deterministic, in `signals.ts`, unit-tested):
- Concentration: ≥2 members with the same Group A trait ≥ 75.
- Vacuum: no member ≥ 60 on a given Group A or Group C trait.
- Polarity: any pair with ≥ 40-point gap on the same trait.
- Pressure exposure: for each member, their most extreme Group D score (distance from 50) defines their headline stress behaviour.

## 5. Screen 3 — Scenario

Purpose: the immersive core. A bespoke pressure scenario generated from this team's actual signals.

### Structure
A scenario is a 3-beat narrative arc, AI-generated per team:

1. **Beat 1 — Setup**: a company context (AI picks archetype: e.g. Series B SaaS burning fast, family-owned manufacturer facing succession, fintech under regulatory scrutiny) and an inciting pressure event. The team members appear in their stated roles.
2. **Beat 2 — Escalation**: the pressure sharpens and is targeted at the team's derived signals — the escalation must stress the specific concentration/vacuum/polarity findings, not generic drama.
3. **Beat 3 — Decision point**: the team reaches a fork. The narrative describes how each member is behaving at this moment (grounded in their traits), then presents 3 strategic options.

The **user picks one option** (this preserves BoardCraft-style interactivity and gives the debrief a concrete choice to analyse). No branching tree beyond this single choice — one decision is enough for the prototype.

### Presentation
- Full-screen narrative panels, one beat at a time, "Continue" between beats. Serif headings, generous whitespace, dark navy/gold palette.
- Member behaviour moments rendered as attributed vignettes within the prose (e.g. a pull-quote style callout: what Sarah does, what Marcus says), so individuals are visibly *behaving*, not just described.
- Options presented as three cards with a title and a 2-sentence description each. No scores, no multipliers, no "best answer" signalling (foundation spec §4.2).

### Generation
- One API call at scenario start generates all three beats + options as structured JSON (system prompt instructs JSON-only output; parse defensively, strip code fences).
- The prompt receives: full team roster with trait scores, the computed derived signals, and the trait definitions (descriptors + pressure notes) from config. It is instructed to ground every behavioural moment in named members' actual trait positions and to target escalation at the derived signals.
- Loading state: an elegant "convening the team" interstitial, not a spinner alone.
- Failure state: retry button with a graceful message. Never render half-parsed JSON.

## 6. Screen 4 — Debrief

Purpose: the payoff. Turns the scenario into diligence evidence.

### Content (AI-generated, streaming)
A second API call receives: everything from the scenario call, plus the user's chosen option. It produces a debrief with this structure:

1. **What happened here** — 2–3 paragraphs of governance-grade reasoning about the team's dynamics through the scenario, citing named members, named trait interactions, and concrete scenario moments. Standard per foundation spec §4.1: specificity or nothing.
2. **The choice they made** — analysis of the selected option *as this team would execute it*: where their composition helps, where it exposes them. Not "right/wrong" — "here is the execution risk."
3. **Investor lens** — 3–4 bullet-style findings phrased as diligence observations (e.g. key-person dependency, decision bottleneck, unmanaged friction line), the language a VC would put in an IC memo.
4. **What would change the picture** — 1–2 sentences on what a different team composition or added hire would alter. (This is the quiet bridge to Ammaar's recruitment-matching idea; keep it understated.)

### Presentation
- Full-screen modal or dedicated page in the BoardCraft Debrief style: serif headings, measured typography, no gamified score language.
- Streamed text with section-by-section reveal.
- Footer actions: "Run a different scenario" (re-roll with same team), "Adjust the team" (back to Screen 1, preserving members), "Start over".

## 7. Data model (TypeScript)

```ts
// See xmetrics-foundation.md for TraitDefinition and TeamMember.

export interface DerivedSignal {
  kind: "concentration" | "vacuum" | "polarity";
  traitId: string;
  memberIds: string[];       // involved members ([] for vacuum)
  narrative: string;          // plain-language behavioural statement
}

export interface PressureExposure {
  memberId: string;
  traitId: string;            // Group D trait, most extreme
  direction: "low" | "high";
  narrative: string;
}

export interface ScenarioBeat {
  index: 1 | 2 | 3;
  title: string;
  body: string;               // narrative prose
  memberMoments: { memberId: string; moment: string }[];
}

export interface StrategyOption {
  id: string;
  title: string;
  description: string;
}

export interface Scenario {
  companyContext: string;
  beats: [ScenarioBeat, ScenarioBeat, ScenarioBeat];
  options: StrategyOption[];  // exactly 3
}

export interface Debrief {
  whatHappened: string;
  choiceAnalysis: string;
  investorFindings: string[];
  whatWouldChange: string;
}

export interface Session {
  members: TeamMember[];
  signals: DerivedSignal[];
  exposures: PressureExposure[];
  scenario?: Scenario;
  chosenOptionId?: string;
  debrief?: Debrief;
}
```

## 8. API routes

- `POST /api/scenario` — body: `{ members, signals, exposures, traitDefinitions }` → returns `Scenario` JSON. Non-streaming (structured output).
- `POST /api/debrief` — body: scenario call payload + `{ scenario, chosenOptionId }` → streams the `Debrief` sections as text (SSE or chunked). Section delimiters agreed in the prompt so the client can reveal progressively.

Both routes: server-side only, defensive JSON parsing, 60s timeout, one retry on parse failure.

## 9. Build order (for implementation prompts)

1. Repo scaffold, Tailwind theme (navy/gold/serif), config files (`traits.config.ts`, `personas.config.ts`).
2. `signals.ts` with unit tests (vitest) — deterministic logic first.
3. Screen 1 + Screen 2, fully working without AI.
4. `/api/scenario` + Screen 3.
5. `/api/debrief` + Screen 4.
6. Polish pass: loading states, failure states, mobile check.

Each step is a separate implementation prompt; verify each against the repo (run `vitest` and `tsc --noEmit`) before moving to the next.

## 10. Explicitly out of scope

Auth, database, multi-user, live psychometric engine integration, questionnaire administration, recruitment matching, validity claims, payment.
