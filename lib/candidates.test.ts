import { describe, expect, it } from "vitest";
import { CANDIDATES } from "./candidates.config";
import { TRAIT_IDS } from "./traits.config";

describe("CANDIDATES", () => {
  it("contains at least 16 candidates", () => {
    expect(CANDIDATES.length).toBeGreaterThanOrEqual(16);
  });

  it("gives every candidate a complete 0–100 trait profile", () => {
    for (const candidate of CANDIDATES) {
      expect(Object.keys(candidate.traits).sort()).toEqual([...TRAIT_IDS].sort());
      for (const traitId of TRAIT_IDS) {
        expect(candidate.traits[traitId]).toEqual(expect.any(Number));
        expect(candidate.traits[traitId]).toBeGreaterThanOrEqual(0);
        expect(candidate.traits[traitId]).toBeLessThanOrEqual(100);
      }
    }
  });

  it("uses a unique id for every candidate", () => {
    const ids = CANDIDATES.map((candidate) => candidate.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
