export interface DataRow {
  weight: number | null;
  pid3: string | null;
  wave: number | null;
  imp: Record<string, string | null>;
  perf: Record<string, string | null>;
}
export interface Data {
  impCols: string[],
  perfCols: string[],
  waves: {
    imp: number[],
    perf: number[]
  }
  impResponses: Set<string>,
  perfResponses: Set<string>,
  allPrinciples: Set<string>
  data: DataRow[]
}

interface ProportionViews {
  byResponse: number[];
  byResponseAndParty: number[][];
  byResponseAndWave: number[][];
  byResponseAndPartyAndWave: number[][][];
}

export interface ProportionGroups {
  collapsed: ProportionViews,
  expanded: ProportionViews
}