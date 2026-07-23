export interface SeatPosition {
  x: number;
  y: number;
}

const CENTRE_X = 450;
const CENTRE_Y = 280;
const RING_RADIUS_X = 322;
const RING_RADIUS_Y = 196;

export function seatPositions(count: number): SeatPosition[] {
  if (!Number.isInteger(count) || count < 3 || count > 6) {
    throw new RangeError("The Room supports between three and six seats.");
  }

  return Array.from({ length: count }, (_, index) => {
    const angle = -90 + index * (360 / count);
    const radians = angle * (Math.PI / 180);

    return {
      x: CENTRE_X + RING_RADIUS_X * Math.cos(radians),
      y: CENTRE_Y + RING_RADIUS_Y * Math.sin(radians),
    };
  });
}
