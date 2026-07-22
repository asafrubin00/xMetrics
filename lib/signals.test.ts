import { describe, expect, it } from "vitest";
import { DEMO_TEAM, PERSONAS } from "./personas.config";
import { computeExposures, computeSignals } from "./signals";
import { TRAITS } from "./traits.config";
import type { TeamMember } from "./types";

const baselineTraits = Object.fromEntries(TRAITS.map((trait) => [trait.id, 60]));

function member(
  id: string,
  displayName: string,
  overrides: Record<string, number> = {},
): TeamMember {
  return {
    id,
    displayName,
    role: "Director",
    traits: { ...baselineTraits, ...overrides },
  };
}

describe("computeSignals", () => {
  it("emits one concentration for all qualifying members on a Group A trait", () => {
    const members = [
      member("a", "Ada", { dominance: 75 }),
      member("b", "Ben", { dominance: 88 }),
      member("c", "Cleo", { dominance: 74 }),
    ];

    const signals = computeSignals(members).filter(
      (signal) => signal.kind === "concentration" && signal.traitId === "dominance",
    );

    expect(signals).toHaveLength(1);
    expect(signals[0].memberIds).toEqual(["a", "b"]);
    expect(signals[0].narrative).toContain("Ada and Ben");
    expect(signals[0].narrative).toContain(
      TRAITS.find((trait) => trait.id === "dominance")?.highDescriptor,
    );
  });

  it("does not apply concentration detection outside Group A", () => {
    const members = [
      member("a", "Ada", { analytical_depth: 90 }),
      member("b", "Ben", { analytical_depth: 85 }),
    ];

    expect(
      computeSignals(members).some(
        (signal) => signal.kind === "concentration" && signal.traitId === "analytical_depth",
      ),
    ).toBe(false);
  });

  it("emits a vacuum below 60 and treats exactly 60 as filling it", () => {
    const belowThreshold = [
      member("a", "Ada", { ambition: 59 }),
      member("b", "Ben", { ambition: 42 }),
    ];
    const atThreshold = [
      member("a", "Ada", { ambition: 59 }),
      member("b", "Ben", { ambition: 60 }),
    ];

    const vacuum = computeSignals(belowThreshold).find(
      (signal) => signal.kind === "vacuum" && signal.traitId === "ambition",
    );
    expect(vacuum?.memberIds).toEqual([]);
    expect(vacuum?.narrative).toContain(
      TRAITS.find((trait) => trait.id === "ambition")?.lowDescriptor,
    );
    expect(
      computeSignals(atThreshold).some(
        (signal) => signal.kind === "vacuum" && signal.traitId === "ambition",
      ),
    ).toBe(false);
  });

  it("only detects vacuums across Group A and Group C", () => {
    const members = [
      member("a", "Ada", { innovation: 20, composure: 20 }),
      member("b", "Ben", { innovation: 30, composure: 30 }),
    ];

    const signals = computeSignals(members);
    expect(signals.some((signal) => signal.kind === "vacuum" && signal.traitId === "innovation")).toBe(false);
    expect(signals.some((signal) => signal.kind === "vacuum" && signal.traitId === "composure")).toBe(false);
  });

  it("emits every qualifying pair at the inclusive 40-point polarity boundary", () => {
    const members = [
      member("a", "Ada", { innovation: 40 }),
      member("b", "Ben", { innovation: 80 }),
      member("c", "Cleo", { innovation: 85 }),
    ];

    const polarities = computeSignals(members).filter(
      (signal) => signal.kind === "polarity" && signal.traitId === "innovation",
    );
    expect(polarities.map((signal) => signal.memberIds)).toEqual([
      ["a", "b"],
      ["a", "c"],
    ]);
    expect(polarities[0].narrative).toContain("Ada");
    expect(polarities[0].narrative).toContain("Ben");
  });

  it("returns no signals for a balanced team", () => {
    const members = [member("a", "Ada"), member("b", "Ben"), member("c", "Cleo")];
    expect(computeSignals(members)).toEqual([]);
  });

  it("produces every signal kind for the configured demo team", () => {
    const demoMembers = DEMO_TEAM.map((id) => {
      const persona = PERSONAS.find((candidate) => candidate.id === id);
      if (!persona) throw new Error(`Unknown demo persona: ${id}`);
      return persona;
    });
    const kinds = new Set(computeSignals(demoMembers).map((signal) => signal.kind));

    expect(kinds).toEqual(new Set(["concentration", "vacuum", "polarity"]));
  });
});

describe("computeExposures", () => {
  it("selects each member's most extreme pressure trait and direction", () => {
    const members = [
      member("a", "Ada", { composure: 49, control_retention: 20, optimism_bias: 52, accountability: 55 }),
      member("b", "Ben", { composure: 80, control_retention: 48, optimism_bias: 52, accountability: 55 }),
    ];

    expect(computeExposures(members)).toMatchObject([
      { memberId: "a", traitId: "control_retention", direction: "low" },
      { memberId: "b", traitId: "composure", direction: "high" },
    ]);
    expect(computeExposures(members)[0].narrative).toContain("Ada");
    expect(computeExposures(members)[0].narrative).toContain(
      TRAITS.find((trait) => trait.id === "control_retention")?.lowDescriptor,
    );
  });

  it("resolves equal distances deterministically by trait configuration order", () => {
    const exposure = computeExposures([
      member("a", "Ada", { composure: 20, control_retention: 80, optimism_bias: 50, accountability: 50 }),
    ])[0];

    expect(exposure.traitId).toBe("composure");
    expect(exposure.direction).toBe("low");
  });
});
