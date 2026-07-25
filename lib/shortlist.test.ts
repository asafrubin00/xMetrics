import { describe, expect, it } from "vitest";
import { parseShortlistResponse, validateShortlist, type Shortlist } from "./shortlist";

const candidateIds = new Set(["ada", "ben", "cleo", "dev"]);
const validShortlist: Shortlist = {
  picks: [
    { candidateId: "ada", rank: 1, reason: "Stays measured under challenge and has led regulated boards." },
    { candidateId: "ben", rank: 2, reason: "Tests the downside without slowing a decision." },
    { candidateId: "cleo", rank: 3, reason: "Builds alignment across competing senior voices." },
  ],
  ranked: [
    { candidateId: "ada", rank: 1 },
    { candidateId: "ben", rank: 2 },
    { candidateId: "cleo", rank: 3 },
    { candidateId: "dev", rank: 4 },
  ],
};

describe("validateShortlist", () => {
  it("accepts a complete shortlist and full ranking", () => {
    expect(validateShortlist(validShortlist, candidateIds, 3)).toBe(true);
  });

  it("rejects an unknown candidate id", () => {
    const shortlist = structuredClone(validShortlist);
    shortlist.ranked[3].candidateId = "outsider";
    expect(validateShortlist(shortlist, candidateIds, 3)).toBe(false);
  });

  it("rejects non-consecutive ranks", () => {
    const shortlist = structuredClone(validShortlist);
    shortlist.ranked[2].rank = 4;
    expect(validateShortlist(shortlist, candidateIds, 3)).toBe(false);
  });

  it("rejects picks that do not lead the full ranking", () => {
    const shortlist = structuredClone(validShortlist);
    shortlist.picks[0].candidateId = "ben";
    expect(validateShortlist(shortlist, candidateIds, 3)).toBe(false);
  });

  it("rejects reasons longer than 20 words", () => {
    const shortlist = structuredClone(validShortlist);
    shortlist.picks[0].reason = Array.from({ length: 21 }, () => "word").join(" ");
    expect(validateShortlist(shortlist, candidateIds, 3)).toBe(false);
  });

  it("defensively removes JSON fences before parsing", () => {
    expect(parseShortlistResponse(`\`\`\`json\n${JSON.stringify(validShortlist)}\n\`\`\``, candidateIds, 3)).toEqual(validShortlist);
  });
});
