import type { Debrief, TeamMember } from "./types";

function debriefText(debrief: Debrief): string {
  return [
    debrief.whatHappened,
    debrief.choiceAnalysis,
    ...debrief.investorFindings,
    debrief.whatWouldChange,
  ].join("\n");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function mostNamedMember(
  members: TeamMember[],
  debrief: Debrief,
): TeamMember | undefined {
  const text = debriefText(debrief);
  let highestCount = 0;
  let mostNamed: TeamMember | undefined;

  for (const member of members) {
    const count = text.match(new RegExp(escapeRegExp(member.displayName), "gi"))?.length ?? 0;
    if (count > highestCount) {
      highestCount = count;
      mostNamed = member;
    }
  }

  return mostNamed;
}

export function findingLabel(finding: string): string {
  const boldPhrase = finding.match(/^\s*\*\*([^*]+)\*\*/)?.[1]?.trim();
  if (boldPhrase) return boldPhrase.replace(/:$/, "");

  return finding
    .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(" ");
}
