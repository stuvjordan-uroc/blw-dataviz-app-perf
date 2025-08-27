import type { PointsMap, SegmentMapRP, SegmentMapRWP, PointsViews, Point } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";

export function allocatePointsByResponseAndPartyExpanded(
  segmentMapRP: SegmentMapRP,
  segmentMapRWP: SegmentMapRWP,
  pointsMap: PointsMap
) {
  segmentMapRP.entries().forEach(([rg, rgVal]) => {
    rgVal.entries().forEach(([pg, pgVal]) => {
      //get the points-to-be-allocated at rg-pg
      const allPointsAtRP = pgVal.allPoints
      //don't do anything further unless the segmentMapRWP has the rg and has the pg at each non-null wave
      if (
        segmentMapRWP.has(rg) &&
        (
          segmentMapRWP.get(rg)
            ?.values()
            .filter((waveVal) => waveVal !== null)
            .map((waveVal) => waveVal.has(pg))
            .every(hasPg => hasPg)
        )
      ) {
        //if we reach this point, the segmentMapRWP has all the data needed to fill out the PointsMap
        //aggregate across the waves within the segmentMapRWP
        segmentMapRWP.get(rg)?.entries()
          .forEach(([wave, waveValRWP]) => {
            //add the required rg entry to the pointsMap if it doesn't have that entry
            if (!pointsMap.has(rg)) {
              pointsMap.set(rg, new Map() as Map<number, null | Map<string[], PointsViews>>)
            }
            //add the required wave entry to the points map if it doesn't already have that entry
            if (!pointsMap.get(rg)?.has(wave)) {
              pointsMap.get(rg)?.set(wave, waveValRWP === null ? null : new Map() as Map<string[], PointsViews>)
            }
            //do not add any data at the current wave if the current wave is null
            if (waveValRWP) {
              //add the required pg entry to the points map if it doesn't already have that entry
              if (!pointsMap.get(rg)?.get(wave)?.has(pg)) {
                pointsMap.get(rg)?.get(wave)?.set(pg, {
                  unsplit: [] as Point[],
                  collapsed: emptyPointsView(),
                  expanded: emptyPointsView()
                })
              }
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              pointsMap.get(rg)!.get(wave)!.get(pg)!.expanded.byResponseAndParty = allPointsAtRP.splice(0, waveValRWP.get(pg)?.count)
            }
          })
      }
    })
  })
}