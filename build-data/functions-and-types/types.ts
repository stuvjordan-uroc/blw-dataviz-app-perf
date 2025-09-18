//data
export interface DataRow {
  weight: number | null;
  pid3: string | null;
  wave: number | null;
  imp: Record<string, string | null>;
  perf: Record<string, string | null>;
}
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

//vizconfig
export interface VizConfig {
  responseGroups: {
    collapsed: string[][];
    expanded: string[][];
  };
  partyGroups: string[][];
  sampleSize: number;
}

//type for unmapped maps (for serializing)
export type UnMap<T, K> = [T, K][]

//proportions and counts
export type GroupedState = "collapsed" | "expanded";
export interface PropCount { p: number, c: number }
export type WaveSplitVal = PropCount & { partySplit: Map<string[], PropCount> }
export type PAndCAtGroupedState = Map<
  string[],
  PropCount & {
    waveSplit: Map<
      number,
      null | PropCount & {
        partySplit: Map<string[], PropCount>
      }
    >,
    partySplit: Map<string[], PropCount>
  }
>
export type PAndC = Record<
  GroupedState,
  PAndCAtGroupedState
>;
export type PAndCUnMapped = Record<
  GroupedState,
  UnMap<
    string[],
    PropCount & {
      partySplit: UnMap<string[], PropCount>,
      waveSplit: UnMap<
        number,
        null | PropCount & {
          partySplit: UnMap<string[], PropCount>
        }
      >
    }
  >
>;

//layout
export interface Layout {
  screenWidthRange: number[];
  vizWidth: number;
  waveHeight: number;
  pointRadius: number;
  responseGap: number;
  partyGap: number;
  labelHeight: number;
}
export interface Layouts {
  small: Layout;
  medium: Layout;
  large: Layout;
  xLarge: Layout;
}

//segments
export interface SegmentCoordinates {
  topLeftX: number;
  topLeftY: number;
  width: number;
  height: number;
}
export interface Point {
  x: number;
  y: number;
  cx: number;
  cy: number;
}
export interface Segment {
  count: number;
  proportion: number;
  segmentCoordinates: SegmentCoordinates;
  allPoints: Point[];
}

export type SegmentMapR = Map<string[], Segment>;
export type SegmentMapRUnMapped = UnMap<string[], Segment>;
export type SegmentMapRW = Map<string[], Map<number, null | Segment>>;
export type SegmentMapRWUnMapped = UnMap<string[], UnMap<number, null | Segment>>;
export type SegmentMapRP = Map<string[], Map<string[], Segment>>;
export type SegmentMapRPUnMapped = UnMap<string[], UnMap<string[], Segment>>;
export type SegmentMapRWP = Map<
  string[], //responseGroup
  Map<
    number, //wave
    null | Map<
      string[], //partyGroup
      Segment
    >
  >
>;
export type SegmentMapRWPUnMapped = UnMap<
  string[], //responseGroup
  UnMap<
    number, //wave
    null | UnMap<
      string[], //partyGroup
      Segment
    >
  >
>;
export interface SegmentGroupedViews {
  byResponse: SegmentMapR;
  byResponseAndParty: SegmentMapRP;
  byResponseAndWave: SegmentMapRW;
  byResponseAndWaveAndParty: SegmentMapRWP;
}
export interface SegmentGroupedViewsUnMapped {
  byResponse: SegmentMapRUnMapped;
  byResponseAndParty: SegmentMapRPUnMapped;
  byResponseAndWave: SegmentMapRWUnMapped;
  byResponseAndWaveAndParty: SegmentMapRWPUnMapped;
}
export interface SegmentViews {
  unsplit: Segment;
  collapsed: SegmentGroupedViews;
  expanded: SegmentGroupedViews;
}
export interface SegmentViewsUnMapped {
  unsplit: Segment;
  collapsed: SegmentGroupedViewsUnMapped;
  expanded: SegmentGroupedViewsUnMapped;
}

//points
export interface PointsViews {
  unsplit: Point[];
  collapsed: {
    byResponse: Point[];
    byResponseAndParty: Point[];
    byResponseAndWave: Point[];
    byResponseAndWaveAndParty: Point[];
  };
  expanded: {
    byResponse: Point[];
    byResponseAndParty: Point[];
    byResponseAndWave: Point[];
    byResponseAndWaveAndParty: Point[];
  };
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
>;
export type PointsMapUnMapped = UnMap<
  string[], //responseGroup
  UnMap<
    number, //wave
    null | UnMap<
      string[], //partyGroup
      PointsViews
    >
  >
>;


export type Viz = Record<
  keyof Layouts,
  Record<
    string,
    {
      segments: SegmentViewsUnMapped,
      points: PointsMapUnMapped
    }
  >
>