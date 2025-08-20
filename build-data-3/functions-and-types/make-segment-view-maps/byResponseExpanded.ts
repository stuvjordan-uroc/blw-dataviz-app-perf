import { aggregateProportionsByResponseExpanded } from "../aggregate/proportions/byResponse.ts";
import type { Layout, ProportionsMap, VizConfig } from "../types.ts";

export default function segmentViewMapByResponseExpanded(
  proportionsMap: ProportionsMap,
  vizConfig: VizConfig,
  layout: Layout
) {
  //get the aggregated proportions map
  const aggPMap = aggregateProportionsByResponseExpanded(proportionsMap, vizConfig)
  //compute the stuff needed for the segments
  const topLeftY = layout.labelHeight
  const widthToBeDistributed =
    layout.vizWidth //start with the whole vizWidth
    - 2 * layout.pointRadius * aggPMap.size //subtract the minimum widths for the segments
    - layout.responseGap * (aggPMap.size - 1) //subtract the responseGaps
  const numberOfIncludedWaves = proportionsMap.values().filter(pAtWave => pAtWave !== null).toArray().length
  return new Map(
    aggPMap.entries().map(([rG, pAtRg], rGIdx) => ([
      rG,
      {
        topLeftY: topLeftY,
        topLeftX: 2 * layout.pointRadius * rGIdx + layout.responseGap * rGIdx + widthToBeDistributed * pAtRg.prevCumProportion,
        width: 2 * layout.pointRadius + widthToBeDistributed * pAtRg.proportion,
        height: layout.waveHeight * numberOfIncludedWaves
      }
    ]))
  )
}