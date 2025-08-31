import type { PointsMap, PointsViews, SegmentMapRWP, Point, Segment } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";

export function allocatePointsByResponseAndWaveAndPartyExpanded(
  segmentMapRWP: SegmentMapRWP,
  pointsMap: PointsMap
) {
  segmentMapRWP.forEach((
    rgVal: Map<number, null | Map<string[], Segment>>,
    rg: string[],
    _mapR: Map<string[], Map<number, null | Map<string[], Segment>>>
  ) => {
    //if there is no entry in the pointsMap at rg, create one
    if (!pointsMap.has(rg)) {
      pointsMap.set(
        rg,
        new Map() as Map<number, Map<string[], PointsViews> | null>
      );
    }
    rgVal.forEach((
      waveVal: null | Map<string[], Segment>,
      wave: number,
      _mapW: Map<number, null | Map<string[], Segment>>
    ) => {
      //if the pointsMap doesn't have an entry at this wave, create one
      if (!pointsMap.get(rg)?.has(wave)) {
        pointsMap
          .get(rg)
          ?.set(
            wave,
            waveVal === null ? null : (new Map() as Map<string[], PointsViews>)
          );
      }
      //if waveVal === null, there is nothing to add to the pointsMap
      //at the current response group and wave.
      //So we only want to run further code here if waveVal !== null
      if (waveVal !== null) {
        waveVal.forEach((
          pgVal: Segment,
          pg: string[],
          _mapP: Map<string[], Segment>
        ) => {
          //if the pointsMap doesn't have an entry at this wave, create one
          if (!pointsMap.get(rg)?.get(wave)?.has(pg)) {
            pointsMap
              .get(rg)
              ?.get(wave)
              ?.set(pg, {
                unsplit: [] as Point[],
                collapsed: emptyPointsView(),
                expanded: emptyPointsView(),
              });
          }
          //allocate the point positions
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pointsMap
            .get(rg)!
            .get(wave)!
            .get(pg)!.expanded.byResponseAndWaveAndParty = pgVal.allPoints;
        });
      }
    });
  });
}
