export interface SeatSlot {
  left: number;
  top: number;
  labelAbove: boolean;
}

const SLOTS = {
  TL: { left: 28, top: 9, labelAbove: false },
  TC: { left: 50, top: 9, labelAbove: false },
  TR: { left: 72, top: 9, labelAbove: false },
  R: { left: 90, top: 50, labelAbove: false },
  BR: { left: 72, top: 91, labelAbove: true },
  BC: { left: 50, top: 91, labelAbove: true },
  BL: { left: 28, top: 91, labelAbove: true },
  L: { left: 10, top: 50, labelAbove: false },
} as const;

const ASSIGNMENTS = {
  3: ["TC", "BR", "BL"],
  4: ["TC", "R", "BC", "L"],
  5: ["TC", "R", "BR", "BL", "L"],
  6: ["TL", "TR", "R", "BR", "BL", "L"],
} as const;

const GHOST_ASSIGNMENTS = {
  3: "R",
  4: "TR",
  5: "BC",
  6: "TC",
} as const;

function supportedCount(count: number): asserts count is keyof typeof ASSIGNMENTS {
  if (!Number.isInteger(count) || count < 3 || count > 6) {
    throw new RangeError("The Room supports between three and six seats.");
  }
}

export function seatSlots(count: number): SeatSlot[] {
  supportedCount(count);
  return ASSIGNMENTS[count].map((slot) => ({ ...SLOTS[slot] }));
}

export function ghostSlot(count: number): SeatSlot {
  supportedCount(count);
  return { ...SLOTS[GHOST_ASSIGNMENTS[count]] };
}
