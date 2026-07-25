import { CANDIDATES, type Candidate } from "./candidates.config";

export const INDUSTRIES = ["Technology", "Financial Services", "Healthcare", "Industrials", "Consumer", "Energy", "Telecoms", "Retail", "Real Estate", "Media"] as const;
export const FUNCTIONS = ["CEO", "CFO", "COO", "CTO", "Chair", "NED", "Senior Independent Director", "Audit Chair", "Remuneration Chair", "General Counsel", "CHRO", "CRO", "CPO"] as const;
export const GEOGRAPHIES = ["UK", "Western Europe", "North America", "LatAm", "APAC", "Middle East", "Africa"] as const;
export const COMPANY_TYPES = ["Listed (PLC)", "Private Equity", "Venture Capital", "Family-owned", "Public Sector", "Startup"] as const;
export const SPECIALISMS = ["Turnaround", "International Expansion", "Growth", "M&A", "IPO", "Restructuring", "Regulatory / Governance", "Digital Transformation", "Crisis Management", "Succession"] as const;

export interface ExperienceTag {
  tag: string;
  years: number;
}

export interface PoolCandidate extends Candidate {
  age: number;
  bio: string;
  industries: ExperienceTag[];
  functions: ExperienceTag[];
  geographies: ExperienceTag[];
  companyTypes: ExperienceTag[];
  specialisms: ExperienceTag[];
}

type PoolMetadata = Omit<PoolCandidate, keyof Candidate>;

