import { aggregateCountsByResponseExpanded } from "../aggregate/counts/byResponse.ts";
import type { CountsMap, Layout, PointsMap, Segment, VizConfig } from "../types.ts";
import segmentPoints from "./segment-points.ts";

export default function setPointCoordinatesByResponseExpanded(
  pointsMap: PointsMap,
  segmentMap: Map<string[], Segment>,
  layout: Layout,
  countsMap: CountsMap,
  vizConfig: VizConfig
) {
  //construct the aggregated counts
  const aggCounts = aggregateCountsByResponseExpanded(countsMap, vizConfig)
  //make a map that takes each expanded response group
  //to an array of point coordinates
  const rgToCoordinates = new Map(
    segmentMap.entries().map(([rG, segAtRg]) => {
      //get the count
      const count = aggCounts.get(rG);
      if (!count) {
        console.log('WARNING: We tried to assign coordinates for the byResponse expanded view, but could not find the aggregated count for response group', rG)
        return [rG, undefined]
      }
      return [
        rG,
        segmentPoints(
          segAtRg.topLeftX,
          segAtRg.topLeftY,
          segAtRg.width,
          segAtRg.height,
          count,
          layout.pointRadius
        )
      ]
    })
  )
  //assign the coordinates to the points.
  //this is complicated, because the pointMap splits points by wave and partyGroup first.
  //but rgToCoordinates provides an array of points for each responseGroup
  pointsMap.entries().filter(([wave, pointsAtWave]) => pointsAtWave !== null).forEach(([wave, pointsAtWave]) => {
    //ok to assert pointsAtWave not null here because of filter above.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    pointsAtWave!.entries().forEach(([partyGroup, pointsAtPartyGroup]) => {
      pointsAtPartyGroup.entries().forEach(([rG, pointViewsAtRg]) => {
        const remainingCoordinates = rgToCoordinates.get(rG)
        //if rgToCoordinates.get(rG) returns undefined, what do we do?
        if (remainingCoordinates) {
          //compute the size of the slice we need.
          const sliceSize = countsMap.get(wave)?.get(partyGroup)?.get(rG)
          //if countsMap.get(wave)?.get(partyGroup)?.get(rG) returns undefined, what do we do?
          if (sliceSize) {
            if (remainingCoordinates.length < sliceSize) {
              pointViewsAtRg.expanded.byResponse = remainingCoordinates.splice(0, sliceSize)
            } else {
              console.log('WARNING: We failed to assign the byResponse expanded point coordinates.  Did not have enough coordinates to assign at wave', wave, 'party group', partyGroup, 'response group', rG)
            }
          } else {
            console.log('WARNING: We failed to assign the byResponse expanded point coordinates.  Could not retrieve the point count at wave', wave, 'party group', partyGroup, 'response group', rG)
          }
        } else {
          console.log('WARNING: We failed to assign the byResponse expanded point coordinates.  Could not locate or produce coordinates for the view at response group', rG)
        }
      })
    })
  })
}