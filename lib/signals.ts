import { TRAITS, type TraitDefinition } from "./traits.config";
import type { DerivedSignal, PressureExposure, TeamMember } from "./types";

const CONCENTRATION_THRESHOLD = 75;
const VACUUM_THRESHOLD = 60;
const POLARITY_GAP = 40;

const driveTraits = TRAITS.filter((trait) => trait.group === "drive");
const vacuumTraits = TRAITS.filter(
  (trait) => trait.group === "drive" || trait.group === "interpersonal",
);
const pressureTraits = TRAITS.filter((trait) => trait.group === "pressure");

function scoreFor(member: TeamMember, trait: TraitDefinition): number {
  return member.traits[trait.id];
}

function formatNames(members: TeamMember[]): string {
  const names = members.map((member) => member.displayName);

  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

export function computeSignals(members: TeamMember[]): DerivedSignal[] {
  const concentrations = driveTraits.flatMap((trait) => {
    const qualifyingMembers = members.filter(
      (member) => scoreFor(member, trait) >= CONCENTRATION_THRESHOLD,
    );

    if (qualifyingMembers.length < 2) return [];

    return [{
      kind: "concentration" as const,
      traitId: trait.id,
      memberIds: qualifyingMembers.map((member) => member.id),
      narrative: `${formatNames(qualifyingMembers)} share the same strong tendency: ${trait.highDescriptor}. Under pressure, their competing instincts may make shared ownership harder to establish.`,
    }];
  });

  const vacuums = vacuumTraits.flatMap((trait) => {
    if (members.some((member) => scoreFor(member, trait) >= VACUUM_THRESHOLD)) {
      return [];
    }

    const teamReference = members.length > 0
      ? `Across ${formatNames(members)}, nobody`
      : "Nobody";

    return [{
      kind: "vacuum" as const,
      traitId: trait.id,
      memberIds: [],
      narrative: `${teamReference} naturally shows the high-end tendency — ${trait.highDescriptor}. The collective sits closer to the opposite pattern: ${trait.lowDescriptor}. That gap may become consequential when the situation demands otherwise.`,
    }];
  });

  const polarities = TRAITS.flatMap((trait) => {
    const scores = members.map((member) => scoreFor(member, trait));
    const minimum = Math.min(...scores);
    const maximum = Math.max(...scores);

    if (maximum - minimum < POLARITY_GAP) return [];

    const midpoint = (minimum + maximum) / 2;
    const highGroup = members.filter((member) => scoreFor(member, trait) >= midpoint);
    const lowGroup = members.filter((member) => scoreFor(member, trait) < midpoint);

    return [{
      kind: "polarity" as const,
      traitId: trait.id,
      memberIds: [...highGroup, ...lowGroup].map((member) => member.id),
      narrative: `${trait.name} divides the team. ${formatNames(highGroup)} lean to the high end (${trait.highDescriptor}); ${formatNames(lowGroup)} sit at the low end (${trait.lowDescriptor}). Expect a predictable fault line when a decision turns on this.`,
    }];
  });

  return [...concentrations, ...vacuums, ...polarities];
}

export function computeExposures(members: TeamMember[]): PressureExposure[] {
  return members.map((member) => {
    const mostExtreme = pressureTraits.reduce((current, candidate) =>
      Math.abs(scoreFor(member, candidate) - 50) >
      Math.abs(scoreFor(member, current) - 50)
        ? candidate
        : current,
    );
    const direction = scoreFor(member, mostExtreme) >= 50 ? "high" : "low";
    const descriptor =
      direction === "high" ? mostExtreme.highDescriptor : mostExtreme.lowDescriptor;

    return {
      memberId: member.id,
      traitId: mostExtreme.id,
      direction,
      narrative: `When pressure peaks, ${member.displayName}'s most pronounced response is ${descriptor}.`,
    };
  });
}
