import type { Segment, Point, PointsMap } from "../types.ts";
import emptyPointsView from "./empty-points-view.ts";


export default function makeEmptyPointsMap(
  segmentMapRWP: Map<string[], Map<number, null | Map<string[], Segment>>>
): PointsMap {
  return new Map(
    [...segmentMapRWP.entries()].map(([rg, rgVal]: [
      string[],
      Map<number, null | Map<string[], Segment>>
    ]) => ([
      rg,
      new Map(
        [...rgVal.entries()].map(([wave, waveVal]: [
          number,
          null | Map<string[], Segment>
        ]) => ([
          wave,
          waveVal === null ? null : new Map(
            [...waveVal.keys()].map((pg: string[]) => ([
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