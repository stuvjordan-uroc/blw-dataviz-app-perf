import type { PointsMap, SegmentMapRP, SegmentMapRWP, PointsViews, Point, Segment } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";

export function allocatePointsByResponseAndPartyExpanded(
  segmentMapRP: SegmentMapRP,
  segmentMapRWP: SegmentMapRWP,
  pointsMap: PointsMap
) {
  segmentMapRP.forEach((
    rgVal: Map<string[], Segment>,
    rg: string[],
    _mapR: Map<string[], Map<string[], Segment>>
  ) => {
    rgVal.forEach((
      pgVal: Segment,
      pg: string[],
      _mapP: Map<string[], Segment>
    ) => {
      //get the points-to-be-allocated at rg-pg
      const allPointsAtRP = pgVal.allPoints
      //don't do anything further unless the segmentMapRWP has the rg and at that rg has the pg at each non-null wave
      if (
        segmentMapRWP.has(rg) &&
        (
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          [...segmentMapRWP.get(rg)!.values()]
            .filter((waveVal: null | Map<string[], Segment>) => waveVal !== null)
            .map((waveVal: Map<string[], Segment>) => waveVal.has(pg))
            .every((hasPg: boolean) => hasPg)
        )
      ) {
        //if we reach this point, the segmentMapRWP has all the data needed to fill out the PointsMap
        //aggregate across the waves within the segmentMapRWP
        segmentMapRWP.get(rg)
          ?.forEach((
            waveValRWP: null | Map<string[], Segment>,
            wave: number,
            _mapW: Map<number, null | Map<string[], Segment>>
          ) => {
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