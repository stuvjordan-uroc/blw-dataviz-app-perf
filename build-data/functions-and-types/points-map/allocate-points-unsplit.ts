import type { Point, PointsMap, PointsViews, SegmentMapRWP, Segment } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";
export default function allocatePointsUnsplit(
  allPoints: Point[],
  segmentMapRWP: SegmentMapRWP,
  pointsMap: PointsMap
) {
  segmentMapRWP.forEach((
    rgVal: Map<number, null | Map<string[], Segment>>,
    rg: string[],
    _mapR: Map<string[], Map<number, null | Map<string[], Segment>>>
  ) => {
    if (!pointsMap.has(rg)) {
      pointsMap.set(rg, new Map() as Map<number, null | Map<string[], PointsViews>>)
    }
    rgVal.forEach((
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
              unsplit: [] as Point[],
              collapsed: emptyPointsView(),
              expanded: emptyPointsView()
            })
          }
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pointsMap.get(rg)!.get(wave)!.get(pg)!.unsplit = allPoints.splice(0, pgVal.count)
        })
      }
    })
  })
}