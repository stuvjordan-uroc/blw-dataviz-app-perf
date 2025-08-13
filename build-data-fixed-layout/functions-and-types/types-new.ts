//  This is a row in the raw data

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

export type GroupedState = "collapsed" | "expanded"
export type View = "byResponse" | "byResponseAndParty" | "byResponseAndWave" | "byResponseAndPartyAndWave"
export type ResponseGroup = string[]
export type ArrayOfResponseGroups = string[][]

export interface VizConfig {
  responseGroups: Record<GroupedState, ArrayOfResponseGroups>;
  partyGroups: string[][];
  sampleSize: number;
}



//proportions
//map each response group in an array of responseGroups to a proportions, one proportion
//for each responseGroup 
export type ResponseGroupToProportionMap = Map<ResponseGroup, number>;
//one such map for each grouped state ("collapsed" or "expanded")
export type ProportionsByGroupedState = Record<GroupedState, ResponseGroupToProportionMap>
//get the proportions by wave (number) and partygroup (string[])
export type ProportionsMap = Map<number, Map<string[], ProportionsByGroupedState>>

//map each ...wave...  ...partyGroup...  ...(expanded)responseGroup... to a number of points.
export type NumPointsMap = Map<number, Map<string[], Map<string[], number>>>

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


//point
export interface PointCoordinates {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

//segment
//location of a segment, plus the locations of the points distributed within it
export interface SegmentCoordinates {
  topLeftX: number;
  topLeftY: number;
  width: number;
  height: number;
  points: PointCoordinates[];
}
//A segment's coordinates (and the coordinates of the points within it)
//depend on the groupedState and the view.
//except in the unsplit view.
export type Segment = Record<
  GroupedState,
  Record<View, SegmentCoordinates>
> & { unsplit: SegmentCoordinates }
//at each wave (number) and partyGroup (string[]) there is one segment
export type SegmentMap = Map<number, Map<string[], Segment>>



