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




function unsplitCoordinates(
  waveIdx: number,
  numWaves: number,
  partyGroupIdx: number,
  numPartyGroups: number,
  numResponseGroups: number,
  responseGroupCumPrevProportion: number,
  responseGroupProportion: number,
  pointCount: number,
  layout: Layout,
) {
  const height = layout.vizWidth / layout.A / numWaves;
  const topLeftY = layout.labelHeightTop + height * waveIdx;
  const totalWidthOfSegmentsAtPartyGroup = layout.vizWidth / numPartyGroups;
  const partyGroupTopLeftX = totalWidthOfSegmentsAtPartyGroup * partyGroupIdx;
  const remainingAvailableWidthAfterMinimumWidth = totalWidthOfSegmentsAtPartyGroup - numResponseGroups * layout.pointRadius
  const topLeftX = partyGroupTopLeftX + availableWidth * responseGroupCumPrevProportion;
  const width = availableWidth * responseGroupProportion;
  const points = segmentPoints(
    topLeftX,
    topLeftY,
    width,
    height,
    pointCount,
    layout.pointRadius
  )
  return ({
    topLeftY: topLeftY,
    height: height,
    topLeftX: topLeftX,
    width: width,
    points: points
  })
}

export default function addUnsplitCoordinates(layout: Layout, propsAndCountsMap: PropsAndCountsMap) {
  return new Map(
    propsAndCountsMap.entries().map(([wave, valAtWave], waveIdx) => ([
      wave,
      new Map(
        valAtWave.entries().map(([partyGroup, valAtPartyGroup], partyGroupIdx) => ([
          partyGroup,
          {
            ...valAtPartyGroup,
            unsplit: new Map(
              valAtPartyGroup.proportions.expanded.entries().map(([responseGroup, valAtResponseGroup], responseGroupIdx) => ([
                responseGroup,
                {
                  topLeftX: layout.vizWidth / valAtWave.size * partyGroupIdx + 2 * layout.pointRadius * responseGroupIdx + valAtResponseGroup.prevCumProportion * (layout.vizWidth / valAtWave.size - 2 * layout.pointRadius * valAtPartyGroup.counts.size),
                  topLeftY: layout.labelHeightTop + layout.vizWidth / layout.A / propsAndCountsMap.size * waveIdx,
                  width: 2 * layout.pointRadius + valAtResponseGroup.proportion * (layout.vizWidth / valAtWave.size - 2 * layout.pointRadius * valAtPartyGroup.counts.size),
                  height: layout.vizWidth / layout.A / propsAndCountsMap.size,
                  points: [] as PointCoordinates[]
                }
              ])))
          }
        ]))
      )
    ]))
  )
}