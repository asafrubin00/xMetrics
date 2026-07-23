import { describe, expect, it } from "vitest";
import { ghostSlot, seatSlots } from "./room-geometry";

describe("room slot geometry", () => {
  for (const count of [3, 4, 5, 6]) {
    it(`assigns ${count} separated slots inside the viewBox`, () => {
      const positions = seatSlots(count);

      expect(positions).toHaveLength(count);

      for (const position of positions) {
        expect(position.x).toBeGreaterThanOrEqual(34);
        expect(position.x).toBeLessThanOrEqual(866);
        expect(position.y).toBeGreaterThanOrEqual(34);
        expect(position.y).toBeLessThanOrEqual(486);
      }

      for (let first = 0; first < positions.length; first += 1) {
        for (let second = first + 1; second < positions.length; second += 1) {
          const distance = Math.hypot(
            positions[first].x - positions[second].x,
            positions[first].y - positions[second].y,
          );
          expect(distance).toBeGreaterThanOrEqual(100);
        }
      }

      const ghost = ghostSlot(count);
      expect(positions).not.toContainEqual(ghost);
    });
  }

  it("uses the specified roster order and ghost slots", () => {
    expect(seatSlots(3)).toEqual([
      { x: 450, y: 100 },
      { x: 540, y: 420 },
      { x: 360, y: 420 },
    ]);
    expect(ghostSlot(6)).toEqual({ x: 450, y: 100 });
  });

  it("rejects unsupported seat counts", () => {
    expect(() => seatSlots(2)).toThrow(RangeError);
    expect(() => seatSlots(7)).toThrow(RangeError);
    expect(() => ghostSlot(2)).toThrow(RangeError);
  });
});
