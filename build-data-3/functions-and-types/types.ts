export interface DataRow {
  weight: number | null;
  pid3: string | null;
  wave: number | null;
  imp: Record<string, string | null>;
  perf: Record<string, string | null>;
}

// This is a dataset
export interface Data {
  impCols: string[];
  perfCols: string[];
  waves: {
    imp: number[];
    perf: number[];
  };
  impResponses: Set<string>;
  perfResponses: Set<string>;
  allPrinciples: Set<string>;
  data: DataRow[];
}
export interface VizConfig {
  responseGroups: {
    collapsed: string[][];
    expanded: string[][];
  };
  partyGroups: string[][];
  sampleSize: number;
}
export interface Layout {
  screenWidthRange: number[];
  vizWidth: number;
  waveHeight: number;
  pointRadius: number;
  responseGap: number;
  partyGap: number;
  labelHeight: number;
}
export interface Out {
  layouts: Record<string, Layout>;
  vizConfig: VizConfig;
  viz: Record<string, Viz>;
}

export type ProportionsMap = Map<number, Map<string[], {
  expanded: Map<string[], {
    proportion: number;
    prevCumProportion: number;
  }>;
  collapsed: Map<string[], {
    proportion: number;
    prevCumProportion: number;
  }>;
}> | null>

export interface Viz {
  proportions: ProportionsMap
  counts: Map<
    number,
    null |
    Map<
      string[],
      Map<
        string[],
        number
      >
    >
  >,
  segments: {
    unsplit: Segment,
    collapsed: {
      byResponse: Map<string[], Segment>,
      byResponseAndParty: Map<string[], Segment>,
      byResponseAndWave: Map<
        number,
        null |
        Map<
          string[],
          Segment
        >
      >,
      byResponseAndPartyAndWave: Map<
        number,
        null |
        Map<
          string[],
          Segment
        >
      >
    }
    expanded: {
      byResponse: Map<string[], Segment>,
      byResponseAndParty: Map<string[], Segment>,
      byResponseAndWave: Map<
        number,
        null |
        Map<
          string[],
          Segment
        >
      >,
      byResponseAndPartyAndWave: Map<
        number,
        null |
        Map<
          string[],
          Segment
        >
      >
    }
  },
  points: Map<number,
    null |
    Map<
      string[],
      Map<
        string[],
        {
          unsplit: Point[]
          collapsed: {
            byResponse: Point[],
            byResponseAndParty: Point[],
            byResponseAndWave: Point[],
            byResponseAndPartyAndWave: Point[]
          },
          expanded: {
            byResponse: Point[],
            byResponseAndParty: Point[],
            byResponseAndWave: Point[],
            byResponseAndPartyAndWave: Point[]
          }
        }
      >
    >
  >
}

export type Segment = {
  topLeftX: number,
  topLeftY: number,
  width: number,
  height: number
}

export type Point = {
  x: number,
  y: number,
  cx: number,
  cy: number
}