import type { Layout, ProportionGroups, SegmentCoordinates, SegmentGroups } from "./types.ts";

export default function makeSegments(layout: Layout, proportionGroups: ProportionGroups) {
  const outSegments = {
    collapsed: {
      byResponse: [] as SegmentCoordinates[],
      byResponseAndParty: [] as SegmentCoordinates[][],
      byResponseAndWave: [] as SegmentCoordinates[][],
      byResponseAndPartyAndWave: [] as SegmentCoordinates[][][]
    },
    expanded: {
      byResponse: [] as SegmentCoordinates[],
      byResponseAndParty: [] as SegmentCoordinates[][],
      byResponseAndWave: [] as SegmentCoordinates[][],
      byResponseAndPartyAndWave: [] as SegmentCoordinates[][][]
    }
  } as SegmentGroups
  for (const viewType of Object.keys(proportionGroups) as (keyof ProportionGroups)[]) {
    const proportionGroup = proportionGroups[viewType];
    //byResponse
    const availableWidthByResponse =
      layout.vizWidth //start with the total width
      - layout.segmentGap * (proportionGroup.byResponse.length - 1) //subtract the gaps between segments
      - (2 * layout.pointRadius) * proportionGroup.byResponse.length; //subtract the minimum width that will be allocated to each segment
    const segmentWidthsByResponse = proportionGroup.byResponse.map(p => 2 * layout.pointRadius + p * availableWidthByResponse)  //minimum with plus share of remaining available
    outSegments[viewType].byResponse =
      segmentWidthsByResponse.map((w, wIdx) => ({
        topLeftX: segmentWidthsByResponse.slice(0, wIdx).reduce((acc, curr) => acc + curr, 0) + layout.segmentGap * wIdx,
        topLeftY: layout.labelHeightTop,
        width: w,
        height: layout.vizWidth / layout.A
      }))
    //byResponseAndParty
    const numberOfPartyGroups = proportionGroup.byResponseAndParty.length;
    if (numberOfPartyGroups > 0) {
      const partyRowOuterWidth = (layout.vizWidth - layout.rowGap * (numberOfPartyGroups - 1)) / numberOfPartyGroups //each row of segments will be this wide, including segmentGaps
      outSegments[viewType].byResponseAndParty =
        proportionGroup.byResponseAndParty.map((partyGroup, partyGroupIdx) => {
          const groupTopLeftX = partyGroupIdx * partyRowOuterWidth + layout.rowGap * partyGroupIdx;
          const partyRowAvailableInnerWidth = partyRowOuterWidth
            - layout.segmentGap * (partyGroup.length - 1)  //subtract segment gaps
            - (2 * layout.pointRadius) * partyGroup.length;      //subtract minimum width allocated to each segment
          const groupSegmentWidths = partyGroup.map(p => 2 * layout.pointRadius + p * partyRowAvailableInnerWidth)  //minimum with plus share of available
          return groupSegmentWidths.map((w, wIdx) => ({
            topLeftX: groupTopLeftX + groupSegmentWidths.slice(0, wIdx).reduce((acc, curr) => acc + curr, 0) + layout.segmentGap * wIdx,
            topLeftY: layout.labelHeightTop,
            width: w,
            height: layout.vizWidth / layout.A
          }))
        })
    }
    //byResponseAndWave
    outSegments[viewType].byResponseAndWave =
      proportionGroup.byResponseAndWave.map((waveGroup, waveGroupIdx) => {
        if (waveGroup.length === 0) {
          return []
        }
        const waveGroupTopLeftY = (layout.labelHeightTop + layout.vizWidth / layout.A + layout.labelHeightBottom) * waveGroupIdx
        const waveGroupAvailableWidth = layout.vizWidth //start with the total vizWidth
          - layout.segmentGap * (waveGroup.length - 1) //subtract the segmentgaps
          - (2 * layout.pointRadius) * waveGroup.length //subtract the minimums widths
        const waveGroupSegmentWidths = waveGroup.map(p => 2 * layout.pointRadius + p * waveGroupAvailableWidth)
        return waveGroupSegmentWidths.map((w, wIdx) => ({
          topLeftX: 0 + waveGroupSegmentWidths.slice(0, wIdx).reduce((acc, curr) => acc + curr, 0) + layout.segmentGap * wIdx,
          topLeftY: waveGroupTopLeftY,
          width: w,
          height: layout.vizWidth
        }))
      })
    //byReponseAndPartyAndWave
    outSegments[viewType].byResponseAndPartyAndWave =
      proportionGroup.byResponseAndPartyAndWave.map((waveGroup, waveGroupIdx) => {
        const numberOfPartyGroups = waveGroup.length
        if (numberOfPartyGroups === 0) {
          return []
        }
        const waveGroupTopLeftY = (layout.labelHeightTop + layout.vizWidth / layout.A + layout.labelHeightBottom) * waveGroupIdx
        const partyRowOuterWidth = (layout.vizWidth - layout.rowGap * (numberOfPartyGroups - 1)) / numberOfPartyGroups //each row of segments will be this wide, including segmentGaps
        return waveGroup.map((partyGroup, partyGroupIdx) => {
          const groupTopLeftX = (partyRowOuterWidth + layout.rowGap) * partyGroupIdx
          const partyRowAvailableInnerWidth = partyRowOuterWidth
            - layout.segmentGap * (partyGroup.length - 1)  //subtract segment gaps
            - (2 * layout.pointRadius) * partyGroup.length;      //subtract minimum width allocated to each segment
          const groupSegmentWidths = partyGroup.map(p => 2 * layout.pointRadius + p * partyRowAvailableInnerWidth)  //minimum with plus share of available
          return groupSegmentWidths.map((w, wIdx) => ({
            topLeftX: groupTopLeftX + groupSegmentWidths.slice(0, wIdx).reduce((acc, curr) => acc + curr, 0) + layout.segmentGap * wIdx,
            topLeftY: waveGroupTopLeftY,
            width: w,
            height: layout.vizWidth / layout.A
          }))
        })
      })
  }
  return outSegments
}