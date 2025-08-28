import type { PointsMap, PointsViews, SegmentMapR, SegmentMapRWP } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";
export function allocatePointsByResponseExpanded(segmentMapR: SegmentMapR, segmentMapRWP: SegmentMapRWP, pointsMap: PointsMap) {
  segmentMapR.entries().forEach(([rg, rgVal]) => {
    const allPointsAtRg = rgVal.allPoints
    if (segmentMapRWP.has(rg)) {
      if (!pointsMap.has(rg)) {
        pointsMap.set(rg, new Map() as Map<number, null | Map<string[], PointsViews>>)
      }
      segmentMapRWP.get(rg)?.entries().forEach(([wave, waveVal]) => {
        if (!pointsMap.get(rg)?.has(wave)) {
          pointsMap.get(rg)?.set(wave, waveVal === null ? null : new Map() as Map<string[], PointsViews>)
        }
        if (waveVal !== null) {
          waveVal.entries().forEach(([pg, pgVal]) => {
            if (!pointsMap.get(rg)?.get(wave)?.has(pg)) {
              pointsMap.get(rg)?.get(wave)?.set(pg, {
                unsplit: [],
                collapsed: emptyPointsView(),
                expanded: emptyPointsView()
              })
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            pointsMap.get(rg)!.get(wave)!.get(pg)!.expanded.byResponse = allPointsAtRg.splice(0, pgVal.count)
          })
        }
      })
    }
  })
}