import segmentPoints from "./set-point-coordinates/segment-points.ts";
import type { Layout, PAndC, Segment, SegmentCoordinates } from "./types.ts";

function allPoints(segmentCoordinates: SegmentCoordinates, count: number, pointRadius: number) {
  return segmentPoints(
    segmentCoordinates.topLeftX,
    segmentCoordinates.topLeftY,
    segmentCoordinates.width,
    segmentCoordinates.height,
    count,
    pointRadius
  )
}
export function unSplit(pAndC: PAndC, layout: Layout, numWaves: number) {
  const count = pAndC.expanded.values().map(rgVal => rgVal.c).reduce((acc, curr) => acc + curr, 0)
  const segmentCoordinates = {
    topLeftX: 0,
    topLeftY: layout.labelHeight,
    width: layout.vizWidth,
    height: layout.waveHeight * numWaves
  }
  const points = allPoints(segmentCoordinates, count, layout.pointRadius)
  return ({
    count: count,
    segmentCoordinates: segmentCoordinates,
    allPoints: points
  })
}
export function byResponse(pAndC: PAndC, layout: Layout, numWaves: number) {
  return new Map(
    pAndC.expanded.entries().map(([rg, rgVal], rgIdx) => {
      const count = rgVal.c
      const widthToDistribute = layout.vizWidth //start with the total vizWidth
        - 2 * layout.pointRadius * pAndC.expanded.size //subtract the minimum width each segment
        - layout.responseGap * (pAndC.expanded.size - 1) //subtract the responseGaps
      const topLeftX = rgIdx === 0 ? 0 : pAndC.expanded
        .values()
        .take(rgIdx)  //previous response values
        .map((prevRgVal) =>
          2 * layout.pointRadius + prevRgVal.p * widthToDistribute + layout.responseGap
        ) //width of each segment for each of the previous response values
        .reduce((acc, curr) => acc + curr, 0) //sum those widths
      const segmentCoordinates = {
        topLeftY: layout.labelHeight,
        topLeftX: topLeftX,
        width: 2 * layout.pointRadius + rgVal.p * widthToDistribute,
        height: layout.waveHeight * numWaves
      }
      return ([
        rg,
        {
          count: count,
          segmentCoordinates: segmentCoordinates,
          allPoints: allPoints(segmentCoordinates, rgVal.c, layout.pointRadius)
        }
      ])
    }
    )
  )
}
export function byResponseAndParty(pAndC: PAndC, layout: Layout, numWaves: number, numPartyGroups: number) {
  const partyGroupTotalWidth = (layout.vizWidth - layout.partyGap * (numPartyGroups - 1)) / numPartyGroups
  const partyGroupWidthToDistribute = partyGroupTotalWidth
    - 2 * layout.pointRadius * pAndC.expanded.size
    - layout.responseGap * (pAndC.expanded.size - 1)
  const segmentHeight = layout.waveHeight * numWaves
  return new Map(
    pAndC.expanded.entries().map(([rg, rgVal], rgIdx) => {
      return ([
        rg,
        new Map(
          rgVal.partySplit.entries().map(([pg, pgVal], pgIdx) => {
            const count = pgVal.c;
            const topLeftY = layout.labelHeight;
            const partyGroupTopLeftX = (partyGroupTotalWidth + layout.partyGap) * pgIdx
            const responseGroupTopLeftX = partyGroupTopLeftX + (
              rgIdx === 0 ? 0 :
                pAndC.expanded
                  .values()
                  .take(rgIdx)
                  .map((prevRgVal) =>
                    2 * layout.pointRadius + prevRgVal.p * partyGroupWidthToDistribute + layout.responseGap
                  )
                  .reduce((acc, curr) => acc + curr, 0)
            )
            const coordinates = {
              topLeftY: topLeftY,
              topLeftX: responseGroupTopLeftX,
              width: 2 * layout.pointRadius + pgVal.p * partyGroupWidthToDistribute,
              height: segmentHeight
            }
            return ([
              pg,
              {
                count: count,
                coordinates: coordinates,
                allPoints: allPoints(coordinates, pgVal.c, layout.pointRadius)
              }
            ])
          })
        )
      ])
    })
  )
}

export function byResponseAndWave(pAndC: PAndC, layout: Layout, numWaves: number) {
  return new Map(
    pAndC.expanded.entries().map(([rg, rgVal], rgIdx) => {
      const waveWidthToDistribute = layout.vizWidth //total vizWidth
        - 2 * layout.pointRadius * pAndC.expanded.size //subtract the minimum width for each segment
        - layout.responseGap * (pAndC.expanded.size - 1) //subtract the responseGap
      return ([
        rg,
        new Map(
          rgVal.waveSplit.entries().map(([wave, waveVal], waveIdx) => {
            if (waveVal === null) {
              return ([wave, null])
            }
            const waveTopLeftY = layout.labelHeight //label prior to top row of segments
              + (layout.waveHeight + layout.labelHeight) * waveIdx //heights of previous rows
            const responseGroupTopLeftX = rgIdx === 0 ? 0 :
              pAndC.expanded.values().take(rgIdx) //iterate through the previous responseGroups
                .map(prevRgVal =>  //get the width for each previous responseGap at the current wave 
                  2 * layout.pointRadius //minimum width
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  + prevRgVal.waveSplit.get(wave)!.p * waveWidthToDistribute //width for previous response group at current wave
                  + layout.responseGap //responseGap
                )
                .reduce((acc, curr) => acc + curr, 0) //sum the widths of the previous segments
            const coordinates = {
              topLeftY: waveTopLeftY,
              topLeftX: responseGroupTopLeftX,
              width: 2 * layout.pointRadius + waveVal.p * waveWidthToDistribute,
              height: layout.waveHeight
            }
            return ([
              wave,
              {
                count: waveVal.c,
                coordinates: coordinates,
                allPoints: allPoints(coordinates, waveVal.c, layout.pointRadius)
              }
            ])
          })
        )
      ])
    })
  )
}

export function makeSegmentViewsExpanded(pAndC: PAndC, layout: Layout, numWaves: number, numPartyGroups: number) {
  //unsplit
  const unsplit = unSplit(pAndC, layout, numWaves)
  //byResponse
  const byresponse = byResponse(pAndC, layout, numWaves)
  //byResponseAndParty
  const byresponseandparty = byResponseAndParty(pAndC, layout, numWaves, numPartyGroups)
  //byResponseAndWave
  const byresponseandwave = byResponseAndWave(pAndC, layout, numWaves)



}