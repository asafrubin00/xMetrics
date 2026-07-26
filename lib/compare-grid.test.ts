import { describe, expect, it } from "vitest";
import { compareGridClass } from "./compare-grid";

describe("compareGridClass", () => {
  it("returns the centred single-panel layout", () => {
    expect(compareGridClass(1)).toContain("max-w-3xl");
    expect(compareGridClass(1)).toContain("grid-cols-1");
  });

  it("maps two, three and four candidates to their comparison layouts", () => {
    expect(compareGridClass(2)).toBe("grid-cols-2");
    expect(compareGridClass(3)).toBe("grid-cols-3");
    expect(compareGridClass(4)).toBe("grid-cols-2 grid-rows-2");
  });
});
