# xMetrics — Implementation Prompts (Codex)

You are implementing a prototype called **xMetrics** ("psychometrics, multiplied"). Two specification documents accompany this file and are the source of truth:

- `xmetrics-foundation.md` — problem statement, 16-trait schema, derived signals, design principles
- `xmetrics-product-spec.md` — screens, flow, data model, API routes, build order

Read both fully before writing any code.

## Operating protocol — read first

1. Work through the steps below **strictly one at a time, in order**. Never start a step before being told to proceed.
2. At the end of each step: run `npx vitest run` and `npx tsc --noEmit`, fix anything failing, then **stop** and report: what was built, files touched, test results. Wait for confirmation before continuing.
3. Commit at the end of each step with a clear message (`step 1: scaffold, theme, configs`, etc.) and push to the remote when asked.
4. If a spec detail is ambiguous, make the smallest reasonable choice, note it in your step report, and continue. Do not redesign anything the specs already decide.
5. Never hardcode trait names or semantics outside `traits.config.ts`. Never expose scores, multipliers, or "correct answer" signals in the UI. These are hard rules from the foundation spec.
6. The Anthropic API key lives in `.env.local` as `ANTHROPIC_API_KEY` and is only ever read server-side.

---

## Step 1 — Scaffold, theme, config files

Create a Next.js (App Router) + TypeScript + Tailwind project in the current directory (repo `xmetrics`).

