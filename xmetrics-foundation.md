# xMetrics — Foundation Spec (v0.2)

Prototype collaboration between Asaf Rubin (scenario/simulation design) and Ammaar Lateef (Sand Hill Associates, licensed psychometric engine). This document defines the problem statement and the placeholder trait schema. It is self-contained: an implementer needs no other context.

---

## 1. Problem statement

VCs and PE investors can assess whether individual leaders are capable. What they cannot see is how a specific team will behave together under a specific pressure: a down round, a founder dispute, a critical hire, a pivot decision. Psychometric assessment supplies the "who" — how each person thinks, decides, and operates under stress. xMetrics supplies the "what happens": it takes a team's psychometric profiles and generates a bespoke behavioural scenario showing how that team is likely to navigate a high-stakes decision, followed by an AI-generated debrief that turns the dynamics into diligence evidence an investor can act on.

One line: **psychometrics, multiplied.** Individual profiles multiplied against each other to show how the team behaves as a unit under pressure.

## 2. What the prototype must prove

Psychometric profiles in → bespoke pressure scenario out → team-specific debrief that cites named individuals and named dynamics. Nothing else. No auth, no persistence beyond the session, no marketplace, no recruitment matching.

## 3. Trait schema (placeholder)

The real engine maps 256 individual dynamics into 16 client-facing behavioural traits. Those 16 are not yet shared, so this schema defines 16 placeholder traits informed by Hogan-style trait models. **All trait definitions live in a single config file (`traits.config.ts`) and nothing else in the codebase may hardcode trait names or semantics.** When the real 16 arrive, remapping the config is the only change required.

Each trait is scored 0–100 (normative framing: relative to a professional population, 50 = typical).

### Group A — Drive & decision style
| id | name | low end | high end |
|---|---|---|---|
| dominance | Dominance | defers, seeks consensus | takes charge, directs others |
| risk_appetite | Risk appetite | cautious, protects downside | bold, comfortable betting |
| decisiveness | Decisiveness | deliberates, keeps options open | commits fast, dislikes revisiting |
| ambition | Ambition | content, steady | restless, status- and growth-driven |

### Group B — Thinking style
| id | name | low end | high end |
|---|---|---|---|
| analytical_depth | Analytical depth | intuitive, gist-based | data-hungry, systematic |
| ambiguity_tolerance | Ambiguity tolerance | needs clarity and structure | operates comfortably in fog |
| innovation | Innovation orientation | proven methods, incremental | novelty-seeking, reinvents |
| strategic_horizon | Strategic horizon | present-focused, operational | long-range, big-picture |

### Group C — Interpersonal
| id | name | low end | high end |
|---|---|---|---|
| interpersonal_sensitivity | Interpersonal sensitivity | task-first, blunt | reads the room, relationship-first |
| influence_style | Influence style | argues on facts and authority | persuades through relationships and narrative |
| conflict_approach | Conflict approach | avoids, smooths over | engages directly, tolerates friction |
| trust_disposition | Trust disposition | sceptical, verifies | extends trust, delegates readily |

### Group D — Under pressure (the "dark side" group — traits that emerge or intensify under stress; scenarios stress-test exactly these)
| id | name | low end | high end |
|---|---|---|---|
| composure | Composure | volatile, visibly stressed | steady, unreadable under fire |
| control_retention | Control retention | lets go, distributes decisions | centralises, micromanages when threatened |
| optimism_bias | Optimism bias | catastrophises, over-weights risk | discounts bad news, over-commits |
| accountability | Accountability | deflects, externalises blame | owns outcomes, absorbs responsibility |

### Config file shape

```ts
// traits.config.ts — the ONLY place trait semantics live
export interface TraitDefinition {
  id: string;
  name: string;
  group: "drive" | "thinking" | "interpersonal" | "pressure";
  lowDescriptor: string;   // behavioural meaning of a low score
  highDescriptor: string;  // behavioural meaning of a high score
  pressureNote?: string;   // how this trait manifests under acute stress
}

export interface TeamMember {
  id: string;
  displayName: string;
  role: string;                    // e.g. "CEO", "CTO", "CFO"
  traits: Record<string, number>;  // traitId -> 0–100
}
```

### Derived team-level signals (computed, not stored)

The scenario generator and debrief consume these, never raw scores directly:

- **Concentration**: multiple members high on the same Group A trait (e.g. two dominance ≥ 75 → contested leadership under pressure).
- **Vacuum**: no member above 60 on a trait the scenario demands (e.g. no decisiveness in a time-critical event → stall risk).
- **Polarity**: two members at opposite extremes of one trait (≥ 40-point gap) → predictable friction line.
- **Pressure profile**: Group D scores define how each member degrades under stress; the scenario's escalation beats target the team's worst Group D exposures.

## 4. Design principles (carried over from BoardCraft)

1. **Specificity or nothing.** Debriefs must cite named people, named trait interactions, and concrete moments from the scenario. "This team may struggle with conflict" is a failure; "When funding pressure peaked, Sarah's control retention and Marcus's conflict avoidance produced a decision that neither examined" is the standard.
2. **No visible multipliers.** Users never see scores driving outcomes mechanically. They see behaviour and reasoning.
3. **Logic gated by live state.** Scenario beats check actual team composition, not assumed defaults.
4. **Premium aesthetic.** Dark navy / gold / serif headings — "Bloomberg Terminal meets The Economist," consistent with BoardCraft.

## 5. Out of scope for the prototype

Live integration with the licensed engine; recruitment/matching features; multi-session persistence; validity claims (this is a demonstration of mechanism, not a validated assessment).

---

*Next documents: xMetrics product spec (screens, flow, data model), then implementation prompts.*
