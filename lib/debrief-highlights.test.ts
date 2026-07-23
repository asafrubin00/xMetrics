import { describe, expect, it } from "vitest";
import { findingLabel, mostNamedMember } from "./debrief-highlights";
import type { Debrief, TeamMember } from "./types";

const members: TeamMember[] = [
  { id: "maya", displayName: "Maya Chen", role: "CEO", traits: {} },
  { id: "priya", displayName: "Priya Nair", role: "CFO", traits: {} },
  { id: "tom", displayName: "Tom Bennett", role: "CTO", traits: {} },
];

const debrief: Debrief = {
  whatHappened: "Maya Chen convened the room. Priya Nair tested the downside.",
  choiceAnalysis: "Maya Chen retained the final decision while Tom Bennett challenged the timing.",
  investorFindings: [
    "Maya Chen remains the decision bottleneck.",
    "Priya Nair and Maya Chen create a productive challenge.",
  ],
  whatWouldChange: "A strong operator would give Maya Chen room to delegate.",
};

describe("debrief highlights", () => {
  it("returns the individual named most often across the generated debrief", () => {
    expect(mostNamedMember(members, debrief)?.id).toBe("maya");
  });

  it("returns no individual when the debrief names nobody", () => {
    const unnamed = { ...debrief, whatHappened: "", choiceAnalysis: "", investorFindings: [], whatWouldChange: "" };
    expect(mostNamedMember(members, unnamed)).toBeUndefined();
  });

  it("uses a leading bold phrase as the finding label", () => {
    expect(findingLabel("**Decision bottleneck:** Maya retains control.")).toBe("Decision bottleneck");
  });

  it("falls back to the first four words", () => {
    expect(findingLabel("Maya remains the central decision maker.")).toBe("Maya remains the central");
  });
});