1. Scaffold with `create-next-app` (TypeScript, Tailwind, App Router, no src dir preference — your call, ESLint yes).
2. Install `vitest` and configure it for TS. Add scripts: `test` → `vitest run`, `typecheck` → `tsc --noEmit`.
3. Tailwind theme per product spec §1 and foundation spec §4.4: extend the palette with a dark navy background family (e.g. `#0A1628` base, lighter navy surfaces), gold accent (e.g. `#C9A227`), warm off-white text. Add a serif display font (Playfair Display or Source Serif 4 via `next/font`) for headings and a clean sans (Inter) for body. Global styles: dark background by default across the app.
4. Create `lib/traits.config.ts` implementing `TraitDefinition` and all 16 traits exactly as defined in foundation spec §3, including group, low/high descriptors, and `pressureNote` for the four Group D traits (write pressure notes for Groups A–C too where the foundation spec's table implies them; keep them one sentence).
5. Create `lib/types.ts` with all interfaces from product spec §7 plus `TeamMember` from the foundation spec.
6. Create `lib/personas.config.ts`: 10 preset personas per product spec §3 guidance — trait-coherent, mixed genders and naming conventions, realistic names and roles (CEO, CFO, CTO, COO, CPO, CRO, VP Eng, GC, etc.). Ensure the set collectively enables: a dominance concentration, a Group A vacuum team, and polarity pairs on `conflict_approach` and `optimism_bias`. Also define `DEMO_TEAM`: an array of 5 persona ids that together trigger at least one concentration, one vacuum, and one polarity.
7. Write a basic vitest test asserting: 16 traits exist, 4 per group, all persona trait maps contain exactly the 16 trait ids with values 0–100.

Report and stop.

## Step 2 — Signals engine

Create `lib/signals.ts` implementing product spec §4 computation rules exactly:

1. `computeSignals(members: TeamMember[]): DerivedSignal[]`
   - Concentration: ≥2 members with the same **Group A** trait ≥ 75 → one signal per trait, listing all qualifying members.
   - Vacuum: no member ≥ 60 on a given **Group A or Group C** trait → one signal per trait.
   - Polarity: any pair with a ≥ 40-point gap on the **same trait** (any group) → one signal per qualifying pair+trait. If multiple pairs qualify on one trait, emit each pair separately.
2. `computeExposures(members: TeamMember[]): PressureExposure[]` — for each member, their Group D trait with the greatest distance from 50, with direction.
3. Each signal/exposure includes a `narrative` string: plain behavioural language naming the members and using the trait descriptors from config (pull descriptor text from `traits.config.ts`; do not restate trait semantics in `signals.ts`). Narratives must read as human analysis, not templates with visible slots — vary sentence structure across signal kinds.
4. Comprehensive vitest coverage: hand-built member fixtures that trigger each rule, boundary cases (exactly 75, exactly 60, exactly 40-gap — inclusive thresholds), a team with no signals, and a test that `DEMO_TEAM` personas produce ≥1 of each signal kind.

Report and stop.

## Step 3 — Screens 1 & 2 (no AI)

Implement Team Builder and Team Signals per product spec §3–4.

1. **State**: a React context or top-level state holder for `Session` (product spec §7). Persist `members` to `localStorage`; restore on load. No other persistence.
2. **Screen 1 — Team Builder** (`/`): header with name + tagline "psychometrics, multiplied"; roster cards (name, role, a compact trait summary — e.g. each member's two most extreme traits in words, not numbers); add via persona picker (grid of the 10 presets) or manual form (name, role, 16 sliders grouped by trait group, each slider labelled with low/high descriptors); edit and remove; "Load demo team" button that replaces the roster with `DEMO_TEAM`; Continue enabled at 3–6 members.
3. **Screen 2 — Team Signals** (`/signals`): trait-spread visualisation (grouped horizontal bars per trait showing min–max range with member dots is acceptable and clearer than radar at 16 traits — implementer's choice, but must make polarity gaps visually obvious); signal cards for each derived signal with kind badge (concentration / vacuum / polarity) and narrative; pressure profile strip (one line per member from exposures); "Run scenario" button.
4. Styling per theme: this must look like a premium diligence product, not an admin dashboard. Serif headings, generous spacing, restrained gold accents. No emoji, no toy-like iconography.
5. Screens fully functional and navigable with zero AI calls. Both must be presentable on a laptop screen without scrolling feeling broken; check a 1280px and a 390px viewport.
6. Tests: persistence round-trip for members; a render test asserting the demo team produces signal cards on Screen 2.

Report and stop.

## Step 4 — Scenario generation + Screen 3

1. **`POST /api/scenario`** per product spec §8: accepts `{ members, signals, exposures, traitDefinitions }`, calls the Anthropic API (model `claude-sonnet-4-6`, non-streaming), returns validated `Scenario` JSON.
   - System prompt requirements (write it carefully — this is the product's core): respond with JSON only, no fences; produce `companyContext`, exactly 3 beats, exactly 3 options per product spec §5; every beat's `memberMoments` must reference real `memberId`s and ground behaviour in that member's actual trait positions and pressure notes; Beat 2's escalation must explicitly target the supplied derived signals; Beat 3 describes each member's behaviour at the decision point; options must be genuinely strategic alternatives with different risk shapes, no telegraphed best answer; British English; no melodrama — tense but professional, the register of an FT long-read.
   - Server-side: validate the parsed object against the `Scenario` shape (a small hand-rolled validator or zod); one retry on parse/validation failure; 60s timeout; on final failure return a 502 with a clean error body.
2. **Screen 3** (`/scenario`): on entry, if no scenario in session, call the API with a full-screen "convening the team" interstitial (subtle animation, on-theme); render beats one at a time with a Continue control; member moments as attributed callouts visually distinct from body prose; after Beat 3, the three option cards; selecting one stores `chosenOptionId` and navigates to `/debrief`. Failure state: graceful message + retry.
3. Tests: validator unit tests (valid scenario passes; wrong beat count, unknown memberId, missing options all fail). Mock the Anthropic call in tests — never hit the live API from vitest.

Report and stop.

## Step 5 — Debrief generation + Screen 4

1. **`POST /api/debrief`** per product spec §8: accepts the scenario payload plus `{ scenario, chosenOptionId }`; calls the Anthropic API with streaming; streams text to the client (chunked response is fine).
   - System prompt requirements: produce the four sections from product spec §6 in order, separated by exact delimiter lines (`===SECTION:whatHappened===` etc.) so the client can split progressively; the specificity standard from foundation spec §4.1 applies — every analytical claim must cite named members, trait interactions, or concrete scenario moments; section 2 analyses the chosen option as execution risk, not right/wrong; section 3 is 3–4 findings in IC-memo register; section 4 is 1–2 sentences, understated; British English; no scores, no grades, no gamified language.
2. **Screen 4** (`/debrief`): full-screen debrief in the premium style; sections reveal progressively as their delimiters arrive; serif section headings; investor findings rendered as a clean list. Footer actions per product spec §6: "Run a different scenario" (clears scenario+choice+debrief, back to `/scenario` for a fresh generation with the same team), "Adjust the team" (back to `/`, members preserved), "Start over" (clears session including localStorage).
3. Tests: delimiter-splitting logic unit-tested against a synthetic streamed transcript, including a mid-delimiter chunk boundary.

Report and stop.

## Step 6 — Polish pass

1. Loading and failure states reviewed on every screen; no raw spinners without copy; no dead ends (every failure has a retry or a way back).
2. Mobile check at 390px on all four screens: nothing overflows, sliders usable, option cards stack, debrief readable.
3. Copy pass: all UI copy in British English, plain and confident; no placeholder text ("Lorem", "TODO") anywhere; tagline appears on Screen 1 only.
4. A minimal footer on Screen 1: "xMetrics — prototype. Not a validated assessment instrument." (Required — validity disclaimer from foundation spec §5.)
5. `README.md`: what this is (two sentences), the two spec docs referenced, setup (`npm i`, `.env.local` with `ANTHROPIC_API_KEY`, `npm run dev`), test commands, deliberate scope limits (product spec §10).
6. Run the full suite (`vitest`, `tsc --noEmit`, `next build`) and fix everything. Report final file tree and test counts.

Report and stop. Await instruction before any deployment step.
