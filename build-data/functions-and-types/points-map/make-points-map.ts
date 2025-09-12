import type { PointsMap, SegmentViews } from "../types.ts";
import { allocatePointsByResponseAndWaveAndPartyExpanded } from "./allocate-point-byresponseandwaveandparty.ts";
import { allocatePointsByResponseExpanded } from "./allocate-points-byresponse.ts";
import { allocatePointsByResponseAndPartyExpanded } from "./allocate-points-byresponseandparty.ts";
import { allocatePointsByResponseAndWaveExpanded } from "./allocate-points-byresponseandwave.ts";
import allocatePointsUnsplit from "./allocate-points-unsplit.ts";
import makeEmptyPointsMap from "./make-empty-points-map.ts";

export default function makePointsMap(segmentViews: SegmentViews): PointsMap {
  const segmentsRWP = segmentViews.expanded.byResponseAndWaveAndParty;
  //make an empty points map that has an entry for each rg-wave-pg in the segmentsRWP
  const pointsMap = makeEmptyPointsMap(segmentsRWP);
  //allocate the unsplit points
  allocatePointsUnsplit(
    segmentViews.unsplit.allPoints, //the array of point positions in the unsplit view
    segmentsRWP, //used to get the number of points at each rg-wave-pg
    pointsMap //the map used to link points to point-positions-in-each-view
  );
  //return the completed map
  //allocate the points for each expanded view
  ////byResponse
  allocatePointsByResponseExpanded(
    segmentViews.expanded.byResponse,
    segmentsRWP,
    pointsMap
  );
  ////byResponseAndParty
  allocatePointsByResponseAndPartyExpanded(
    segmentViews.expanded.byResponseAndParty,
    segmentsRWP,
    pointsMap
  );
  ////byResponseAndWave
  allocatePointsByResponseAndWaveExpanded(
    segmentViews.expanded.byResponseAndWave,
    segmentViews.expanded.byResponseAndWaveAndParty,
    pointsMap
  );
  ////byResponseAndWaveAndParty
  allocatePointsByResponseAndWaveAndPartyExpanded(
    segmentViews.expanded.byResponseAndWaveAndParty,
    pointsMap
  );
  /* TODO */
  //allocate the points for each collapsed view
  return pointsMap;
}
