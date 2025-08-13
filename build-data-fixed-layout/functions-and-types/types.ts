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

//each property in one of these points to arrays of propotions matched to the various views
interface ProportionViews {
  byResponse: number[];
  byResponseAndParty: number[][];
  byResponseAndWave: number[][];
  byResponseAndPartyAndWave: number[][][];
}

//proportions needed for each view in the collapsed/expanded views
export interface ProportionGroups {
  collapsed: ProportionViews;
  expanded: ProportionViews;
}

//coordinates for a rectangular segment of points
export interface SegmentCoordinates {
  topLeftX: number;
  topLeftY: number;
  width: number;
  height: number;
}

//coordinates for rows/columns of segments for the various views
interface SegmentViews {
  byResponse: SegmentCoordinates[];
  byResponseAndParty: SegmentCoordinates[][];
  byResponseAndWave: SegmentCoordinates[][];
  byResponseAndPartyAndWave: SegmentCoordinates[][][];
}

//object to split rows/columns of segments according to whether the view is collapsed or expanded
export interface SegmentGroups {
  collapsed: SegmentViews;
  expanded: SegmentViews;
}




//coordinates for a single circle (representing a sampled response) in any view
export interface PointCoordinates {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

interface PointViews {
  byResponse: PointCoordinates;
  byResponseAndParty: PointCoordinates;
  byResponseAndWave: PointCoordinates;
  byResponseAndPartyAndWave: PointCoordinates;
}

//split the PointViews into collapsed and expanded views.
export interface PointGroups {
  collapsed: PointViews;
  expanded: PointViews;
  unsplit: PointCoordinates;
}

//one sampled response from the data
export interface SampledResponse {
  pid3: string;
  response: string;
  wave: number;
}

export type Point = SampledResponse & PointGroups;

//A viz layout for a given range of screensizes
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

//types of screen size ranges
type VizSize = "small" | "medium" | "large" | "xLarge";

//data to generate file that describes
//all data needed for a viz that does
//include info about positions of anything on the screen
export interface VizData {
  waves: number[];
  partyGroups: string[][];
  responseGroups: {
    expanded: string[][];
    collapsed: string[][];
  };
  principles: Record<
    string,
    { proportions: ProportionGroups; sampledResponses: SampledResponse[] }
  >;
  //for each democratic principle, we have a ProprotionGroups and an array of sampled responses.
}

//data to generate file that gives layout and coordinates for vizible elements
//for each screensize
type Coordinates = Record<
  VizSize,
  {
    layout: Layout; //at any given vizSize, the layout is the same for each principle
    principles: Record<string, { points: Point[]; segments: SegmentGroups }>; //for each principle, coordinates for points and segments for that principle at each view
  }
>;
