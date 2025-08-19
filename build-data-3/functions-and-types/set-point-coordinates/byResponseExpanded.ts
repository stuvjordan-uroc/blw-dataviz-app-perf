import { UnderlineIcon } from "@radix-ui/react-icons";
import type { CountsMap, Layout, PointsMap, Segment } from "../types.ts";
import segmentPoints from "./segment-points.ts";

export default function setPointCoordinatesByResponseExpanded(
  pointsMap: PointsMap,
  segmentMap: Map<string[], Segment>,
  layout: Layout,
  countsMap: CountsMap
) {
  //make a map that takes each expanded response group
  //to an array of point coordinates
  const rgToPointsMap = new Map(
    segmentMap.entries().map(([responseGroup, rGSegment]) => {
      //compute the total points at the current responseGroup
      const totalPointsAtResponseGroup = countsMap
        .values()//iterator over the waves
        .filter(valAtWave => valAtWave !== null) //filter out the un-included waves
        .reduce( //sum the counts over the included waves
          (acc, curr) => acc + curr
            .values() //returns an iterator over the party groups
            .reduce( //sum the counts over the party groups
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              (acc, curr) => acc + (curr.get(responseGroup) ? curr.get(responseGroup)! : 0),
              0
            ),
          0
        )
      return ([
        responseGroup,
        segmentPoints(rGSegment.topLeftX, rGSegment.topLeftY, rGSegment.width, rGSegment.height, totalPointsAtResponseGroup, layout.pointRadius)
      ])
    })
  )
  pointsMap.entries() //code here to assign coordinates
}