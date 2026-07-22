import type { TeamMember } from "./types";

export const TEAM_STORAGE_KEY = "xmetrics.team";

export function serialiseMembers(members: TeamMember[]): string {
  return JSON.stringify(members);
}

export function parseMembers(value: string | null): TeamMember[] {
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (member): member is TeamMember =>
        typeof member === "object" &&
        member !== null &&
        typeof member.id === "string" &&
        typeof member.displayName === "string" &&
        typeof member.role === "string" &&
        typeof member.traits === "object" &&
        member.traits !== null,
    );
  } catch {
    return [];
  }
}
