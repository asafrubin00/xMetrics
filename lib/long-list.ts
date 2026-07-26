import { POOL, type PoolCandidate } from "./pool.config";

export function resolveLongList(ids: string[]): PoolCandidate[] {
  const candidateById = new Map(POOL.map((candidate) => [candidate.id, candidate]));
  return ids
    .map((id) => candidateById.get(id))
    .filter((candidate): candidate is PoolCandidate => candidate !== undefined);
}
