import { describe, expect, it } from "vitest";
import { ghostSlot, seatSlots } from "./room-geometry";

describe("room percentage geometry", () => {
  for (const count of [3, 4, 5, 6]) {
    it(`assigns ${count} unique slots within the square`, () => {
      const slots = seatSlots(count);

      expect(slots).toHaveLength(count);
      expect(new Set(slots.map(({ left, top }) => `${left}-${top}`)).size).toBe(count);
      for (const slot of slots) {
        expect(slot.left).toBeGreaterThanOrEqual(0);
        expect(slot.left).toBeLessThanOrEqual(100);
        expect(slot.top).toBeGreaterThanOrEqual(0);
        expect(slot.top).toBeLessThanOrEqual(100);
      }
      expect(slots).not.toContainEqual(ghostSlot(count));
    });
  }

  it("uses the specified roster order and bottom label placement", () => {
    expect(seatSlots(3)).toEqual([
      { left: 50, top: 9, labelAbove: false },
      { left: 72, top: 91, labelAbove: true },
      { left: 28, top: 91, labelAbove: true },
    ]);
    expect(ghostSlot(6)).toEqual({ left: 50, top: 9, labelAbove: false });
  });

  it("rejects unsupported seat counts", () => {
    expect(() => seatSlots(2)).toThrow(RangeError);
    expect(() => seatSlots(7)).toThrow(RangeError);
    expect(() => ghostSlot(2)).toThrow(RangeError);
  });
});
