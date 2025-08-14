import type { Layout, ProportionsByGroupedState, ResponseGroup, Data, VizConfig, PointCoordinates } from "./types-new.ts";
import segmentPoints from "./segment-points.ts";

type PropsAndCountsMap = Map<number, {
  impVarIncluded: boolean, map: Map<string[], {
    proportions: ProportionsByGroupedState;
    counts: Map<ResponseGroup, number>;
  }>
}>

interface PAndCAtWaveAndPartyGroup {
  proportions: ProportionsByGroupedState;
  counts: Map<ResponseGroup, number>;
}


function unsplitCoordinatesMap(pAndC: PAndCAtWaveAndPartyGroup, layout: Layout, data: Data, waveIdx: number, vizConfig: VizConfig, partyIdx: number) {
  const segmentHeight = layout.vizWidth / layout.A / data.waves.imp.length
  const waveTopLeftY = segmentHeight * waveIdx;
  const totalAvailableHSpace = layout.vizWidth;
  const partyGroupAvailableHSpace = totalAvailableHSpace / vizConfig.partyGroups.length
  const partyGroupTopLeftX = partyGroupAvailableHSpace * partyIdx;

  return new Map(pAndC.proportions.expanded.entries().map(([responseGroup, proportion]) => ([
    responseGroup,
    {
      topLeftY: waveTopLeftY,
      topLeftX: partyGroupTopLeftX + proportion.prevCumProportion * partyGroupAvailableHSpace,
      width: proportion.proportion * partyGroupAvailableHSpace,
      height: segmentHeight,
      points: segmentPoints(
        partyGroupTopLeftX + proportion.prevCumProportion * partyGroupAvailableHSpace,
        waveTopLeftY,
        proportion.proportion * partyGroupAvailableHSpace,
        segmentHeight,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        pAndC.counts.get(responseGroup)!,
        layout.pointRadius
      ) as PointCoordinates[]
    }
  ])))
}

export default function addUnsplitCoordinates(layout: Layout, propsAndCountsMap: PropsAndCountsMap, data: Data, vizConfig: VizConfig) {
  return new Map(
    propsAndCountsMap.entries().filter(([wave, valAtWave]) => valAtWave.map).map(([wave, valAtWave], waveIdx) => ([
      wave,
      {
        impVarIncluded: valAtWave.impVarIncluded,
        map: new Map(
          valAtWave.map.entries().map(([partyGroup, valAtPartyGroup], pgIdx) => ([
            partyGroup,
            {
              ...valAtPartyGroup,
              unsplitCoordinates: unsplitCoordinatesMap(valAtPartyGroup, layout, data, waveIdx, vizConfig, pgIdx)
            }
          ]))
        )
      }
    ]))
  )
}