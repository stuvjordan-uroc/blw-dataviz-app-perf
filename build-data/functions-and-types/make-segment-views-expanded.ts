import segmentPoints from "./segment-points.ts";
import type { Layout, PAndC, SegmentCoordinates, SegmentGroupedViews, PropCount } from "./types.ts";

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
  const count = [...pAndC.expanded.values()].map((
    rgVal: PropCount & {
      waveSplit: Map<
        number,
        null | PropCount & {
          partySplit: Map<string[], PropCount>
        }
      >,
      partySplit: Map<string[], PropCount>
    }
  ) => rgVal.c).reduce((acc: number, curr: number) => acc + curr, 0)
  const topLeftY = (
    layout.labelHeight + numWaves * (layout.waveHeight + layout.labelHeight) // height of canvas
    - layout.waveHeight * numWaves //height of segment
  ) / 2 //divide by 2 so half of free space is on the top and half is on the bottom
  const segmentCoordinates = {
    topLeftX: 0,
    topLeftY: topLeftY,
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
    [...pAndC.expanded.entries()].map(([rg, rgVal]: [
      string[],
      PropCount & {
        waveSplit: Map<
          number,
          null | PropCount & {
            partySplit: Map<string[], PropCount>
          }
        >,
        partySplit: Map<string[], PropCount>
      }
    ], rgIdx: number) => {
      const count = rgVal.c
      const widthToDistribute = layout.vizWidth //start with the total vizWidth
        - 2 * layout.pointRadius * pAndC.expanded.size //subtract the minimum width each segment
        - layout.responseGap * (pAndC.expanded.size - 1) //subtract the responseGaps
      const topLeftX = rgIdx === 0 ? 0 : [...pAndC.expanded.values()]
        .slice(0, rgIdx)  //previous response values
        .map((prevRgVal: PropCount & {
          waveSplit: Map<
            number,
            null | PropCount & {
              partySplit: Map<string[], PropCount>
            }
          >,
          partySplit: Map<string[], PropCount>
        }) =>
          2 * layout.pointRadius + prevRgVal.p * widthToDistribute + layout.responseGap
        ) //width of each segment for each of the previous response values
        .reduce((acc: number, curr: number) => acc + curr, 0) //sum those widths
      const topLeftY = (
        layout.labelHeight + numWaves * (layout.waveHeight + layout.labelHeight) // height of canvas
        - layout.waveHeight * numWaves //height of segment
      ) / 2 //divide by 2 so half of free space is on the top and half is on the bottom
      const segmentCoordinates = {
        topLeftY: topLeftY,
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
    [...pAndC.expanded.entries()].map(([rg, rgVal]: [
      string[],
      PropCount & {
        waveSplit: Map<
          number,
          null | PropCount & {
            partySplit: Map<string[], PropCount>
          }
        >,
        partySplit: Map<string[], PropCount>
      }
    ], rgIdx: number) => {
      return ([
        rg,
        new Map(
          [...rgVal.partySplit.entries()].map(([pg, pgVal]: [
            string[],
            PropCount
          ], pgIdx: number) => {
            const count = pgVal.c;
            const topLeftY = (
              layout.labelHeight + numWaves * (layout.waveHeight + layout.labelHeight) // height of canvas
              - layout.waveHeight * numWaves //height of segment
            ) / 2 //divide by 2 so half of free space is on the top and half is on the bottom
            const partyGroupTopLeftX = (partyGroupTotalWidth + layout.partyGap) * pgIdx
            const responseGroupTopLeftX = partyGroupTopLeftX + (
              rgIdx === 0 ? 0 :
                [...pAndC.expanded.values()]
                  .slice(0, rgIdx)
                  .map((prevRgVal: PropCount & {
                    waveSplit: Map<
                      number,
                      null | PropCount & {
                        partySplit: Map<string[], PropCount>
                      }
                    >,
                    partySplit: Map<string[], PropCount>
                  }) =>
                    2 * layout.pointRadius + prevRgVal.p * partyGroupWidthToDistribute + layout.responseGap
                  )
                  .reduce((acc: number, curr: number) => acc + curr, 0)
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
                segmentCoordinates: coordinates,
                allPoints: allPoints(coordinates, pgVal.c, layout.pointRadius)
              }
            ])
          })
        )
      ])
    })
  )
}

