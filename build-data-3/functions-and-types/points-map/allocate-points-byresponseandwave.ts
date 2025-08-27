import type { PointsMap, SegmentMapRW, SegmentMapRWP, PointsViews } from "../types.ts";

export function allocatePointsByResponseAndWaveExpanded(
  segmentMapRW: SegmentMapRW,
  segmentMapRWP: SegmentMapRWP,
  pointsMap: PointsMap
) {
  segmentMapRW.entries().forEach(([rg, rgVal]) => {
    rgVal.entries().filter(([wave, waveVal]) => waveVal !== null).forEach(([wave, waveVal]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const allPointsAtRW = waveVal!.allPoints
      //don't do anything further unless segmentMapRWP has the rg and wave
      if (segmentMapRWP.has(rg) && segmentMapRWP.get(rg)?.has(wave)) {
        //if we reach this point, the segmentMapRWP has all the data we need to allocate points
        segmentMapRWP.get(rg)?.get(wave)?.entries()
          .forEach(([pg, pgVal]) => {
            //add the required rg entry to the pointsMap if it doesn't have it
            if (!pointsMap.has(rg)) {
              pointsMap.set(rg, new Map() as Map<number, null | Map<string[], PointsViews>>)
            }
            //add the required wave entry to the pointsMap if it doesn't have it
            if (!pointsMap.get(rg)?.has(wave)) {
              pointsMap.get(rg)?.set(wave, new Map() as Map<string[], PointsViews>)
            }
            //add the required pg entry to the pointsMap if it doesn't already have it
            if (!pointsMap.get(rg)?.get(wave)?.has(pg)) {
              pointsMap.get(rg)?.get(wave)?.set(pg, {} as PointsViews)
            }
            //allocate the points
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            pointsMap.get(rg)!.get(wave)!.get(pg)!.expanded.byResponseAndWaveAndParty = allPointsAtRW.splice(0, pgVal.count)
          })
      }
    })
  })
}