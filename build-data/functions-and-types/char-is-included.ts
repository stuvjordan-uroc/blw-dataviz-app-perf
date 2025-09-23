import type { Data } from "./types.ts";
export default function charIsIncluded(
  char: string,
  q: "imp" | "perf",
  data: Data,
  wave: number
) {
  const subset = data.data.filter(
    (row) =>
      row.wave === wave && //row.wave is equal to the wave requested
      row.pid3 && //row.pid3 is not null
      row[q][char] && //row.imp[char] is not null
      row.weight //row.weight is not null
  );
  return subset.length !== 0;
}
