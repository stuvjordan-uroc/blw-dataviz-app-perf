import type { Layout, PAndC, PointsMap, Segment } from "../types.ts";
import segmentPoints from "./segment-points.ts";

export default function setPointCoordinatesUnsplit(pointsMap: PointsMap, unsplitSegment: Segment, layout: Layout, pAndC: PAndC) {
  const totalPoints = pAndC.expanded.values().map(rgVal => rgVal.c).reduce((acc, curr) => acc + curr, 0)
  //get the array of coordinates
  const allCoordinates = segmentPoints(unsplitSegment.topLeftX, unsplitSegment.topLeftY, unsplitSegment.width, unsplitSegment.height, totalPoints, layout.pointRadius)
  //now assign the coordinates sequentially on the pointsMap
  pointsMap
    .entries()
    .forEach(([rg, valAtRg]) => {
      valAtRg
        .entries()
        .filter(([wave, valAtWave]) => valAtWave !== null)
        .forEach(([wave, valAtWave]) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          valAtWave!
            .values()
            .forEach((valAtPg) => {
              valAtPg.points.unsplit = allCoordinates.splice(0, valAtPg.count)
            })
        })
    })
}