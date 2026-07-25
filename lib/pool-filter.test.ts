import { describe, expect, it } from "vitest";
import { filterPool, type PoolFilterState } from "./pool-filter";
import { POOL } from "./pool.config";

const poolAges = POOL.map((candidate) => candidate.age);
const emptyState: PoolFilterState = {
  industries: [],
  functions: [],
  geographies: [],
  companyTypes: [],
  specialisms: [],
  minAge: Math.min(...poolAges),
  maxAge: Math.max(...poolAges),
};

describe("filterPool", () => {
  it("returns all 50 candidates for the empty state", () => {
    expect(filterPool(POOL, emptyState)).toHaveLength(50);
  });

  it("filters to candidates with a selected industry", () => {
    const result = filterPool(POOL, {
      ...emptyState,
      industries: [{ tag: "Healthcare", minYears: 0 }],
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(50);
    expect(result.every((candidate) =>
      candidate.industries.some((entry) => entry.tag === "Healthcare"),
    )).toBe(true);
  });

  it("excludes a candidate below the selected tag's years threshold", () => {
    const result = filterPool(POOL, {
      ...emptyState,
      industries: [{ tag: "Technology", minYears: 19 }],
    });

    expect(POOL.find((candidate) => candidate.id === "maya-chen")?.industries)
      .toContainEqual({ tag: "Technology", years: 18 });
    expect(result.some((candidate) => candidate.id === "maya-chen")).toBe(false);
  });

  it("applies selections across two dimensions as AND", () => {
    const technology = filterPool(POOL, {
      ...emptyState,
      industries: [{ tag: "Technology", minYears: 0 }],
    });
    const africa = filterPool(POOL, {
      ...emptyState,
      geographies: [{ tag: "Africa", minYears: 0 }],
    });
    const combined = filterPool(POOL, {
      ...emptyState,
      industries: [{ tag: "Technology", minYears: 0 }],
      geographies: [{ tag: "Africa", minYears: 0 }],
    });
    const technologyIds = new Set(technology.map((candidate) => candidate.id));
    const africaIds = new Set(africa.map((candidate) => candidate.id));

    expect(combined.length).toBeGreaterThan(0);
    expect(combined.every((candidate) =>
      technologyIds.has(candidate.id) && africaIds.has(candidate.id),
    )).toBe(true);
  });

  it("reduces the pool with a narrower age range", () => {
    const result = filterPool(POOL, {
      ...emptyState,
      minAge: 38,
      maxAge: 42,
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(50);
    expect(result.every((candidate) => candidate.age >= 38 && candidate.age <= 42)).toBe(true);
  });
});
