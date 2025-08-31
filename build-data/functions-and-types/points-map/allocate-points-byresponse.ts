import type { PointsMap, PointsViews, Segment, SegmentMapR, SegmentMapRWP } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";
export function allocatePointsByResponseExpanded(segmentMapR: SegmentMapR, segmentMapRWP: SegmentMapRWP, pointsMap: PointsMap) {
  segmentMapR.forEach((
    rgVal: Segment,
    rg: string[],
    _mapR: Map<string[], Segment>
  ) => {
    const allPointsAtRg = rgVal.allPoints
    if (segmentMapRWP.has(rg)) {
      if (!pointsMap.has(rg)) {
        pointsMap.set(rg, new Map() as Map<number, null | Map<string[], PointsViews>>)
      }
      segmentMapRWP.get(rg)
        ?.forEach((
          waveVal: null | Map<string[], Segment>,
          wave: number,
          _mapW: Map<number, null | Map<string[], Segment>>
        ) => {
          if (!pointsMap.get(rg)?.has(wave)) {
            pointsMap.get(rg)?.set(wave, waveVal === null ? null : new Map() as Map<string[], PointsViews>)
          }
          if (waveVal !== null) {
            waveVal.forEach((
              pgVal: Segment,
              pg: string[],
              _mapP: Map<string[], Segment>
            ) => {
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