export function byResponseAndWave(pAndC: PAndC, layout: Layout) {
  return new Map(
    [...pAndC.expanded.entries()].map(([rg, rgVal]: [
      string[],
      PropCount & {
        waveSplit: Map<
          number,
          null | PropCount & {
            partySplit: Map<string[], PropCount>
          }
        >,
        partySplit: Map<string[], PropCount>
      }
    ], rgIdx: number) => {
      const waveWidthToDistribute = layout.vizWidth //total vizWidth
        - 2 * layout.pointRadius * pAndC.expanded.size //subtract the minimum width for each segment
        - layout.responseGap * (pAndC.expanded.size - 1) //subtract the responseGap
      return ([
        rg,
        new Map(
          [...rgVal.waveSplit.entries()].map(([wave, waveVal]: [
            number,
            null | PropCount & { partySplit: Map<string[], PropCount> }
          ], waveIdx: number) => {
            if (waveVal === null) {
              return ([wave, null])
            }
            const waveTopLeftY = layout.labelHeight //label prior to top row of segments
              + (layout.waveHeight + layout.labelHeight) * waveIdx //heights of previous rows
            const responseGroupTopLeftX = rgIdx === 0 ? 0 :
              [...pAndC.expanded.values()]
                .slice(0, rgIdx) //iterate through the previous responseGroups
                .map(prevRgVal =>  //get the width for each previous responseGap at the current wave 
                  2 * layout.pointRadius //minimum width
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  + prevRgVal.waveSplit.get(wave)!.p * waveWidthToDistribute //width for previous response group at current wave
                  + layout.responseGap //responseGap
                )
                .reduce((acc: number, curr: number) => acc + curr, 0) //sum the widths of the previous segments
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
                segmentCoordinates: coordinates,
                allPoints: allPoints(coordinates, waveVal.c, layout.pointRadius)
              }
            ])
          })
        )
      ])
    })
  )
}

export function byResponseAndPartyAndWave(pAndC: PAndC, layout: Layout, numPartyGroups: number) {
  const partyGroupTotalWidth = (layout.vizWidth - layout.partyGap * (numPartyGroups - 1)) / numPartyGroups
  const partyGroupWidthToBeDistributed = partyGroupTotalWidth
    - 2 * layout.pointRadius * pAndC.expanded.size
    - layout.responseGap * (pAndC.expanded.size - 1)
  return new Map(
    [...pAndC.expanded.entries()].map(([rg, rgVal]: [
      string[],
      PropCount & {
        waveSplit: Map<
          number,
          null | PropCount & {
            partySplit: Map<string[], PropCount>
          }
        >,
        partySplit: Map<string[], PropCount>
      }
    ], rgIdx: number) => {
      return ([
        rg,
        new Map(
          [...rgVal.waveSplit.entries()].map(([wave, waveVal]: [
            number,
            null | PropCount & {
              partySplit: Map<string[], PropCount>
            }
          ], waveIdx: number) => {
            if (waveVal === null) {
              return ([
                wave,
                null
              ])
            }
            const waveTopLeftY = layout.labelHeight + (layout.waveHeight + layout.labelHeight) * waveIdx
            return ([
              wave,
              new Map(
                [...waveVal.partySplit.entries()].map(([pg, pgVal]: [
                  string[],
                  PropCount
                ], pgIdx: number) => {
                  const partyGroupTopLeftX = (partyGroupTotalWidth + layout.partyGap) * pgIdx
                  let responseGroupTopLeftX = partyGroupTopLeftX
                  if (rgIdx > 0) {
                    let prevRgIdx = 0;
                    for (const prevRgVal of pAndC.expanded.values()) {
                      if (prevRgIdx >= rgIdx) {
                        break;
                      }
                      responseGroupTopLeftX += 2 * layout.pointRadius
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        + prevRgVal.waveSplit.get(wave)!.partySplit.get(pg)!.p * partyGroupWidthToBeDistributed
                        + layout.responseGap
                      prevRgIdx++
                    }
                  }
                  const responseGroupSegmentWidth = 2 * layout.pointRadius + pgVal.p * partyGroupWidthToBeDistributed
                  return ([
                    pg,
                    {
                      count: pgVal.c,
                      segmentCoordinates: {
                        topLeftY: waveTopLeftY,
                        topLeftX: responseGroupTopLeftX,
                        width: responseGroupSegmentWidth,
                        height: layout.waveHeight
                      },
                      allPoints: allPoints(
                        {
                          topLeftY: waveTopLeftY,
                          topLeftX: responseGroupTopLeftX,
                          width: responseGroupSegmentWidth,
                          height: layout.waveHeight
                        },
                        pgVal.c,
                        layout.pointRadius
                      )
                    }
                  ])
                })
              )
            ])
          })
        )
      ])
    })
  )
}

export function makeSegmentViewsExpanded(pAndC: PAndC, layout: Layout, numWaves: number, numPartyGroups: number) {
  //byResponse
  const byresponse = byResponse(pAndC, layout, numWaves)
  //byResponseAndParty
  const byresponseandparty = byResponseAndParty(pAndC, layout, numWaves, numPartyGroups)
  //byResponseAndWave
  const byresponseandwave = byResponseAndWave(pAndC, layout)
  //byResponseAndWaveAndParty
  const byresponseandpartyandwave = byResponseAndPartyAndWave(pAndC, layout, numPartyGroups)
  return ({
    byResponse: byresponse,
    byResponseAndWave: byresponseandwave,
    byResponseAndParty: byresponseandparty,
    byResponseAndWaveAndParty: byresponseandpartyandwave
  } as SegmentGroupedViews)


}