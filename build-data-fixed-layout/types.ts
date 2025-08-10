interface DataRow {
  weight: number | null;
  pid3: string | null;
  wave: number | null;
  imp: Record<string, string | null>;
  perf: Record<string, string | null>;
}
export interface Data {
  impCols: string[],
  perfCols: string[],
  data: DataRow[]
}