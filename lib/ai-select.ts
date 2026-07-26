import { POOL, type PoolCandidate } from "./pool.config";

export interface ConsideredCandidate {
  candidate: PoolCandidate;
  verdict: "selected" | "passed";
  reason: string;
}

export interface LongListPlan {
  intro: string;
  considered: ConsideredCandidate[];
  picks: PoolCandidate[];
  summary: string;
}

type DimensionKey = "industries" | "functions" | "geographies" | "companyTypes" | "specialisms";

const DIMENSIONS: { key: DimensionKey; weight: number }[] = [
  { key: "industries", weight: 1 },
  { key: "functions", weight: 3 },
  { key: "geographies", weight: 2 },
  { key: "companyTypes", weight: 1.5 },
  { key: "specialisms", weight: 2.5 },
];

const FALLBACK_INDICES = [0, 3, 6, 9, 12, 15, 18, 22, 27, 32, 39, 46];

function normalise(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function includesPhrase(text: string, phrase: string): boolean {
  const paddedText = ` ${normalise(text)} `;
  const paddedPhrase = ` ${normalise(phrase)} `;
  return paddedPhrase.trim().length > 0 && paddedText.includes(paddedPhrase);
}

function matchingRoleWords(candidate: PoolCandidate, text: string): string[] {
  const textWords = new Set(normalise(text).split(" ").filter(Boolean));
  return normalise(candidate.role)
    .split(" ")
    .filter((word) => word.length >= 3 && textWords.has(word));
}

function scoreCandidate(candidate: PoolCandidate, brief: string, constraints: string[]) {
  let score = 0;
  const matches: string[] = [];

  const scoreText = (text: string, multiplier: number) => {
    for (const dimension of DIMENSIONS) {
      for (const entry of candidate[dimension.key]) {
        if (includesPhrase(text, entry.tag)) {
          score += dimension.weight * multiplier;
          if (!matches.includes(entry.tag)) matches.push(entry.tag);
        }
      }
    }

    const roleWords = matchingRoleWords(candidate, text);
    score += roleWords.length * 1.5 * multiplier;
    for (const word of roleWords) {
      const roleMatch = candidate.role
        .split(" ")
        .find((roleWord) => normalise(roleWord) === word);
      if (roleMatch && !matches.includes(roleMatch)) matches.push(roleMatch);
    }
  };

  scoreText(brief, 1);
  for (const constraint of constraints) scoreText(constraint, 2);

  return { candidate, score, matches };
}

function selectedReason(candidate: PoolCandidate, matches: string[]): string {
  const evidence = matches.slice(0, 3);
  if (evidence.length > 0) {
    return `${evidence.join(", ")} aligns directly; ${candidate.background.charAt(0).toLowerCase()}${candidate.background.slice(1)}`;
  }
  return `${candidate.role} with breadth across ${candidate.industries[0].tag} and ${candidate.geographies[0].tag}.`;
}

function passedReason(candidate: PoolCandidate, matchedBrief: boolean): string {
  if (matchedBrief) {
    return `${candidate.background.split(";")[0]} — useful adjacency, but not as direct as the selected profiles.`;
  }
  return `${candidate.industries[0].tag} and ${candidate.role.toLowerCase()} experience, but the brief points elsewhere — passing.`;
}

export function buildLongListPlan(brief: string, constraints: string[] = []): LongListPlan {
  const scored = POOL
    .map((candidate, index) => ({ ...scoreCandidate(candidate, brief, constraints), index }))
    .sort((first, second) => second.score - first.score || first.index - second.index);
  const hasMatches = scored.some((entry) => entry.score > 0);
  const fallbackCandidates = FALLBACK_INDICES.map((index) => POOL[index]);
  const picks = (hasMatches
    ? scored.filter((entry) => entry.score > 0).slice(0, 12).map((entry) => entry.candidate)
    : fallbackCandidates
  ).slice(0, 20);
  const pickIds = new Set(picks.map((candidate) => candidate.id));
  const selectedEntries = scored.filter((entry) => pickIds.has(entry.candidate.id));
  const passedEntries = scored.filter((entry) => !pickIds.has(entry.candidate.id)).slice(0, Math.max(4, 16 - picks.length));
  const consideredEntries = [...selectedEntries, ...passedEntries].slice(0, 20);
  const considered = consideredEntries.map(({ candidate, matches, score }): ConsideredCandidate => ({
    candidate,
    verdict: pickIds.has(candidate.id) ? "selected" : "passed",
    reason: pickIds.has(candidate.id)
      ? selectedReason(candidate, matches)
      : passedReason(candidate, score > 0),
  }));
  const searchText = [brief, ...constraints].map((value) => value.trim()).filter(Boolean).join("; ");
  const intro = searchText
    ? `I’m scanning ${POOL.length} profiles against “${searchText}”, prioritising direct role and experience evidence.`
    : `I’m scanning ${POOL.length} profiles for a balanced spread of seniority, sector and market experience.`;

  return {
    intro,
    considered,
    picks,
    summary: `${picks.length} strong fits — here’s the proposed long list.`,
  };
}
