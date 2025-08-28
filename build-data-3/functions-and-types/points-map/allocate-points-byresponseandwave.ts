import type {
  PointsMap,
  SegmentMapRW,
  SegmentMapRWP,
  PointsViews,
  Point,
} from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";

export function allocatePointsByResponseAndWaveExpanded(
  segmentMapRW: SegmentMapRW,
  segmentMapRWP: SegmentMapRWP,
  pointsMap: PointsMap
) {
  segmentMapRW.entries().forEach(([rg, rgVal]) => {
    //if the pointsMap doesn't have an entry at rg, add it
    if (!pointsMap.has(rg)) {
      pointsMap.set(
        rg,
        new Map() as Map<number, null | Map<string[], PointsViews>>
      );
    }
    rgVal.entries().forEach(([wave, waveVal]) => {
      //if the pointsMap doesn't have an entry at wave, add it
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
        //get the array of all points that need to be distributed
        //for the current response group and wave
        const allPointsAtRW = waveVal.allPoints;
        //now we want to distribute these points across the partyGroups
        //To do so, we need the partyGroups at rg and wave, as defined
        //in segmentMapRWP.  So we only proceed from here if segmentMapRWP
        //has the required data
        if (segmentMapRWP.has(rg) && segmentMapRWP.get(rg)?.has(wave)) {
          segmentMapRWP
            .get(rg)
            ?.get(wave)
            ?.entries()
            .forEach(([pg, pgVal]) => {
              //if the pointsMap doesn't have an entry for  pg, at the current rg and wave,
              //add it.
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
              //add the points at the current pg
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              pointsMap
                .get(rg)!
                .get(wave)!
                .get(pg)!.expanded.byResponseAndWave = allPointsAtRW.splice(
                0,
                pgVal.count
              );
            });
        }
      }
    });
  });
}
