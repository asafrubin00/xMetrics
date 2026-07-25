import type { PoolCandidate } from "./pool.config";

export interface FacetSelection {
  tag: string;
  minYears: number;
}

export interface PoolFilterState {
  industries: FacetSelection[];
  functions: FacetSelection[];
  geographies: FacetSelection[];
  companyTypes: FacetSelection[];
  specialisms: FacetSelection[];
  minAge: number;
  maxAge: number;
}

function matchesDimension(
  experience: PoolCandidate["industries"],
  selections: FacetSelection[],
): boolean {
  if (selections.length === 0) return true;
  return selections.some((selection) =>
    experience.some((entry) =>
      entry.tag === selection.tag && entry.years >= selection.minYears,
    ),
  );
}

export function filterPool(
  pool: PoolCandidate[],
  state: PoolFilterState,
): PoolCandidate[] {
  return pool.filter((candidate) =>
    candidate.age >= state.minAge &&
    candidate.age <= state.maxAge &&
    matchesDimension(candidate.industries, state.industries) &&
    matchesDimension(candidate.functions, state.functions) &&
    matchesDimension(candidate.geographies, state.geographies) &&
    matchesDimension(candidate.companyTypes, state.companyTypes) &&
    matchesDimension(candidate.specialisms, state.specialisms),
  );
}
