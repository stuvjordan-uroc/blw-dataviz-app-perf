import type { CountsMap, Layout, PointsMap, Segment } from "../types.ts";
import segmentPoints from "./segment-points.ts";

export default function setPointCoordinatesUnsplit(pointsMap: PointsMap, unsplitSegment: Segment, layout: Layout, countsMap: CountsMap) {
  const totalPoints = countsMap
    .values() //iterator over the waves
    .filter(valAtWave => valAtWave !== null) //filter out the un-included waves
    .reduce(  //sum the counts over the included waves
      (acc, curr) => acc + curr
        .values() //returns an iterator over the party groups
        .reduce( //sum the counts over the party groups
          (acc, curr) => acc + curr
            .values() //returns an iterator over the expanded response groups
            .reduce( //sum the counts at the expanded response groups
              (acc, curr) => acc + curr,
              0
            ),
          0
        ),
      0
    )
  //get the array of coordinates
  const allCoordinates = segmentPoints(unsplitSegment.topLeftX, unsplitSegment.topLeftY, unsplitSegment.width, unsplitSegment.height, totalPoints, layout.pointRadius)
  //now assign the coordinates sequentially on the pointsMap
  pointsMap
    .entries()
    .filter(([wave, valAtWave]) => valAtWave !== null)
    .forEach(([wave, valAtWave]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      valAtWave! //ok to use non-null assertion because I filtered out null waves above!
        .entries()
        .forEach(([partyGroup, valAtPartyGroup]) => {
          valAtPartyGroup
            .entries()
            .forEach(([responseGroup, valAtResponseGroup]) => {
              //get the next slice of points in line
              const countsAtWave = countsMap.get(wave)
              if (countsAtWave) {
                const countsAtPartyGroup = countsAtWave.get(partyGroup)
                if (countsAtPartyGroup) {
                  const countsAtResponseGroup = countsAtPartyGroup.get(responseGroup)
                  if (countsAtResponseGroup !== undefined) {
                    //get the next slice of points
                    const nextSlice = allCoordinates.splice(0, countsAtResponseGroup)
                    valAtResponseGroup.unsplit = nextSlice
                  } else {
                    console.log('WARNING: You tried to set unsplit point coordinates at wave', wave, 'party group', partyGroup, 'response group', responseGroup, 'But you passed a CountsMap that has no entry at that response group.')
                  }
                } else {
                  console.log('WARNING: You tried to set unsplit point coordinates at party group', partyGroup, 'But you passed a CountsMap that has no entry at that party group.')
                }
              } else {
                console.log('WARNING: You tried to set unsplit point coordinates at wave', wave, 'But you passed a CountsMap that has no entry at that wave.')
              }

            })
        })
    })
}