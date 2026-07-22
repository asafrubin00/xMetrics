import { describe, expect, it } from "vitest";
import { PERSONAS } from "./personas.config";
import { parseMembers, serialiseMembers } from "./session-storage";

describe("member persistence", () => {
  it("round-trips members without changing their trait data", () => {
    const members = [PERSONAS[0], PERSONAS[4]];
    expect(parseMembers(serialiseMembers(members))).toEqual(members);
  });

  it("fails safely for missing or malformed storage", () => {
    expect(parseMembers(null)).toEqual([]);
    expect(parseMembers("not-json")).toEqual([]);
  });
});
