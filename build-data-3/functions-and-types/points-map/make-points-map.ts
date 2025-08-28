import type { SegmentViews } from "../types.ts";
import { allocatePointsByResponseExpanded } from "./allocate-points-byresponse.ts";
import { allocatePointsByResponseAndPartyExpanded } from "./allocate-points-byresponseandparty.ts";
import { allocatePointsByResponseAndWaveExpanded } from "./allocate-points-byresponseandwave.ts";
import allocatePointsUnsplit from "./allocate-points-unsplit.ts";
import makeEmptyPointsMap from "./make-empty-points-map.ts";

export default function makePointsMap(segmentViews: SegmentViews) {
  const segmentsRWP = segmentViews.expanded.byResponseAndWaveAndParty
  //make an empty points map
  const pointsMap = makeEmptyPointsMap(segmentsRWP)
  //allocate the unsplit points
  allocatePointsUnsplit(segmentViews.unsplit.allPoints, segmentsRWP, pointsMap)
  //return the completed map
  //allocate the points for each expanded view
  ////byResponse
  allocatePointsByResponseExpanded(segmentViews.expanded.byResponse, segmentsRWP, pointsMap)
  ////byResponseAndParty
  allocatePointsByResponseAndPartyExpanded(segmentViews.expanded.byResponseAndParty, segmentsRWP, pointsMap)
  ////byResponseAndWave
  allocatePointsByResponseAndWaveExpanded(segmentViews.expanded.byResponseAndWave, segmentViews.expanded.byResponseAndWaveAndParty, pointsMap)
  /* TODO */
  ////byResponseAndWaveAndParty
  /* TODO */
  //allocate the points for each collapsed view
  /* TODO */
  return pointsMap
}