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



export interface PointCoordinates {
  x: number;
  y: number;
  cx: number;
  cy: number;
}

interface PointViews {
  byResponse: PointCoordinates[];
  byResponseAndParty: PointCoordinates[];
  byResponseAndWave: PointCoordinates[];
  byResponseAndPartyAndWave: PointCoordinates[];
}

interface PointGroups {
  collapsed: PointViews;
  expanded: PointViews;
}

interface SampledResponse {
  pid3: string;
  response: string;
  wave: number;
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

type VizSize = "small" | "medium" | "large" | "xLarge"

//data to generate file that describes how data is split into groups
interface Groups {
  partyGroups: string[][];
  responseGroups: {
    expanded: string[][];
    collapsed: string[][];
  }
}

//data to generate file that maps each impvar to computed proportions and synthetic sample.
//proportions and samples have no information about rendering coordinates.  So they are 
//unaffected by vizSize or layout configurations
type ProportionsAndSamples = Record<
  string,
  { proportions: ProportionGroups, sampledResponses: SampledResponse[] }
> //one object with proportions and sampled responses for each impVar


//data to generate file that gives layout and coordinates for any given vizSize
type Coordinates = Record<
  VizSize,
  {
    layout: Layout, //at any given vizSize, the layout is the same for each principle
    principles: Record<string, { points: PointGroups, segments: SegmentGroups }> //for each principle, coordinates for points and segments for that principle at each view
  }
>
