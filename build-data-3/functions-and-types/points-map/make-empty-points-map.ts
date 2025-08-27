import type { Segment, Point, PointsMap } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";


export default function makeEmptyPointsMap(segmentMapRWP: Map<string[], Map<number, null | Map<string[], Segment>>>): PointsMap {
  return new Map(
    segmentMapRWP.entries().map(([rg, rgVal]) => ([
      rg,
      new Map(
        rgVal.entries().map(([wave, waveVal]) => ([
          wave,
          waveVal === null ? null : new Map(
            waveVal.keys().map((pg) => ([
              pg,
              {
                unsplit: [] as Point[],
                collapsed: emptyPointsView(),
                expanded: emptyPointsView()
              }
            ]))
          )
        ]))
      )
    ]))
  )
}