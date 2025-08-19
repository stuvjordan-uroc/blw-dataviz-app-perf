import type { Layout, ProportionsByGroupedState, ResponseGroup, VizConfig } from "./types-new.ts";
import segmentPoints from "./segment-points.ts";
import segmentCoordinatesExpandedMap from "./segmentCoordinatesMap.ts";

type PropsAndCountsMap = Map<number, {
  impVarIsIncluded: boolean;
  proportions: Map<string[], ProportionsByGroupedState>;
  counts: Map<string[], Map<ResponseGroup, number>>;
}>






export default function addUnsplitCoordinates(layout: Layout, propsAndCountsMap: PropsAndCountsMap, vizConfig: VizConfig) {
  return new Map(
    propsAndCountsMap.entries().map(([wave, valAtWave], waveIdx) => {
      return ([
        wave,
        new Map(
          valAtWave.proportions.entries().map(([partyGroup, valAtPartyGroup], partyGroupIdx) => {
            return ([
              partyGroup,
              segmentCoordinatesExpandedMap(
                waveIdx,
                partyGroupIdx,
                valAtPartyGroup,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                valAtWave.counts.get(partyGroup)!,
                layout,
                vizConfig,
                0,
                0,
                0
              )
            ])
          })
        )
      ])
    })
  )
}