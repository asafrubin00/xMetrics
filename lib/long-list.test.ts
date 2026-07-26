import { describe, expect, it } from "vitest";
import { POOL } from "./pool.config";
import { resolveLongList } from "./long-list";

describe("resolveLongList", () => {
  it("maps ids to candidates in the supplied order", () => {
    const candidates = resolveLongList([POOL[4].id, POOL[1].id]);

    expect(candidates).toEqual([POOL[4], POOL[1]]);
  });

  it("ignores unknown ids", () => {
    expect(resolveLongList(["unknown-candidate", POOL[2].id])).toEqual([POOL[2]]);
  });

  it("returns an empty array for empty input", () => {
    expect(resolveLongList([])).toEqual([]);
  });
});
