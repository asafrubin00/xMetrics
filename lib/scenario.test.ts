import { describe, expect, it } from "vitest";
import { parseScenarioResponse, validateScenario } from "./scenario";
import type { Scenario } from "./types";

const memberIds = new Set(["maya", "priya", "tom"]);

const validScenario: Scenario = {
  companyContext: "A Series B infrastructure company approaching a funding decision.",
  beats: [
    { index: 1, title: "The revised forecast", body: "The board pack changes overnight.", memberMoments: [{ memberId: "maya", moment: "Maya calls the team together." }] },
    { index: 2, title: "Terms harden", body: "The lead investor changes the terms.", memberMoments: [{ memberId: "priya", moment: "Priya tests the downside case." }] },
    { index: 3, title: "The fork", body: "The team must choose before noon.", memberMoments: [{ memberId: "tom", moment: "Tom argues for protecting the product plan." }] },
  ],
  options: [
    { id: "accept", title: "Accept the terms", description: "Secure the runway. Absorb the governance cost." },
    { id: "bridge", title: "Build a bridge", description: "Ask insiders for time. Carry financing risk." },
    { id: "cut", title: "Reset the plan", description: "Reduce the burn. Preserve strategic control." },
  ],
};

describe("validateScenario", () => {
  it("accepts a complete scenario", () => {
    expect(validateScenario(validScenario, memberIds)).toBe(true);
  });

  it("rejects the wrong beat count", () => {
    expect(validateScenario({ ...validScenario, beats: validScenario.beats.slice(0, 2) }, memberIds)).toBe(false);
  });

  it("rejects a member moment with an unknown member id", () => {
    const beats = structuredClone(validScenario.beats);
    beats[1].memberMoments[0].memberId = "outsider";
    expect(validateScenario({ ...validScenario, beats }, memberIds)).toBe(false);
  });

  it("rejects missing options", () => {
    const withoutOptions: Record<string, unknown> = { ...validScenario };
    delete withoutOptions.options;
    expect(validateScenario(withoutOptions, memberIds)).toBe(false);
  });

  it("defensively removes JSON fences before parsing", () => {
    expect(parseScenarioResponse(`\`\`\`json\n${JSON.stringify(validScenario)}\n\`\`\``, memberIds)).toEqual(validScenario);
  });
});
