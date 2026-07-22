import type { Scenario, ScenarioBeat, StrategyOption } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isOption(value: unknown): value is StrategyOption {
  return isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description);
}

function isBeat(
  value: unknown,
  expectedIndex: 1 | 2 | 3,
  memberIds: ReadonlySet<string>,
): value is ScenarioBeat {
  if (!isRecord(value) ||
    value.index !== expectedIndex ||
    !isNonEmptyString(value.title) ||
    !isNonEmptyString(value.body) ||
    !Array.isArray(value.memberMoments)) {
    return false;
  }

  return value.memberMoments.every((moment) =>
    isRecord(moment) &&
    isNonEmptyString(moment.memberId) &&
    memberIds.has(moment.memberId) &&
    isNonEmptyString(moment.moment),
  );
}

export function validateScenario(
  value: unknown,
  memberIds: ReadonlySet<string>,
): value is Scenario {
  if (!isRecord(value) ||
    !isNonEmptyString(value.companyContext) ||
    !Array.isArray(value.beats) ||
    value.beats.length !== 3 ||
    !Array.isArray(value.options) ||
    value.options.length !== 3) {
    return false;
  }

  const beatsAreValid = value.beats.every((beat, index) =>
    isBeat(beat, (index + 1) as 1 | 2 | 3, memberIds),
  );
  const optionsAreValid = value.options.every(isOption);
  const optionIds = value.options
    .filter(isOption)
    .map((option) => option.id);

  return beatsAreValid && optionsAreValid && new Set(optionIds).size === 3;
}

export function parseScenarioResponse(
  responseText: string,
  memberIds: ReadonlySet<string>,
): Scenario | null {
  const withoutFences = responseText
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    const parsed: unknown = JSON.parse(withoutFences);
    return validateScenario(parsed, memberIds) ? parsed : null;
  } catch {
    return null;
  }
}
