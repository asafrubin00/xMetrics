import { describe, expect, it } from "vitest";
import { buildLongListPlan } from "./ai-select";

function hasTag(candidate: ReturnType<typeof buildLongListPlan>["picks"][number], dimension: "functions" | "geographies" | "specialisms", tag: string) {
  return candidate[dimension].some((entry) => entry.tag === tag);
}

function apacCount(plan: ReturnType<typeof buildLongListPlan>) {
  return plan.picks.filter((candidate) => hasTag(candidate, "geographies", "APAC")).length;
}

describe("buildLongListPlan", () => {
  it("prioritises audit-chair and regulatory-governance experience", () => {
    const plan = buildLongListPlan("audit chair regulatory governance");

    expect(plan.picks.some((candidate) =>
      hasTag(candidate, "functions", "Audit Chair") ||
      hasTag(candidate, "specialisms", "Regulatory / Governance"),
    )).toBe(true);
  });

  it("biases picks towards APAC when the brief mentions it", () => {
    const baseline = buildLongListPlan("experienced board chair");
    const apac = buildLongListPlan("experienced board chair in APAC");

    expect(apacCount(apac)).toBeGreaterThan(apacCount(baseline));
  });

  it("returns one to twenty deterministic picks", () => {
    const first = buildLongListPlan("technology growth CEO");
    const second = buildLongListPlan("technology growth CEO");

    expect(first.picks.length).toBeGreaterThanOrEqual(1);
    expect(first.picks.length).toBeLessThanOrEqual(20);
    expect(second).toEqual(first);
  });

  it("returns a non-empty fallback for an empty brief", () => {
    expect(buildLongListPlan("").picks.length).toBeGreaterThan(0);
  });

  it("increases APAC representation when steered with a constraint", () => {
    const baseline = buildLongListPlan("audit chair regulatory governance");
    const steered = buildLongListPlan("audit chair regulatory governance", ["APAC"]);

    expect(apacCount(steered)).toBeGreaterThan(apacCount(baseline));
  });
});
