export interface SeatPosition {
  x: number;
  y: number;
}

const SLOTS = {
  TL: { x: 360, y: 100 },
  TC: { x: 450, y: 100 },
  TR: { x: 540, y: 100 },
  L: { x: 210, y: 260 },
  R: { x: 690, y: 260 },
  BL: { x: 360, y: 420 },
  BC: { x: 450, y: 420 },
  BR: { x: 540, y: 420 },
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

export function seatSlots(count: number): SeatPosition[] {
  supportedCount(count);
  return ASSIGNMENTS[count].map((slot) => ({ ...SLOTS[slot] }));
}

export function ghostSlot(count: number): SeatPosition {
  supportedCount(count);
  return { ...SLOTS[GHOST_ASSIGNMENTS[count]] };
}
