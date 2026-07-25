import { describe, expect, it } from "vitest";
import { CANDIDATES } from "./candidates.config";
import {
  COMPANY_TYPES,
  FUNCTIONS,
  GEOGRAPHIES,
  INDUSTRIES,
  POOL,
  SPECIALISMS,
  type ExperienceTag,
} from "./pool.config";
import { TRAIT_IDS } from "./traits.config";

describe("POOL", () => {
  it("contains exactly 50 candidates with unique ids", () => {
    expect(POOL).toHaveLength(50);
    expect(new Set(POOL.map((candidate) => candidate.id)).size).toBe(50);
  });

  it("gives every candidate a complete 0–100 trait profile", () => {
    for (const candidate of POOL) {
      expect(Object.keys(candidate.traits).sort()).toEqual([...TRAIT_IDS].sort());
      for (const traitId of TRAIT_IDS) {
        expect(candidate.traits[traitId]).toEqual(expect.any(Number));
        expect(candidate.traits[traitId]).toBeGreaterThanOrEqual(0);
        expect(candidate.traits[traitId]).toBeLessThanOrEqual(100);
      }
    }
  });

  it("gives every candidate complete pool metadata", () => {
    const experienceArrays = (candidate: (typeof POOL)[number]) => [
      candidate.industries,
      candidate.functions,
      candidate.geographies,
      candidate.companyTypes,
      candidate.specialisms,
    ];

    for (const candidate of POOL) {
      expect(candidate.age).toBeGreaterThanOrEqual(30);
      expect(candidate.age).toBeLessThanOrEqual(80);
      expect(candidate.bio.trim().length).toBeGreaterThan(0);
      for (const experience of experienceArrays(candidate)) {
        expect(experience.length).toBeGreaterThan(0);
        for (const entry of experience) {
          expect(entry.years).toBeGreaterThanOrEqual(0);
          expect(entry.years).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it("uses only tags from the matching filter vocabularies", () => {
    const expectTagsIn = (
      experience: ExperienceTag[],
      vocabulary: readonly string[],
    ) => {
      for (const { tag } of experience) expect(vocabulary).toContain(tag);
    };

    for (const candidate of POOL) {
      expectTagsIn(candidate.industries, INDUSTRIES);
      expectTagsIn(candidate.functions, FUNCTIONS);
      expectTagsIn(candidate.geographies, GEOGRAPHIES);
      expectTagsIn(candidate.companyTypes, COMPANY_TYPES);
      expectTagsIn(candidate.specialisms, SPECIALISMS);
    }
  });

  it("reuses the existing candidates as the first 18 entries", () => {
    expect(POOL.slice(0, CANDIDATES.length).map((candidate) => candidate.id))
      .toEqual(CANDIDATES.map((candidate) => candidate.id));
  });
});
