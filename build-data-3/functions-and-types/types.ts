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
export type GroupedState = 'collapsed' | 'expanded'
export type PAndC = Record<
  GroupedState,
  Map<string[], {
    p: number;
    c: number;
    waveSplit: Map<number, null | {
      p: number;
      c: number;
      partySplit: Map<string[], {
        p: number;
        c: number;
      }>;
    }>;
    partySplit: Map<string[], {
      p: number;
      c: number;
    }>;
  }>
>
export interface Layout {
  screenWidthRange: number[];
  vizWidth: number;
  waveHeight: number;
  pointRadius: number;
  responseGap: number;
  partyGap: number;
  labelHeight: number;
}
export interface Segment {
  topLeftX: number,
  topLeftY: number,
  width: number,
  height: number
}

export interface Point {
  x: number,
  y: number,
  cx: number,
  cy: number
}
export interface PointsViews {
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
export type PointsMap = Map<
  string[], //responseGroup
  Map<
    number, //wave
    null | Map<
      string[], //partyGroup
      PointsViews
    >
  >
>
export interface SegmentGroupedViews {
  byResponse: Map<string[], Segment>,
  byResponseAndParty: Map<
    string[], //responseGroup
    Map<
      string[], //partyGroup
      Segment
    >
  >,
  byResponseAndWave: Map<
    string[], //responseGroup
    Map<
      number, //wave
      null | Segment
    >
  >,
  byResponseAndPartyAndWave: Map<
    string[], //responseGroup
    Map<
      number, //wave
      null | Map<
        string[], //partyGroup
        Segment
      >
    >
  >
}
export interface SegmentViews {
  unsplit: Segment,
  collapsed: SegmentGroupedViews,
  expanded: SegmentGroupedViews
}

export interface ImpViz {
  proportionsAndCounts: PAndC,
  viz: Record<
    string, //screen size
    {
      layout: Layout,
      segments: SegmentViews,
      points: PointsMap
    }
  >
}
export interface Out {
  vizConfig: VizConfig;
  imp: Record<
    string, //one for each impVar
    ImpViz
  >
}