const existingPoolMetadata: Record<string, PoolMetadata> = {
  "maya-chen": { age: 49, bio: "Maya has led two regulated software businesses through rapid international growth. She now advises founders navigating the transition to institutional governance.", industries: [{ tag: "Technology", years: 18 }, { tag: "Financial Services", years: 10 }], functions: [{ tag: "CEO", years: 12 }], geographies: [{ tag: "UK", years: 14 }, { tag: "APAC", years: 8 }], companyTypes: [{ tag: "Venture Capital", years: 10 }, { tag: "Listed (PLC)", years: 5 }], specialisms: [{ tag: "International Expansion", years: 12 }, { tag: "Growth", years: 16 }] },
  "elena-rossi": { age: 52, bio: "Elena is a payments operator who has built controls, service teams and operating rhythms across Europe. Her recent work focuses on scaling regulated platforms without losing execution discipline.", industries: [{ tag: "Financial Services", years: 19 }, { tag: "Technology", years: 9 }], functions: [{ tag: "COO", years: 13 }], geographies: [{ tag: "Western Europe", years: 20 }, { tag: "UK", years: 7 }], companyTypes: [{ tag: "Private Equity", years: 8 }, { tag: "Venture Capital", years: 7 }], specialisms: [{ tag: "Digital Transformation", years: 11 }, { tag: "International Expansion", years: 9 }] },
  "priya-nair": { age: 55, bio: "Priya trained in audit before becoming CFO of a listed infrastructure company. She has led an IPO, refinanced complex debt and chaired finance transformation programmes.", industries: [{ tag: "Financial Services", years: 12 }, { tag: "Industrials", years: 11 }], functions: [{ tag: "CFO", years: 16 }, { tag: "Audit Chair", years: 5 }], geographies: [{ tag: "UK", years: 18 }, { tag: "APAC", years: 6 }], companyTypes: [{ tag: "Listed (PLC)", years: 14 }], specialisms: [{ tag: "IPO", years: 7 }, { tag: "Regulatory / Governance", years: 12 }, { tag: "Restructuring", years: 6 }] },
  "tom-bennett": { age: 46, bio: "Tom has built cloud and data platforms for banks and high-growth software companies. He combines hands-on architecture experience with board-level technology oversight.", industries: [{ tag: "Technology", years: 21 }, { tag: "Financial Services", years: 8 }], functions: [{ tag: "CTO", years: 12 }], geographies: [{ tag: "UK", years: 17 }, { tag: "North America", years: 5 }], companyTypes: [{ tag: "Startup", years: 9 }, { tag: "Listed (PLC)", years: 6 }], specialisms: [{ tag: "Digital Transformation", years: 15 }, { tag: "Growth", years: 8 }] },
  "amina-yusuf": { age: 51, bio: "Amina spent a decade advising financial regulators before moving in-house. She has guided boards through investigations, remediation and sensitive market disclosures.", industries: [{ tag: "Financial Services", years: 18 }, { tag: "Technology", years: 6 }], functions: [{ tag: "General Counsel", years: 14 }], geographies: [{ tag: "UK", years: 16 }, { tag: "Middle East", years: 5 }], companyTypes: [{ tag: "Listed (PLC)", years: 11 }, { tag: "Public Sector", years: 8 }], specialisms: [{ tag: "Regulatory / Governance", years: 20 }, { tag: "Crisis Management", years: 9 }] },
  "lucas-silva": { age: 44, bio: "Lucas is a commercial executive who opened markets across Latin America and Europe for two venture-backed businesses. He is strongest where growth depends on partnerships and local market adaptation.", industries: [{ tag: "Technology", years: 14 }, { tag: "Telecoms", years: 8 }], functions: [{ tag: "CRO", years: 9 }], geographies: [{ tag: "LatAm", years: 18 }, { tag: "Western Europe", years: 6 }], companyTypes: [{ tag: "Venture Capital", years: 11 }, { tag: "Startup", years: 7 }], specialisms: [{ tag: "International Expansion", years: 13 }, { tag: "Growth", years: 15 }] },
  "noor-haddad": { age: 42, bio: "Noor has led product organisations in digital banking and insurance. She brings current experience of customer research, platform strategy and responsible product scaling.", industries: [{ tag: "Financial Services", years: 12 }, { tag: "Technology", years: 10 }], functions: [{ tag: "CPO", years: 9 }], geographies: [{ tag: "UK", years: 10 }, { tag: "Middle East", years: 6 }], companyTypes: [{ tag: "Venture Capital", years: 8 }, { tag: "Listed (PLC)", years: 4 }], specialisms: [{ tag: "Digital Transformation", years: 12 }, { tag: "Growth", years: 9 }] },
  "daniel-okafor": { age: 40, bio: "Daniel leads engineering teams building resilient transaction systems. He is known for improving delivery predictability while developing first-time technical managers.", industries: [{ tag: "Technology", years: 17 }, { tag: "Telecoms", years: 5 }], functions: [{ tag: "CTO", years: 4 }], geographies: [{ tag: "UK", years: 11 }, { tag: "Africa", years: 6 }], companyTypes: [{ tag: "Startup", years: 8 }, { tag: "Venture Capital", years: 6 }], specialisms: [{ tag: "Digital Transformation", years: 8 }, { tag: "Growth", years: 7 }] },
  "sofia-petrov": { age: 48, bio: "Sofia has rebuilt leadership and talent systems after periods of rapid expansion. She advises remuneration committees on succession, culture and executive assessment.", industries: [{ tag: "Technology", years: 10 }, { tag: "Consumer", years: 9 }], functions: [{ tag: "CHRO", years: 13 }, { tag: "Remuneration Chair", years: 3 }], geographies: [{ tag: "Western Europe", years: 17 }, { tag: "UK", years: 7 }], companyTypes: [{ tag: "Private Equity", years: 7 }, { tag: "Listed (PLC)", years: 6 }], specialisms: [{ tag: "Succession", years: 12 }, { tag: "International Expansion", years: 8 }] },
  "james-whitfield": { age: 66, bio: "James has chaired listed and private companies through succession, activism and a contested sale. He previously ran a diversified business-services group.", industries: [{ tag: "Industrials", years: 17 }, { tag: "Consumer", years: 9 }], functions: [{ tag: "Chair", years: 14 }, { tag: "CEO", years: 12 }], geographies: [{ tag: "UK", years: 30 }], companyTypes: [{ tag: "Listed (PLC)", years: 22 }, { tag: "Private Equity", years: 6 }], specialisms: [{ tag: "Succession", years: 13 }, { tag: "M&A", years: 16 }, { tag: "Crisis Management", years: 8 }] },
  "helen-carter": { age: 62, bio: "Helen is a former FTSE 250 chief executive and experienced senior independent director. She has managed difficult founder transitions and restored board relationships after public disagreement.", industries: [{ tag: "Consumer", years: 15 }, { tag: "Retail", years: 11 }], functions: [{ tag: "Senior Independent Director", years: 9 }, { tag: "CEO", years: 13 }], geographies: [{ tag: "UK", years: 28 }], companyTypes: [{ tag: "Listed (PLC)", years: 20 }], specialisms: [{ tag: "Succession", years: 10 }, { tag: "Crisis Management", years: 7 }] },
  "marcus-lee": { age: 59, bio: "Marcus is a former bank CFO and audit partner with deep prudential experience. He has chaired audit remediation and strengthened controls after a regulatory review.", industries: [{ tag: "Financial Services", years: 28 }], functions: [{ tag: "Audit Chair", years: 11 }, { tag: "CFO", years: 12 }], geographies: [{ tag: "UK", years: 18 }, { tag: "APAC", years: 9 }], companyTypes: [{ tag: "Listed (PLC)", years: 21 }], specialisms: [{ tag: "Regulatory / Governance", years: 19 }, { tag: "Restructuring", years: 7 }] },
  "ruth-adebayo": { age: 57, bio: "Ruth is a former chief people officer who now chairs remuneration committees. She has redesigned incentives after investor dissent and overseen several chief executive successions.", industries: [{ tag: "Industrials", years: 12 }, { tag: "Financial Services", years: 8 }], functions: [{ tag: "Remuneration Chair", years: 10 }, { tag: "CHRO", years: 14 }], geographies: [{ tag: "UK", years: 22 }, { tag: "Africa", years: 5 }], companyTypes: [{ tag: "Listed (PLC)", years: 18 }], specialisms: [{ tag: "Succession", years: 14 }, { tag: "Regulatory / Governance", years: 8 }] },
  "sir-david-khan": { age: 68, bio: "David spent more than two decades in financial supervision and public policy. He now advises boards on conduct, accountability and relationships with regulators.", industries: [{ tag: "Financial Services", years: 30 }], functions: [{ tag: "NED", years: 8 }], geographies: [{ tag: "UK", years: 32 }], companyTypes: [{ tag: "Public Sector", years: 24 }, { tag: "Listed (PLC)", years: 6 }], specialisms: [{ tag: "Regulatory / Governance", years: 32 }, { tag: "Crisis Management", years: 10 }] },
  "ines-martin": { age: 45, bio: "Ines scaled a European payments platform from 80 to 900 employees. She has direct experience of licensing, operational resilience and multi-country integration.", industries: [{ tag: "Financial Services", years: 13 }, { tag: "Technology", years: 11 }], functions: [{ tag: "COO", years: 10 }], geographies: [{ tag: "Western Europe", years: 16 }, { tag: "UK", years: 5 }], companyTypes: [{ tag: "Venture Capital", years: 9 }, { tag: "Private Equity", years: 4 }], specialisms: [{ tag: "Growth", years: 12 }, { tag: "International Expansion", years: 10 }, { tag: "Regulatory / Governance", years: 7 }] },
  "graham-foster": { age: 61, bio: "Graham has led three distressed services businesses through lender negotiations and operational restructuring. He is an experienced interim chief executive in time-critical situations.", industries: [{ tag: "Industrials", years: 18 }, { tag: "Consumer", years: 8 }], functions: [{ tag: "CEO", years: 19 }], geographies: [{ tag: "UK", years: 26 }, { tag: "Western Europe", years: 6 }], companyTypes: [{ tag: "Private Equity", years: 15 }], specialisms: [{ tag: "Turnaround", years: 18 }, { tag: "Restructuring", years: 17 }, { tag: "Crisis Management", years: 14 }] },
  "leila-mansour": { age: 39, bio: "Leila founded and sold a cybersecurity company serving regulated enterprises. She is beginning a portfolio career while remaining close to product, talent and customer decisions.", industries: [{ tag: "Technology", years: 15 }, { tag: "Financial Services", years: 4 }], functions: [{ tag: "NED", years: 2 }, { tag: "CEO", years: 8 }], geographies: [{ tag: "UK", years: 9 }, { tag: "Middle East", years: 5 }], companyTypes: [{ tag: "Startup", years: 11 }, { tag: "Venture Capital", years: 8 }], specialisms: [{ tag: "Growth", years: 10 }, { tag: "M&A", years: 3 }] },
  "peter-holm": { age: 64, bio: "Peter has chaired industrial and software boards through transformation and leadership renewal. Earlier in his career he ran a family-controlled manufacturing group.", industries: [{ tag: "Industrials", years: 20 }, { tag: "Technology", years: 8 }], functions: [{ tag: "Chair", years: 13 }, { tag: "CEO", years: 14 }], geographies: [{ tag: "Western Europe", years: 25 }, { tag: "UK", years: 6 }], companyTypes: [{ tag: "Listed (PLC)", years: 15 }, { tag: "Family-owned", years: 12 }], specialisms: [{ tag: "Succession", years: 11 }, { tag: "Digital Transformation", years: 7 }] },
};

