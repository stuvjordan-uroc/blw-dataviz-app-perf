import type { Layout, ProportionsByGroupedState, ResponseGroup, Data, VizConfig, SegmentCoordinates, PointCoordinates } from "./types-new.ts";
import segmentPoints from "./segment-points.ts";

type PropsAndCountsMap = Map<number, Map<string[], {
  proportions: ProportionsByGroupedState;
  counts: Map<ResponseGroup, number>;
}>>

interface PAndCAtWaveAndPartyGroup {
  proportions: ProportionsByGroupedState;
  counts: Map<ResponseGroup, number>;
}




function unsplitCoordinatesMap(
  waveIdx: number,
  partyGroupIdx: number,
  pAndCMapAtWaveAndPartyGroup: {
    proportions: ProportionsByGroupedState;
    counts: Map<ResponseGroup, number>;
  },
  layout: Layout,
  vizConfig: VizConfig
) {
  /* 
  inputs: 
   + wave
   + waveIdx
   + partyGroup
   + partyGroupIdx
   + numberOfPartyGroups
   + proportions and counts map, evaluated at the inputted wave and partyGroup
   + layout
   + vizConfig
  return a map that takes each expanded responseGroup to segmentCoordinates
  */
  //first compute the total width (including responseGap) of any one
  //wave-partyGroup row of segments
  //remember that since this is the unsplit layout, all horizontal gaps are zero
  const totalWidthWavePartyGroup = layout.vizWidth / vizConfig.partyGroups.length
  //now compute the topLeftX of the requested wave-partyGroup row of segments
  const rowOfSegmentsTopLeftX = totalWidthWavePartyGroup * partyGroupIdx;
  //now compute the topLeftY of the requested wave-partyGroup row of segments
  //remember that since this is the unsplit layout, there are no gaps for labels between waves
  const rowOfSegmentsTopLeftY = layout.labelHeight + layout.waveHeight * waveIdx;
  //now compute the width to be distributed proportionally between the segments
  //each segment will have a basis width of 2*layout.pointRadius.
  //then will add a proportional amount to that from the available width
  //remember this is the unsplit view, so responseGap is 0
  const widthToBeDistributed = totalWidthWavePartyGroup - 2 * layout.pointRadius * vizConfig.responseGroups.expanded.length
  //now we can map!
  return new Map(
    pAndCMapAtWaveAndPartyGroup.proportions.expanded.entries().map(([responseGroup, valAtResponseGroup], responseGroupIdx) => ([
      responseGroup,
      {
        topLeftX: rowOfSegmentsTopLeftX + 2 * layout.pointRadius * responseGroupIdx + valAtResponseGroup.prevCumProportion * widthToBeDistributed,
        topLeftY: rowOfSegmentsTopLeftY,
        width: 2 * layout.pointRadius + valAtResponseGroup.proportion * widthToBeDistributed,
        height: layout.waveHeight,
        points: segmentPoints(
          rowOfSegmentsTopLeftX + 2 * layout.pointRadius * responseGroupIdx + valAtResponseGroup.prevCumProportion * widthToBeDistributed,
          rowOfSegmentsTopLeftY,
          2 * layout.pointRadius + valAtResponseGroup.proportion * widthToBeDistributed,
          layout.waveHeight,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pAndCMapAtWaveAndPartyGroup.counts.get(responseGroup)!,
          layout.pointRadius
        )
      }
    ]))
  )
}


export default function addUnsplitCoordinates(layout: Layout, propsAndCountsMap: PropsAndCountsMap, vizConfig: VizConfig) {
  return new Map(
    propsAndCountsMap.entries().map(([wave, valAtWave], waveIdx) => ([
      wave,
      new Map(
        valAtWave.entries().map(([partyGroup, valAtPartyGroup], partyGroupIdx) => ([
          partyGroup,
          {
            ...valAtPartyGroup,
            unsplit: unsplitCoordinatesMap(waveIdx, partyGroupIdx, valAtPartyGroup, layout, vizConfig)
          }
        ]))
      )
    ]))
  )
}