export interface TraitDefinition {
  id: string;
  name: string;
  group: "drive" | "thinking" | "interpersonal" | "pressure";
  lowDescriptor: string;
  highDescriptor: string;
  pressureNote?: string;
}

export const TRAITS = [
  { id: "dominance", name: "Dominance", group: "drive", lowDescriptor: "defers, seeks consensus", highDescriptor: "takes charge, directs others", pressureNote: "Under pressure, this shapes whether a person yields to the group or asserts control of the decision." },
  { id: "risk_appetite", name: "Risk appetite", group: "drive", lowDescriptor: "cautious, protects downside", highDescriptor: "bold, comfortable betting", pressureNote: "Under pressure, this shapes the trade-off between protecting downside and making a consequential bet." },
  { id: "decisiveness", name: "Decisiveness", group: "drive", lowDescriptor: "deliberates, keeps options open", highDescriptor: "commits fast, dislikes revisiting", pressureNote: "Under pressure, this determines whether options remain open or a course is fixed quickly." },
  { id: "ambition", name: "Ambition", group: "drive", lowDescriptor: "content, steady", highDescriptor: "restless, status- and growth-driven", pressureNote: "Under pressure, this influences whether stability or continued growth takes priority." },
  { id: "analytical_depth", name: "Analytical depth", group: "thinking", lowDescriptor: "intuitive, gist-based", highDescriptor: "data-hungry, systematic", pressureNote: "Under pressure, this affects how much evidence a person needs before acting." },
  { id: "ambiguity_tolerance", name: "Ambiguity tolerance", group: "thinking", lowDescriptor: "needs clarity and structure", highDescriptor: "operates comfortably in fog", pressureNote: "Under pressure, this governs comfort with acting before the picture is complete." },
  { id: "innovation", name: "Innovation orientation", group: "thinking", lowDescriptor: "proven methods, incremental", highDescriptor: "novelty-seeking, reinvents", pressureNote: "Under pressure, this shapes whether a person reaches for a proven response or invents a new one." },
  { id: "strategic_horizon", name: "Strategic horizon", group: "thinking", lowDescriptor: "present-focused, operational", highDescriptor: "long-range, big-picture", pressureNote: "Under pressure, this influences the balance between immediate execution and long-term position." },
  { id: "interpersonal_sensitivity", name: "Interpersonal sensitivity", group: "interpersonal", lowDescriptor: "task-first, blunt", highDescriptor: "reads the room, relationship-first", pressureNote: "Under pressure, this affects whether relational consequences are noticed or subordinated to the task." },
  { id: "influence_style", name: "Influence style", group: "interpersonal", lowDescriptor: "argues on facts and authority", highDescriptor: "persuades through relationships and narrative", pressureNote: "Under pressure, this determines whether influence relies on evidence and authority or relationships and narrative." },
  { id: "conflict_approach", name: "Conflict approach", group: "interpersonal", lowDescriptor: "avoids, smooths over", highDescriptor: "engages directly, tolerates friction", pressureNote: "Under pressure, this shapes whether disagreement is surfaced directly or kept out of view." },
  { id: "trust_disposition", name: "Trust disposition", group: "interpersonal", lowDescriptor: "sceptical, verifies", highDescriptor: "extends trust, delegates readily", pressureNote: "Under pressure, this affects whether responsibility is delegated or subject to closer verification." },
  { id: "composure", name: "Composure", group: "pressure", lowDescriptor: "volatile, visibly stressed", highDescriptor: "steady, unreadable under fire", pressureNote: "Acute stress makes emotional volatility more visible at the low end and emotional restraint more pronounced at the high end." },
  { id: "control_retention", name: "Control retention", group: "pressure", lowDescriptor: "lets go, distributes decisions", highDescriptor: "centralises, micromanages when threatened", pressureNote: "Acute stress pushes the high end towards centralising decisions while the low end continues to distribute authority." },
  { id: "optimism_bias", name: "Optimism bias", group: "pressure", lowDescriptor: "catastrophises, over-weights risk", highDescriptor: "discounts bad news, over-commits", pressureNote: "Acute stress amplifies downside fixation at the low end and dismissal of warning signs at the high end." },
  { id: "accountability", name: "Accountability", group: "pressure", lowDescriptor: "deflects, externalises blame", highDescriptor: "owns outcomes, absorbs responsibility", pressureNote: "Acute stress reveals whether a person redirects blame or accepts responsibility for the outcome." },
] as const satisfies readonly TraitDefinition[];

export const TRAIT_IDS = TRAITS.map(({ id }) => id);
