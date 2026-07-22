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
      narrative: `${formatNames(qualifyingMembers)} all tend to ${trait.highDescriptor}. Under pressure, their competing instincts may make shared ownership harder to establish.`,
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
      narrative: `${teamReference} naturally reaches the point where they ${trait.highDescriptor}; the collective tendency is instead to ${trait.lowDescriptor}. That gap may become consequential when the situation demands the opposite.`,
    }];
  });

  const polarities = TRAITS.flatMap((trait) => {
    const signals: DerivedSignal[] = [];

    for (let firstIndex = 0; firstIndex < members.length; firstIndex += 1) {
      for (let secondIndex = firstIndex + 1; secondIndex < members.length; secondIndex += 1) {
        const first = members[firstIndex];
        const second = members[secondIndex];
        const gap = Math.abs(scoreFor(first, trait) - scoreFor(second, trait));

        if (gap < POLARITY_GAP) continue;

        const [lowerMember, higherMember] =
          scoreFor(first, trait) <= scoreFor(second, trait)
            ? [first, second]
            : [second, first];

        signals.push({
          kind: "polarity",
          traitId: trait.id,
          memberIds: [first.id, second.id],
          narrative: `${lowerMember.displayName} tends to ${trait.lowDescriptor}, while ${higherMember.displayName} is more likely to ${trait.highDescriptor}. Their opposing instincts create a predictable point of friction.`,
        });
      }
    }

    return signals;
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
      narrative: `When pressure peaks, ${member.displayName} is most likely to ${descriptor}.`,
    };
  });
}
