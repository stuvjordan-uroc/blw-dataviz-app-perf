import type { Layout, PropsAndCountsMap, ResponseGroupToProportionMap, VizConfig } from "./types-new.ts";

function byResponseCoordinates(waveIdx: number, layout: Layout, rgToPMap: ResponseGroupToProportionMap) {
  return new Map(rgToPMap.entries().map(([responseGroup, valAtResponseGroup], responseGroupIdx) => {
    //first compute the topLeftY at the current wave
    const waveTopLeftY = layout.labelHeight + (layout.waveHeight + layout.labelHeight) * waveIdx
    //now compute the topLeftX of the group of segments that all represent responses in the current responseGroup
    const responseGroupTopLeftX = 
    return [
      responseGroup,
      {
        topLeftX: 0,
        topLeftY: waveTopLeftY,
        width: 0,
        height: 0,
        points: [] as {
          x: number,
          y: number,
          cx: number,
          cy: number
        }[]
      }
    ]
  }))
}


export default function byResponseExpandedMap(
  layout: Layout,
  propsAndCountsMap: PropsAndCountsMap,
  vizConfig: VizConfig
) {
  propsAndCountsMap.entries().map(([wave, valAtWave], waveIdx) => {
    //topLeftY for all segments from the current wave
    const currentWaveTopLeftY = layout.labelHeight + (layout.waveHeight + layout.labelHeight) * waveIdx
    //segmentHeight for all segments from the current Wave
    const currentWaveSegmentHeight = layout.waveHeight
    return ([
      wave,
      new Map(
        valAtWave.proportions.entries().map(([partyGroup, valAtPartyGroup], partyGroupIdx) => {
          return ([
            partyGroup,
            byResponseCoordinates(waveIdx, valAtPartyGroup.expanded)
          ])
        })
      )
    ])
  })
}