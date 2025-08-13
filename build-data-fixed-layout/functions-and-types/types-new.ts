export type GroupedState = "collapsed" | "expanded"
export type View = "byResponse" | "byResponseAndParty" | "byResponseAndWave" | "byResponseAndPartyAndWave"

//proportions
//map each of a collection of response groups to a proportion
export type ProportionsByResponseGroup = Map<string[], number>;
//one such map for each grouped state ("collapsed" or "expanded")
export type ProportionsByGroupedState = {
  [key in GroupedState]: Proportions;
}
//get the proportions by wave (number) and partygroup (string[])
export type ProportionsMap = Map<number, Map<string[], ProportionsByGroupedState>>

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



