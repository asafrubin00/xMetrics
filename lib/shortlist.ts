export interface ShortlistPick {
  candidateId: string;
  rank: number;
  reason: string;
}

export interface RankedCandidate {
  candidateId: string;
  rank: number;
}

export interface Shortlist {
  picks: ShortlistPick[];
  ranked: RankedCandidate[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isConsecutiveRank(value: unknown, expectedRank: number): value is number {
  return Number.isInteger(value) && value === expectedRank;
}

function wordCount(value: string): number {
  return value.trim().split(/\s+/).length;
}

export function validateShortlist(
  value: unknown,
  candidateIds: ReadonlySet<string>,
  seatCount: number,
): value is Shortlist {
  if (!isRecord(value) ||
    !Array.isArray(value.picks) ||
    value.picks.length !== seatCount ||
    !Array.isArray(value.ranked) ||
    value.ranked.length !== candidateIds.size) {
    return false;
  }

  const rankedAreValid = value.ranked.every((candidate, index) =>
    isRecord(candidate) &&
    isNonEmptyString(candidate.candidateId) &&
    candidateIds.has(candidate.candidateId) &&
    isConsecutiveRank(candidate.rank, index + 1),
  );
  const rankedIds = value.ranked
    .filter(isRecord)
    .map((candidate) => candidate.candidateId);

  const picksAreValid = value.picks.every((pick, index) =>
    isRecord(pick) &&
    isNonEmptyString(pick.candidateId) &&
    pick.candidateId === rankedIds[index] &&
    isConsecutiveRank(pick.rank, index + 1) &&
    isNonEmptyString(pick.reason) &&
    wordCount(pick.reason) <= 20,
  );

  return rankedAreValid &&
    picksAreValid &&
    new Set(rankedIds).size === candidateIds.size;
}

export function parseShortlistResponse(
  responseText: string,
  candidateIds: ReadonlySet<string>,
  seatCount: number,
): Shortlist | null {
  const withoutFences = responseText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const parsed: unknown = JSON.parse(withoutFences);
    return validateShortlist(parsed, candidateIds, seatCount) ? parsed : null;
  } catch {
    return null;
  }
}
