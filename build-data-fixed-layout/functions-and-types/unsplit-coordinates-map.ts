import type { Layout, VizConfig, PropsAndCountsMap } from "./types-new.ts";
import segmentCoordinatesExpandedMap from "./segmentCoordinatesMap.ts";







export default function unsplitCoordinatesMap(layout: Layout, propsAndCountsMap: PropsAndCountsMap, vizConfig: VizConfig) {
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