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

export interface SegmentCoordinates {
  topLeftX: number,
  topLeftY: number,
  width: number,
  height: number
}

interface SegmentViews {
  byResponse: SegmentCoordinates[];
  byResponseAndParty: SegmentCoordinates[][];
  byResponseAndWave: SegmentCoordinates[][];
  byResponseAndPartyAndWave: SegmentCoordinates[][][];
}

export interface SegmentGroups {
  collapsed: SegmentViews,
  expanded: SegmentViews,
}

export interface Layout {
  screenWidthRange: number[];
  vizWidth: number;
  A: number;
  pointRadius: number;
  sampleSize: number;
  segmentGap: number;
  rowGap: number;
  labelHeightTop: number;
  labelHeightBottom: number;
}

interface PointAtView {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

export interface Point {
  unSplit: PointAtView;
  byResponse: PointAtView;
  byResponseAndParty: PointAtView;
  byResponseAndWave: PointAtView;
  byResponseAndPartyAndWave: PointAtView;
}

type VizSize = "small" | "medium" | "large" | "xLarge"

type Viz = {
  proportions: Record<string, ProportionGroups>; //one ProportionGroup for each impvar.
} & Record<  //one layout and array of points for each vizsize.
  VizSize,
  {
    layout: Layout;
    points: Point[];
    segments: SegmentGroups;
  }
>;