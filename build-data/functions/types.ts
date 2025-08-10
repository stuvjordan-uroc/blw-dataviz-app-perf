export interface RawData {
  columns: string[];
  data: (string | number | null)[][]
}
export type ScreenSize = "small" | "medium" | "large" | "xLarge";
export interface ScreenConfig {
  screenWidthRange: number[];
  vizWidth: number;
  A: number;
  pointRadius: number;
  segmentGap: number;
  rowGap: number;
  labelHeightTop: number;
  labelHeightBottom: number;
}
export interface Config {
  sampleSize: number; //number sampled for each party-wave-imp-question
  partyGroups: string[][];
  responsesExpanded: string[][];
  responsesCollapsed: string[][];
  small: ScreenConfig;
  medium: ScreenConfig;
  large: ScreenConfig;
  xLarge: ScreenConfig;
}

interface Coordinate {
  x: number,
  y: number,
  cx: number,
  cy: number
}
interface ExpCollCoordinates {
  expanded?: Coordinate;
  collapsed?: Coordinate;
}

export interface Point {
  response: string;
  pid3: string;
  unsplit: Coordinate;
  byResponse: ExpCollCoordinates,
  byResponseParty: ExpCollCoordinates,
  byResponseWave: ExpCollCoordinates,
  byResponseWaveParty: ExpCollCoordinates
}

export type Sample = Record<string, Record<string, Partial<Point>[]>>