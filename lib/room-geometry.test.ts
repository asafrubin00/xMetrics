import { describe, expect, it } from "vitest";
import { seatPositions } from "./room-geometry";

describe("seatPositions", () => {
  for (const count of [3, 4, 5, 6]) {
    it(`places ${count} seats safely around the table`, () => {
      const positions = seatPositions(count);

      expect(positions).toHaveLength(count);
      expect(positions[0].x).toBeCloseTo(450);
      expect(positions[0].y).toBeCloseTo(84);

      for (const position of positions) {
        expect(position.x).toBeGreaterThanOrEqual(38);
        expect(position.x).toBeLessThanOrEqual(862);
        expect(position.y).toBeGreaterThanOrEqual(38);
        expect(position.y).toBeLessThanOrEqual(522);
      }

      for (let first = 0; first < positions.length; first += 1) {
        for (let second = first + 1; second < positions.length; second += 1) {
          const distance = Math.hypot(
            positions[first].x - positions[second].x,
            positions[first].y - positions[second].y,
          );
          expect(distance).toBeGreaterThan(90);
        }
      }
    });
  }

  it("rejects unsupported seat counts", () => {
    expect(() => seatPositions(2)).toThrow(RangeError);
    expect(() => seatPositions(7)).toThrow(RangeError);
  });
});