const existingPool: PoolCandidate[] = CANDIDATES.map((candidate) => ({
  ...candidate,
  ...existingPoolMetadata[candidate.id],
}));

const newPoolCandidates: PoolCandidate[] = [
  {
    id: "alice-morgan", displayName: "Alice Morgan", role: "Healthcare Chair", background: "Former hospital-group CEO; chaired a public-to-private healthcare transaction.",
    traits: { dominance: 72, risk_appetite: 35, decisiveness: 76, ambition: 48, analytical_depth: 80, ambiguity_tolerance: 58, innovation: 44, strategic_horizon: 91, interpersonal_sensitivity: 83, influence_style: 78, conflict_approach: 69, trust_disposition: 52, composure: 92, control_retention: 46, optimism_bias: 41, accountability: 94 },
    age: 63, bio: "Alice led a hospital group through quality reform and a change of ownership. She now chairs healthcare boards balancing clinical outcomes, regulation and capital allocation.",
    industries: [{ tag: "Healthcare", years: 27 }], functions: [{ tag: "Chair", years: 10 }, { tag: "CEO", years: 14 }], geographies: [{ tag: "UK", years: 25 }], companyTypes: [{ tag: "Private Equity", years: 8 }, { tag: "Public Sector", years: 7 }], specialisms: [{ tag: "Regulatory / Governance", years: 14 }, { tag: "M&A", years: 9 }],
  },
  {
    id: "benoit-laurent", displayName: "Benoit Laurent", role: "Energy CFO", background: "Financed renewable assets and led a cross-border energy IPO.",
    traits: { dominance: 59, risk_appetite: 47, decisiveness: 64, ambition: 72, analytical_depth: 95, ambiguity_tolerance: 53, innovation: 42, strategic_horizon: 84, interpersonal_sensitivity: 45, influence_style: 38, conflict_approach: 73, trust_disposition: 29, composure: 88, control_retention: 75, optimism_bias: 36, accountability: 96 },
    age: 54, bio: "Benoit has financed wind, solar and grid assets across Western Europe. He led the finance work for a complex flotation and subsequent portfolio acquisition programme.",
    industries: [{ tag: "Energy", years: 21 }, { tag: "Financial Services", years: 6 }], functions: [{ tag: "CFO", years: 13 }], geographies: [{ tag: "Western Europe", years: 24 }], companyTypes: [{ tag: "Listed (PLC)", years: 11 }, { tag: "Private Equity", years: 6 }], specialisms: [{ tag: "IPO", years: 6 }, { tag: "M&A", years: 12 }],
  },
  {
    id: "caroline-reed", displayName: "Caroline Reed", role: "Retail CEO", background: "Omnichannel retailer who restored growth after a prolonged decline.",
    traits: { dominance: 86, risk_appetite: 68, decisiveness: 91, ambition: 88, analytical_depth: 57, ambiguity_tolerance: 76, innovation: 79, strategic_horizon: 62, interpersonal_sensitivity: 61, influence_style: 85, conflict_approach: 77, trust_disposition: 65, composure: 70, control_retention: 73, optimism_bias: 76, accountability: 87 },
    age: 50, bio: "Caroline rebuilt a heritage retailer around digital channels and a smaller store estate. She has led brand renewal, pricing change and a demanding cost programme.",
    industries: [{ tag: "Retail", years: 22 }, { tag: "Consumer", years: 15 }], functions: [{ tag: "CEO", years: 11 }], geographies: [{ tag: "UK", years: 20 }, { tag: "Western Europe", years: 5 }], companyTypes: [{ tag: "Listed (PLC)", years: 13 }], specialisms: [{ tag: "Turnaround", years: 8 }, { tag: "Digital Transformation", years: 10 }, { tag: "Growth", years: 13 }],
  },
  {
    id: "deepak-rao", displayName: "Deepak Rao", role: "Telecoms CTO", background: "Modernised mobile networks across India and Southeast Asia.",
    traits: { dominance: 64, risk_appetite: 61, decisiveness: 69, ambition: 67, analytical_depth: 93, ambiguity_tolerance: 74, innovation: 88, strategic_horizon: 78, interpersonal_sensitivity: 39, influence_style: 42, conflict_approach: 66, trust_disposition: 50, composure: 81, control_retention: 58, optimism_bias: 63, accountability: 85 },
    age: 53, bio: "Deepak has led network and platform modernisation for regional telecoms operators. He combines large-scale engineering delivery with experience of spectrum and public-sector stakeholders.",
    industries: [{ tag: "Telecoms", years: 25 }, { tag: "Technology", years: 12 }], functions: [{ tag: "CTO", years: 14 }], geographies: [{ tag: "APAC", years: 26 }], companyTypes: [{ tag: "Listed (PLC)", years: 16 }, { tag: "Public Sector", years: 4 }], specialisms: [{ tag: "Digital Transformation", years: 17 }, { tag: "International Expansion", years: 8 }],
  },
  {
    id: "emily-shaw", displayName: "Emily Shaw", role: "Media NED", background: "Former streaming executive with subscription and content-rights expertise.",
    traits: { dominance: 45, risk_appetite: 72, decisiveness: 55, ambition: 81, analytical_depth: 68, ambiguity_tolerance: 89, innovation: 94, strategic_horizon: 77, interpersonal_sensitivity: 84, influence_style: 90, conflict_approach: 46, trust_disposition: 74, composure: 62, control_retention: 22, optimism_bias: 79, accountability: 76 },
    age: 43, bio: "Emily built subscription products for a global streaming company and negotiated content partnerships. She brings current consumer, product and digital-distribution experience to boards.",
    industries: [{ tag: "Media", years: 16 }, { tag: "Technology", years: 9 }], functions: [{ tag: "NED", years: 3 }, { tag: "CPO", years: 7 }], geographies: [{ tag: "UK", years: 9 }, { tag: "North America", years: 7 }], companyTypes: [{ tag: "Listed (PLC)", years: 8 }, { tag: "Venture Capital", years: 4 }], specialisms: [{ tag: "Growth", years: 11 }, { tag: "Digital Transformation", years: 9 }],
  },
  {
    id: "farah-al-sayegh", displayName: "Farah Al-Sayegh", role: "Infrastructure COO", background: "Delivered transport and energy programmes across the Gulf.",
    traits: { dominance: 75, risk_appetite: 40, decisiveness: 83, ambition: 64, analytical_depth: 77, ambiguity_tolerance: 66, innovation: 39, strategic_horizon: 71, interpersonal_sensitivity: 70, influence_style: 73, conflict_approach: 71, trust_disposition: 43, composure: 90, control_retention: 76, optimism_bias: 48, accountability: 92 },
    age: 51, bio: "Farah has run complex infrastructure portfolios involving government, contractors and international lenders. She is experienced in programme recovery and multi-party delivery governance.",
    industries: [{ tag: "Industrials", years: 14 }, { tag: "Energy", years: 10 }], functions: [{ tag: "COO", years: 12 }], geographies: [{ tag: "Middle East", years: 23 }], companyTypes: [{ tag: "Public Sector", years: 13 }, { tag: "Family-owned", years: 7 }], specialisms: [{ tag: "Crisis Management", years: 9 }, { tag: "Restructuring", years: 7 }],
  },
  {
    id: "george-evans", displayName: "George Evans", role: "Real Estate Audit Chair", background: "Ex-property CFO with listed REIT and covenant-restructuring experience.",
    traits: { dominance: 55, risk_appetite: 18, decisiveness: 61, ambition: 31, analytical_depth: 97, ambiguity_tolerance: 28, innovation: 20, strategic_horizon: 75, interpersonal_sensitivity: 52, influence_style: 27, conflict_approach: 78, trust_disposition: 16, composure: 93, control_retention: 80, optimism_bias: 19, accountability: 98 },
    age: 65, bio: "George spent two decades in listed property finance and led negotiations during a covenant breach. He now chairs audit committees for real-estate and infrastructure businesses.",
    industries: [{ tag: "Real Estate", years: 29 }, { tag: "Financial Services", years: 6 }], functions: [{ tag: "Audit Chair", years: 12 }, { tag: "CFO", years: 15 }], geographies: [{ tag: "UK", years: 31 }], companyTypes: [{ tag: "Listed (PLC)", years: 24 }], specialisms: [{ tag: "Restructuring", years: 12 }, { tag: "Regulatory / Governance", years: 15 }],
  },
  {
    id: "hana-kim", displayName: "Hana Kim", role: "Consumer CPO", background: "Built digital propositions for beauty and personal-care brands in Asia.",
    traits: { dominance: 52, risk_appetite: 76, decisiveness: 58, ambition: 85, analytical_depth: 71, ambiguity_tolerance: 87, innovation: 96, strategic_horizon: 82, interpersonal_sensitivity: 88, influence_style: 84, conflict_approach: 43, trust_disposition: 79, composure: 69, control_retention: 25, optimism_bias: 82, accountability: 80 },
    age: 41, bio: "Hana has created direct-to-consumer and marketplace products for global beauty brands. She has led teams across Seoul, Singapore and Tokyo during rapid regional growth.",
    industries: [{ tag: "Consumer", years: 14 }, { tag: "Retail", years: 8 }, { tag: "Technology", years: 6 }], functions: [{ tag: "CPO", years: 8 }], geographies: [{ tag: "APAC", years: 17 }], companyTypes: [{ tag: "Listed (PLC)", years: 7 }, { tag: "Venture Capital", years: 5 }], specialisms: [{ tag: "International Expansion", years: 10 }, { tag: "Growth", years: 12 }],
  },
  {
    id: "ian-maclean", displayName: "Ian Maclean", role: "Industrial Turnaround CEO", background: "Restructured engineering groups under private-equity ownership.",
    traits: { dominance: 93, risk_appetite: 59, decisiveness: 95, ambition: 70, analytical_depth: 66, ambiguity_tolerance: 84, innovation: 35, strategic_horizon: 49, interpersonal_sensitivity: 30, influence_style: 36, conflict_approach: 94, trust_disposition: 24, composure: 85, control_retention: 91, optimism_bias: 34, accountability: 89 },
    age: 58, bio: "Ian has led operational restructurings in engineering and specialist manufacturing. He is accustomed to lender pressure, plant consolidation and accelerated management change.",
    industries: [{ tag: "Industrials", years: 28 }], functions: [{ tag: "CEO", years: 17 }, { tag: "COO", years: 8 }], geographies: [{ tag: "UK", years: 20 }, { tag: "Western Europe", years: 8 }], companyTypes: [{ tag: "Private Equity", years: 18 }], specialisms: [{ tag: "Turnaround", years: 16 }, { tag: "Restructuring", years: 18 }, { tag: "Crisis Management", years: 12 }],
  },
  {
    id: "juliana-costa", displayName: "Juliana Costa", role: "LatAm Growth CEO", background: "Scaled a family-owned consumer business across six Latin American markets.",
    traits: { dominance: 81, risk_appetite: 74, decisiveness: 79, ambition: 93, analytical_depth: 54, ambiguity_tolerance: 86, innovation: 72, strategic_horizon: 80, interpersonal_sensitivity: 75, influence_style: 92, conflict_approach: 65, trust_disposition: 70, composure: 72, control_retention: 60, optimism_bias: 88, accountability: 82 },
    age: 47, bio: "Juliana professionalised and expanded a family-controlled consumer group across Latin America. She has managed channel shifts, family governance and acquisitions in volatile markets.",
    industries: [{ tag: "Consumer", years: 20 }, { tag: "Retail", years: 9 }], functions: [{ tag: "CEO", years: 12 }], geographies: [{ tag: "LatAm", years: 24 }], companyTypes: [{ tag: "Family-owned", years: 17 }], specialisms: [{ tag: "International Expansion", years: 15 }, { tag: "Growth", years: 18 }, { tag: "M&A", years: 8 }],
  },
  {
    id: "katherine-cole", displayName: "Katherine Cole", role: "Financial Services SID", background: "Former insurer CEO with conduct, solvency and succession experience.",
    traits: { dominance: 60, risk_appetite: 25, decisiveness: 68, ambition: 37, analytical_depth: 85, ambiguity_tolerance: 51, innovation: 33, strategic_horizon: 90, interpersonal_sensitivity: 91, influence_style: 81, conflict_approach: 70, trust_disposition: 39, composure: 96, control_retention: 41, optimism_bias: 27, accountability: 93 },
    age: 67, bio: "Katherine led a life insurer through solvency reform and a change of ownership. As a senior independent director she has handled succession and difficult shareholder engagement.",
    industries: [{ tag: "Financial Services", years: 32 }], functions: [{ tag: "Senior Independent Director", years: 11 }, { tag: "CEO", years: 14 }], geographies: [{ tag: "UK", years: 30 }], companyTypes: [{ tag: "Listed (PLC)", years: 23 }], specialisms: [{ tag: "Regulatory / Governance", years: 22 }, { tag: "Succession", years: 12 }],
  },
  {
    id: "li-wei", displayName: "Li Wei", role: "APAC Technology CEO", background: "Built enterprise software businesses in China and Southeast Asia.",
    traits: { dominance: 84, risk_appetite: 80, decisiveness: 87, ambition: 95, analytical_depth: 69, ambiguity_tolerance: 92, innovation: 90, strategic_horizon: 85, interpersonal_sensitivity: 49, influence_style: 76, conflict_approach: 75, trust_disposition: 62, composure: 74, control_retention: 71, optimism_bias: 86, accountability: 79 },
    age: 48, bio: "Wei founded and scaled enterprise-software operations across China and Southeast Asia. He has raised venture capital, completed a regional acquisition and prepared a business for listing.",
    industries: [{ tag: "Technology", years: 22 }], functions: [{ tag: "CEO", years: 14 }], geographies: [{ tag: "APAC", years: 25 }], companyTypes: [{ tag: "Venture Capital", years: 12 }, { tag: "Startup", years: 10 }], specialisms: [{ tag: "International Expansion", years: 14 }, { tag: "Growth", years: 17 }, { tag: "IPO", years: 4 }],
  },
  {
    id: "marta-garcia", displayName: "Marta Garcia", role: "Energy General Counsel", background: "Led legal and regulatory work for European utility acquisitions.",
    traits: { dominance: 57, risk_appetite: 21, decisiveness: 62, ambition: 44, analytical_depth: 91, ambiguity_tolerance: 43, innovation: 26, strategic_horizon: 74, interpersonal_sensitivity: 73, influence_style: 55, conflict_approach: 67, trust_disposition: 23, composure: 94, control_retention: 68, optimism_bias: 24, accountability: 95 },
    age: 56, bio: "Marta has led legal teams for utilities operating across regulated European markets. Her work spans acquisitions, competition reviews and major environmental disputes.",
    industries: [{ tag: "Energy", years: 23 }], functions: [{ tag: "General Counsel", years: 15 }], geographies: [{ tag: "Western Europe", years: 26 }], companyTypes: [{ tag: "Listed (PLC)", years: 18 }], specialisms: [{ tag: "Regulatory / Governance", years: 20 }, { tag: "M&A", years: 13 }, { tag: "Crisis Management", years: 6 }],
  },
  {
    id: "nathan-brooks", displayName: "Nathan Brooks", role: "Startup CFO", background: "Venture finance leader who took two software companies through Series C.",
    traits: { dominance: 51, risk_appetite: 65, decisiveness: 60, ambition: 87, analytical_depth: 90, ambiguity_tolerance: 82, innovation: 64, strategic_horizon: 73, interpersonal_sensitivity: 57, influence_style: 61, conflict_approach: 52, trust_disposition: 48, composure: 68, control_retention: 56, optimism_bias: 71, accountability: 90 },
    age: 38, bio: "Nathan built finance, planning and investor-reporting functions at two software scale-ups. He has managed fundraising, unit-economics resets and preparations for international expansion.",
    industries: [{ tag: "Technology", years: 14 }], functions: [{ tag: "CFO", years: 7 }], geographies: [{ tag: "North America", years: 11 }, { tag: "UK", years: 4 }], companyTypes: [{ tag: "Startup", years: 10 }, { tag: "Venture Capital", years: 9 }], specialisms: [{ tag: "Growth", years: 9 }, { tag: "International Expansion", years: 5 }],
  },
  {
    id: "olivia-grant", displayName: "Olivia Grant", role: "Consumer Remuneration Chair", background: "Former CHRO with global consumer and executive-reward experience.",
    traits: { dominance: 48, risk_appetite: 32, decisiveness: 53, ambition: 50, analytical_depth: 70, ambiguity_tolerance: 60, innovation: 51, strategic_horizon: 79, interpersonal_sensitivity: 95, influence_style: 91, conflict_approach: 40, trust_disposition: 76, composure: 88, control_retention: 20, optimism_bias: 57, accountability: 84 },
    age: 60, bio: "Olivia led people functions for global consumer brands and now chairs remuneration committees. She has overseen incentive redesign, culture integration and chief executive succession.",
    industries: [{ tag: "Consumer", years: 24 }, { tag: "Retail", years: 8 }], functions: [{ tag: "Remuneration Chair", years: 9 }, { tag: "CHRO", years: 15 }], geographies: [{ tag: "UK", years: 17 }, { tag: "North America", years: 7 }], companyTypes: [{ tag: "Listed (PLC)", years: 20 }], specialisms: [{ tag: "Succession", years: 15 }, { tag: "M&A", years: 7 }],
  },
  {
    id: "paul-mensah", displayName: "Paul Mensah", role: "Africa Telecoms CEO", background: "Expanded mobile and fibre businesses across West and East Africa.",
    traits: { dominance: 88, risk_appetite: 77, decisiveness: 85, ambition: 91, analytical_depth: 60, ambiguity_tolerance: 90, innovation: 73, strategic_horizon: 79, interpersonal_sensitivity: 66, influence_style: 89, conflict_approach: 72, trust_disposition: 68, composure: 77, control_retention: 67, optimism_bias: 83, accountability: 86 },
    age: 52, bio: "Paul has built mobile, fibre and payments operations across African markets. He is experienced in licence negotiations, infrastructure partnerships and high-growth distribution.",
    industries: [{ tag: "Telecoms", years: 23 }, { tag: "Technology", years: 8 }], functions: [{ tag: "CEO", years: 13 }], geographies: [{ tag: "Africa", years: 26 }], companyTypes: [{ tag: "Listed (PLC)", years: 9 }, { tag: "Private Equity", years: 6 }], specialisms: [{ tag: "International Expansion", years: 16 }, { tag: "Growth", years: 18 }, { tag: "Regulatory / Governance", years: 9 }],
  },
  {
    id: "quinn-harper", displayName: "Quinn Harper", role: "Cybersecurity NED", background: "Former security chief for a North American financial institution.",
    traits: { dominance: 42, risk_appetite: 29, decisiveness: 49, ambition: 46, analytical_depth: 96, ambiguity_tolerance: 55, innovation: 78, strategic_horizon: 72, interpersonal_sensitivity: 36, influence_style: 31, conflict_approach: 63, trust_disposition: 18, composure: 87, control_retention: 65, optimism_bias: 22, accountability: 92 },
    age: 49, bio: "Quinn led cyber defence and incident response for a large North American bank. They now advise boards on resilience, technology risk and crisis preparation.",
    industries: [{ tag: "Technology", years: 18 }, { tag: "Financial Services", years: 12 }], functions: [{ tag: "NED", years: 4 }, { tag: "CTO", years: 7 }], geographies: [{ tag: "North America", years: 22 }], companyTypes: [{ tag: "Listed (PLC)", years: 14 }], specialisms: [{ tag: "Crisis Management", years: 13 }, { tag: "Regulatory / Governance", years: 10 }],
  },
  {
    id: "rachel-stein", displayName: "Rachel Stein", role: "Healthcare COO", background: "Scaled clinical operations for a venture-backed diagnostics company.",
    traits: { dominance: 67, risk_appetite: 55, decisiveness: 78, ambition: 82, analytical_depth: 83, ambiguity_tolerance: 71, innovation: 69, strategic_horizon: 63, interpersonal_sensitivity: 77, influence_style: 65, conflict_approach: 59, trust_disposition: 60, composure: 80, control_retention: 62, optimism_bias: 66, accountability: 94 },
    age: 45, bio: "Rachel built laboratories, clinical operations and quality systems for a diagnostics scale-up. She has managed regulatory submissions and expansion into two new markets.",
    industries: [{ tag: "Healthcare", years: 18 }, { tag: "Technology", years: 5 }], functions: [{ tag: "COO", years: 9 }], geographies: [{ tag: "North America", years: 15 }, { tag: "UK", years: 4 }], companyTypes: [{ tag: "Venture Capital", years: 8 }, { tag: "Startup", years: 7 }], specialisms: [{ tag: "Growth", years: 10 }, { tag: "International Expansion", years: 5 }, { tag: "Regulatory / Governance", years: 8 }],
  },
  {
    id: "samir-patel", displayName: "Samir Patel", role: "Private Equity Chair", background: "Operating partner and chair across business-services portfolio companies.",
    traits: { dominance: 82, risk_appetite: 58, decisiveness: 86, ambition: 69, analytical_depth: 75, ambiguity_tolerance: 79, innovation: 40, strategic_horizon: 86, interpersonal_sensitivity: 55, influence_style: 64, conflict_approach: 84, trust_disposition: 37, composure: 91, control_retention: 78, optimism_bias: 45, accountability: 88 },
    age: 62, bio: "Samir is a former operating partner who has chaired several private-equity portfolio companies. He specialises in management upgrades, value-creation plans and exit readiness.",
    industries: [{ tag: "Industrials", years: 15 }, { tag: "Technology", years: 8 }, { tag: "Consumer", years: 6 }], functions: [{ tag: "Chair", years: 14 }, { tag: "CEO", years: 10 }], geographies: [{ tag: "UK", years: 24 }, { tag: "Western Europe", years: 7 }], companyTypes: [{ tag: "Private Equity", years: 19 }], specialisms: [{ tag: "Turnaround", years: 10 }, { tag: "M&A", years: 15 }, { tag: "Succession", years: 11 }],
  },
  {
    id: "tessa-wong", displayName: "Tessa Wong", role: "APAC Audit Chair", background: "Former audit partner covering banks and listed technology groups.",
    traits: { dominance: 53, risk_appetite: 14, decisiveness: 58, ambition: 33, analytical_depth: 99, ambiguity_tolerance: 26, innovation: 24, strategic_horizon: 76, interpersonal_sensitivity: 58, influence_style: 29, conflict_approach: 76, trust_disposition: 13, composure: 95, control_retention: 84, optimism_bias: 15, accountability: 98 },
    age: 61, bio: "Tessa spent three decades auditing banks and technology companies across Asia. She now chairs audit committees and advises on controls, reporting and regulatory remediation.",
    industries: [{ tag: "Financial Services", years: 22 }, { tag: "Technology", years: 10 }], functions: [{ tag: "Audit Chair", years: 10 }], geographies: [{ tag: "APAC", years: 30 }], companyTypes: [{ tag: "Listed (PLC)", years: 25 }], specialisms: [{ tag: "Regulatory / Governance", years: 24 }, { tag: "IPO", years: 7 }],
  },
  {
    id: "umar-rahman", displayName: "Umar Rahman", role: "Real Estate CEO", background: "Developed mixed-use assets across the UK and Middle East.",
    traits: { dominance: 79, risk_appetite: 70, decisiveness: 82, ambition: 86, analytical_depth: 62, ambiguity_tolerance: 75, innovation: 57, strategic_horizon: 81, interpersonal_sensitivity: 50, influence_style: 72, conflict_approach: 80, trust_disposition: 44, composure: 78, control_retention: 77, optimism_bias: 74, accountability: 83 },
    age: 55, bio: "Umar has led large mixed-use development and asset-management businesses. His experience includes family capital, joint ventures and refinancing during a market downturn.",
    industries: [{ tag: "Real Estate", years: 25 }], functions: [{ tag: "CEO", years: 14 }], geographies: [{ tag: "UK", years: 12 }, { tag: "Middle East", years: 13 }], companyTypes: [{ tag: "Family-owned", years: 11 }, { tag: "Private Equity", years: 7 }], specialisms: [{ tag: "Growth", years: 12 }, { tag: "Restructuring", years: 8 }, { tag: "International Expansion", years: 10 }],
  },
  {
    id: "victoria-nash", displayName: "Victoria Nash", role: "Public Sector NED", background: "Former civil-service leader in health procurement and digital delivery.",
    traits: { dominance: 46, risk_appetite: 20, decisiveness: 50, ambition: 29, analytical_depth: 82, ambiguity_tolerance: 47, innovation: 46, strategic_horizon: 89, interpersonal_sensitivity: 87, influence_style: 68, conflict_approach: 35, trust_disposition: 55, composure: 90, control_retention: 34, optimism_bias: 31, accountability: 91 },
    age: 58, bio: "Victoria led national procurement and digital-delivery programmes in healthcare. She brings experience of public accountability, complex stakeholders and large transformation portfolios.",
    industries: [{ tag: "Healthcare", years: 15 }, { tag: "Technology", years: 7 }], functions: [{ tag: "NED", years: 6 }, { tag: "COO", years: 9 }], geographies: [{ tag: "UK", years: 29 }], companyTypes: [{ tag: "Public Sector", years: 24 }], specialisms: [{ tag: "Digital Transformation", years: 12 }, { tag: "Regulatory / Governance", years: 14 }],
  },
  {
    id: "william-price", displayName: "William Price", role: "Industrial CRO", background: "Built risk functions for aerospace and defence supply chains.",
    traits: { dominance: 61, risk_appetite: 16, decisiveness: 65, ambition: 40, analytical_depth: 92, ambiguity_tolerance: 38, innovation: 30, strategic_horizon: 70, interpersonal_sensitivity: 43, influence_style: 33, conflict_approach: 74, trust_disposition: 15, composure: 89, control_retention: 79, optimism_bias: 18, accountability: 96 },
    age: 57, bio: "William has led enterprise risk, compliance and resilience for aerospace manufacturers. He has managed supply-chain disruption, export controls and major programme reviews.",
    industries: [{ tag: "Industrials", years: 26 }], functions: [{ tag: "CRO", years: 14 }], geographies: [{ tag: "UK", years: 20 }, { tag: "North America", years: 5 }], companyTypes: [{ tag: "Listed (PLC)", years: 19 }], specialisms: [{ tag: "Crisis Management", years: 13 }, { tag: "Regulatory / Governance", years: 16 }],
  },
  {
    id: "xiaoyu-zhang", displayName: "Xiaoyu Zhang", role: "Technology CHRO", background: "Scaled talent systems for high-growth engineering organisations.",
    traits: { dominance: 39, risk_appetite: 45, decisiveness: 44, ambition: 73, analytical_depth: 65, ambiguity_tolerance: 80, innovation: 70, strategic_horizon: 74, interpersonal_sensitivity: 97, influence_style: 93, conflict_approach: 32, trust_disposition: 83, composure: 76, control_retention: 18, optimism_bias: 68, accountability: 81 },
    age: 43, bio: "Xiaoyu built people systems for engineering organisations growing across Asia and North America. She focuses on leadership development, culture integration and technical-talent markets.",
    industries: [{ tag: "Technology", years: 17 }], functions: [{ tag: "CHRO", years: 8 }], geographies: [{ tag: "APAC", years: 12 }, { tag: "North America", years: 5 }], companyTypes: [{ tag: "Venture Capital", years: 9 }, { tag: "Startup", years: 6 }], specialisms: [{ tag: "Growth", years: 11 }, { tag: "International Expansion", years: 7 }, { tag: "Succession", years: 5 }],
  },
  {
    id: "yasmin-el-fassi", displayName: "Yasmin El-Fassi", role: "Energy NED", background: "Renewables investor with African and Middle Eastern market experience.",
    traits: { dominance: 50, risk_appetite: 62, decisiveness: 56, ambition: 78, analytical_depth: 86, ambiguity_tolerance: 81, innovation: 67, strategic_horizon: 92, interpersonal_sensitivity: 69, influence_style: 75, conflict_approach: 48, trust_disposition: 57, composure: 84, control_retention: 30, optimism_bias: 64, accountability: 89 },
    age: 46, bio: "Yasmin has invested in renewable-energy platforms across Africa and the Middle East. She brings experience of project finance, government partnerships and emerging-market growth.",
    industries: [{ tag: "Energy", years: 18 }, { tag: "Financial Services", years: 7 }], functions: [{ tag: "NED", years: 5 }, { tag: "CFO", years: 6 }], geographies: [{ tag: "Africa", years: 10 }, { tag: "Middle East", years: 8 }], companyTypes: [{ tag: "Private Equity", years: 12 }], specialisms: [{ tag: "International Expansion", years: 11 }, { tag: "Growth", years: 10 }, { tag: "M&A", years: 7 }],
  },
  {
    id: "zachary-ford", displayName: "Zachary Ford", role: "Media CFO", background: "Restructured a listed publisher and sold its digital subscription business.",
    traits: { dominance: 68, risk_appetite: 36, decisiveness: 74, ambition: 55, analytical_depth: 94, ambiguity_tolerance: 57, innovation: 41, strategic_horizon: 71, interpersonal_sensitivity: 40, influence_style: 35, conflict_approach: 82, trust_disposition: 21, composure: 86, control_retention: 81, optimism_bias: 29, accountability: 95 },
    age: 59, bio: "Zachary led the financial restructuring of a declining listed publisher. He subsequently separated and sold its faster-growing digital subscription division.",
    industries: [{ tag: "Media", years: 23 }, { tag: "Technology", years: 5 }], functions: [{ tag: "CFO", years: 16 }], geographies: [{ tag: "North America", years: 25 }], companyTypes: [{ tag: "Listed (PLC)", years: 20 }], specialisms: [{ tag: "Restructuring", years: 13 }, { tag: "M&A", years: 12 }, { tag: "Turnaround", years: 10 }],
  },
  {
    id: "adrian-bell", displayName: "Adrian Bell", role: "Family Business Chair", background: "Fourth-generation industrial leader who professionalised family governance.",
    traits: { dominance: 73, risk_appetite: 42, decisiveness: 69, ambition: 45, analytical_depth: 63, ambiguity_tolerance: 65, innovation: 38, strategic_horizon: 94, interpersonal_sensitivity: 86, influence_style: 82, conflict_approach: 60, trust_disposition: 66, composure: 93, control_retention: 52, optimism_bias: 50, accountability: 90 },
    age: 69, bio: "Adrian led a fourth-generation engineering group before becoming its non-executive chair. He introduced independent directors, formal succession and a clearer family constitution.",
    industries: [{ tag: "Industrials", years: 35 }], functions: [{ tag: "Chair", years: 14 }, { tag: "CEO", years: 18 }], geographies: [{ tag: "UK", years: 36 }], companyTypes: [{ tag: "Family-owned", years: 35 }], specialisms: [{ tag: "Succession", years: 16 }, { tag: "Regulatory / Governance", years: 9 }],
  },
  {
    id: "beatrice-dubois", displayName: "Beatrice Dubois", role: "Luxury Retail COO", background: "Integrated global operations after a major luxury-goods acquisition.",
    traits: { dominance: 70, risk_appetite: 48, decisiveness: 80, ambition: 76, analytical_depth: 72, ambiguity_tolerance: 69, innovation: 60, strategic_horizon: 67, interpersonal_sensitivity: 79, influence_style: 70, conflict_approach: 58, trust_disposition: 54, composure: 87, control_retention: 64, optimism_bias: 59, accountability: 93 },
    age: 52, bio: "Beatrice has run supply chain, retail operations and integration for luxury brands. She led a multi-country operating-model redesign following a major acquisition.",
    industries: [{ tag: "Retail", years: 20 }, { tag: "Consumer", years: 16 }], functions: [{ tag: "COO", years: 13 }], geographies: [{ tag: "Western Europe", years: 22 }, { tag: "APAC", years: 6 }], companyTypes: [{ tag: "Listed (PLC)", years: 14 }, { tag: "Family-owned", years: 7 }], specialisms: [{ tag: "M&A", years: 10 }, { tag: "International Expansion", years: 12 }, { tag: "Digital Transformation", years: 6 }],
  },
  {
    id: "chidi-eze", displayName: "Chidi Eze", role: "Fintech CRO", background: "Built fraud, credit and compliance functions for African digital lenders.",
    traits: { dominance: 66, risk_appetite: 23, decisiveness: 72, ambition: 62, analytical_depth: 91, ambiguity_tolerance: 60, innovation: 52, strategic_horizon: 69, interpersonal_sensitivity: 46, influence_style: 40, conflict_approach: 77, trust_disposition: 17, composure: 88, control_retention: 72, optimism_bias: 21, accountability: 94 },
    age: 44, bio: "Chidi built risk functions for digital lenders expanding across African markets. His experience covers credit models, fraud operations, licensing and regulator engagement.",
    industries: [{ tag: "Financial Services", years: 16 }, { tag: "Technology", years: 9 }], functions: [{ tag: "CRO", years: 9 }], geographies: [{ tag: "Africa", years: 18 }], companyTypes: [{ tag: "Venture Capital", years: 8 }, { tag: "Startup", years: 6 }], specialisms: [{ tag: "Regulatory / Governance", years: 12 }, { tag: "International Expansion", years: 7 }],
  },
  {
    id: "diana-wu", displayName: "Diana Wu", role: "Biotech CEO", background: "Took an oncology platform from university spinout to public markets.",
    traits: { dominance: 77, risk_appetite: 83, decisiveness: 74, ambition: 96, analytical_depth: 89, ambiguity_tolerance: 94, innovation: 98, strategic_horizon: 90, interpersonal_sensitivity: 58, influence_style: 79, conflict_approach: 64, trust_disposition: 71, composure: 65, control_retention: 57, optimism_bias: 87, accountability: 84 },
    age: 46, bio: "Diana led an oncology spinout from early research through clinical trials and flotation. She has raised specialist capital and built partnerships with global pharmaceutical companies.",
    industries: [{ tag: "Healthcare", years: 17 }, { tag: "Technology", years: 6 }], functions: [{ tag: "CEO", years: 10 }], geographies: [{ tag: "North America", years: 13 }, { tag: "APAC", years: 5 }], companyTypes: [{ tag: "Startup", years: 10 }, { tag: "Listed (PLC)", years: 4 }], specialisms: [{ tag: "IPO", years: 5 }, { tag: "Growth", years: 11 }, { tag: "M&A", years: 4 }],
  },
  {
    id: "edward-clarke", displayName: "Edward Clarke", role: "Banking Chair", background: "Former retail-bank CEO who led conduct remediation and digital renewal.",
    traits: { dominance: 76, risk_appetite: 27, decisiveness: 75, ambition: 43, analytical_depth: 78, ambiguity_tolerance: 50, innovation: 45, strategic_horizon: 93, interpersonal_sensitivity: 68, influence_style: 69, conflict_approach: 79, trust_disposition: 31, composure: 95, control_retention: 70, optimism_bias: 26, accountability: 92 },
    age: 70, bio: "Edward led a retail bank through conduct remediation and a major digital investment programme. He has since chaired regulated financial-services boards and overseen CEO succession.",
    industries: [{ tag: "Financial Services", years: 37 }], functions: [{ tag: "Chair", years: 13 }, { tag: "CEO", years: 16 }], geographies: [{ tag: "UK", years: 36 }], companyTypes: [{ tag: "Listed (PLC)", years: 30 }], specialisms: [{ tag: "Regulatory / Governance", years: 24 }, { tag: "Digital Transformation", years: 10 }, { tag: "Succession", years: 9 }],
  },
  {
    id: "fatima-zahra", displayName: "Fatima Zahra", role: "Consumer General Counsel", background: "Managed product recalls and market entry across Europe and Africa.",
    traits: { dominance: 49, risk_appetite: 19, decisiveness: 55, ambition: 52, analytical_depth: 88, ambiguity_tolerance: 46, innovation: 34, strategic_horizon: 77, interpersonal_sensitivity: 81, influence_style: 63, conflict_approach: 57, trust_disposition: 25, composure: 92, control_retention: 61, optimism_bias: 20, accountability: 96 },
    age: 50, bio: "Fatima has led legal teams for consumer businesses operating across Europe and Africa. She has handled product recalls, distribution disputes and regulatory market entry.",
    industries: [{ tag: "Consumer", years: 18 }, { tag: "Retail", years: 7 }], functions: [{ tag: "General Counsel", years: 12 }], geographies: [{ tag: "Western Europe", years: 12 }, { tag: "Africa", years: 7 }], companyTypes: [{ tag: "Listed (PLC)", years: 11 }, { tag: "Family-owned", years: 5 }], specialisms: [{ tag: "Crisis Management", years: 9 }, { tag: "International Expansion", years: 8 }, { tag: "Regulatory / Governance", years: 12 }],
  },
];

export const POOL: PoolCandidate[] = [
  ...existingPool,
  ...newPoolCandidates,
];
