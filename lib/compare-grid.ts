export function compareGridClass(count: number): string {
  if (count === 1) return "mx-auto w-full max-w-3xl grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) return "grid-cols-3";
  if (count === 4) return "grid-cols-2 grid-rows-2";
  return "grid-cols-1";
}
