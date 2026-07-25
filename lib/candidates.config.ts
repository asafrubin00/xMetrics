import { PERSONAS } from "./personas.config";
import type { TeamMember } from "./types";

export interface Candidate extends TeamMember {
  background: string;
}

const PERSONA_BACKGROUNDS: Record<(typeof PERSONAS)[number]["id"], string> = {
  "maya-chen": "Scaled two regulated technology businesses through international expansion.",
  "elena-rossi": "Former payments COO; built operating controls across three markets.",
  "priya-nair": "Ex-Big Four partner; led finance and audit through a public listing.",
  "tom-bennett": "Built banking infrastructure and modernised two legacy technology estates.",
  "amina-yusuf": "Former regulatory counsel; steered boards through enforcement and remediation.",
  "lucas-silva": "Commercial leader who opened new markets at two venture-backed scale-ups.",
  "noor-haddad": "Product executive behind consumer platforms in banking and insurance.",
  "daniel-okafor": "Engineering leader known for resilient systems and measured delivery.",
  "sofia-petrov": "People executive who rebuilt leadership teams after rapid growth.",
  "james-whitfield": "Listed-company chair; led succession and governance through a contested sale.",
};

const existingCandidates: Candidate[] = PERSONAS.map((persona) => ({
  ...persona,
  background: PERSONA_BACKGROUNDS[persona.id],
}));

const additionalCandidates: Candidate[] = [
  {
    id: "helen-carter",
    displayName: "Helen Carter",
    role: "Senior Independent Director",
    background: "Former FTSE 250 CEO; mediated two difficult chair and founder successions.",
    traits: { dominance: 54, risk_appetite: 31, decisiveness: 66, ambition: 34, analytical_depth: 76, ambiguity_tolerance: 61, innovation: 36, strategic_horizon: 88, interpersonal_sensitivity: 89, influence_style: 79, conflict_approach: 72, trust_disposition: 42, composure: 94, control_retention: 35, optimism_bias: 30, accountability: 91 },
  },
  {
    id: "marcus-lee",
    displayName: "Marcus Lee",
    role: "Audit Committee Chair",
    background: "Ex-bank CFO and audit partner; chaired remediation at a listed lender.",
    traits: { dominance: 62, risk_appetite: 12, decisiveness: 63, ambition: 28, analytical_depth: 98, ambiguity_tolerance: 23, innovation: 18, strategic_horizon: 73, interpersonal_sensitivity: 47, influence_style: 25, conflict_approach: 81, trust_disposition: 14, composure: 91, control_retention: 82, optimism_bias: 16, accountability: 97 },
  },
  {
    id: "ruth-adebayo",
    displayName: "Ruth Adebayo",
    role: "Remuneration Committee Chair",
    background: "Former CHRO; redesigned executive incentives after an investor revolt.",
    traits: { dominance: 57, risk_appetite: 35, decisiveness: 61, ambition: 51, analytical_depth: 67, ambiguity_tolerance: 58, innovation: 49, strategic_horizon: 78, interpersonal_sensitivity: 91, influence_style: 88, conflict_approach: 55, trust_disposition: 62, composure: 86, control_retention: 31, optimism_bias: 52, accountability: 87 },
  },
  {
    id: "sir-david-khan",
    displayName: "Sir David Khan",
    role: "Former Regulator",
    background: "Ex-FCA director; supervised retail banking and major conduct investigations.",
    traits: { dominance: 69, risk_appetite: 9, decisiveness: 72, ambition: 22, analytical_depth: 94, ambiguity_tolerance: 39, innovation: 21, strategic_horizon: 83, interpersonal_sensitivity: 56, influence_style: 34, conflict_approach: 87, trust_disposition: 11, composure: 96, control_retention: 77, optimism_bias: 12, accountability: 95 },
  },
  {
    id: "ines-martin",
    displayName: "Ines Martin",
    role: "Fintech Scale-up COO",
    background: "Took a payments platform from 80 to 900 people across Europe.",
    traits: { dominance: 78, risk_appetite: 71, decisiveness: 90, ambition: 92, analytical_depth: 72, ambiguity_tolerance: 88, innovation: 76, strategic_horizon: 59, interpersonal_sensitivity: 53, influence_style: 68, conflict_approach: 79, trust_disposition: 58, composure: 75, control_retention: 69, optimism_bias: 73, accountability: 93 },
  },
  {
    id: "graham-foster",
    displayName: "Graham Foster",
    role: "Turnaround CEO",
    background: "Restructured three distressed services businesses and negotiated lender support.",
    traits: { dominance: 95, risk_appetite: 66, decisiveness: 97, ambition: 74, analytical_depth: 64, ambiguity_tolerance: 91, innovation: 43, strategic_horizon: 46, interpersonal_sensitivity: 24, influence_style: 41, conflict_approach: 96, trust_disposition: 19, composure: 82, control_retention: 94, optimism_bias: 38, accountability: 84 },
  },
  {
    id: "leila-mansour",
    displayName: "Leila Mansour",
    role: "First-time NED",
    background: "Cybersecurity founder bringing current product, talent and customer experience.",
    traits: { dominance: 43, risk_appetite: 82, decisiveness: 48, ambition: 88, analytical_depth: 79, ambiguity_tolerance: 93, innovation: 97, strategic_horizon: 76, interpersonal_sensitivity: 74, influence_style: 71, conflict_approach: 39, trust_disposition: 81, composure: 58, control_retention: 17, optimism_bias: 85, accountability: 77 },
  },
  {
    id: "peter-holm",
    displayName: "Peter Holm",
    role: "Board Chair",
    background: "Chaired listed industrial and software boards through transformation and succession.",
    traits: { dominance: 71, risk_appetite: 45, decisiveness: 70, ambition: 39, analytical_depth: 69, ambiguity_tolerance: 72, innovation: 52, strategic_horizon: 95, interpersonal_sensitivity: 82, influence_style: 86, conflict_approach: 68, trust_disposition: 55, composure: 97, control_retention: 48, optimism_bias: 49, accountability: 90 },
  },
];

export const CANDIDATES: Candidate[] = [
  ...existingCandidates,
  ...additionalCandidates,
];
