import { describe, expect, it } from "vitest";
import { PERSONAS } from "./personas.config";
import { TRAITS } from "./traits.config";

describe("xMetrics configuration", () => {
  it("defines 16 traits with four traits in each group", () => {
    expect(TRAITS).toHaveLength(16);
    for (const group of ["drive", "thinking", "interpersonal", "pressure"] as const) {
      expect(TRAITS.filter((trait) => trait.group === group)).toHaveLength(4);
    }
  });

  it("gives every persona the complete bounded trait map", () => {
    const traitIds = TRAITS.map((trait) => trait.id).sort();
    expect(PERSONAS).toHaveLength(10);
    for (const persona of PERSONAS) {
      expect(Object.keys(persona.traits).sort()).toEqual(traitIds);
      expect(Object.values(persona.traits).every((score) => score >= 0 && score <= 100)).toBe(true);
    }
  });
});
