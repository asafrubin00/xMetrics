export interface TeamMember {
  id: string;
  displayName: string;
  role: string;
  traits: Record<string, number>;
}

export interface DerivedSignal {
  kind: "concentration" | "vacuum" | "polarity";
  traitId: string;
  memberIds: string[];
  narrative: string;
}

export interface PressureExposure {
  memberId: string;
  traitId: string;
  direction: "low" | "high";
  narrative: string;
}

export interface ScenarioBeat {
  index: 1 | 2 | 3;
  title: string;
  body: string;
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
  options: StrategyOption[];
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
