import type { Layout, PAndC, PointsMap, Segment } from "../types.ts";
import segmentPoints from "./segment-points.ts";

export default function setPointCoordinatesByResponseExpanded(
  pointsMap: PointsMap,
  segmentMap: Map<string[], Segment>,
  pAndC: PAndC,
  layout: Layout
) {
  segmentMap.entries().forEach(([rg, seg]) => {
    const coordinates = segmentPoints(
      seg.topLeftX,
      seg.topLeftY,
      seg.width,
      seg.height,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      pAndC.expanded.get(rg)!.c,
      layout.pointRadius
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    pointsMap.get(rg)!
      .values()
      .filter((waveVal) => waveVal !== null)
      .forEach((waveVal) => {
        waveVal
          .values()
          .forEach((pgVal) => {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const numToTake = pAndC.expanded.get(rg)!.c
            pgVal.expanded.byResponse = coordinates.splice(0, numToTake)
          })
      })
  })
}