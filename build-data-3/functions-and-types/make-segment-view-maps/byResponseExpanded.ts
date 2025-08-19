import impVarIsIncluded from "../impvar-is-included.ts";
import aggPropMapByResponseExpanded from "../make-aggregated-proportion-map/byResponseExpanded.ts";
import type { Data, Layout, VizConfig } from "../types.ts";

export default function segmentViewMapByResponseExpanded(
  impVar: string,
  data: Data,
  vizConfig: VizConfig,
  layout: Layout
) {
  //get the aggregated proportions map
  const aggP = aggPropMapByResponseExpanded(impVar, data, vizConfig)
  //compute the width to be distrubuted between the segments
  const widthToBeDistributed =
    layout.vizWidth //start with the vizWidth
    - 2 * layout.pointRadius * aggP.size //subtract the minimum width to be allocated to each segement
    - layout.responseGap * (aggP.size - 1) //subtract the gaps between segments
  //get the number of waves at which the requested impVar is included
  const numWavesIncluded = data.waves.imp.filter(wave => impVarIsIncluded(impVar, data, wave)).length
  return new Map(
    aggP.entries().map(([responseGroup, pAtRG], responseGroupIdx) => ([
      responseGroup,
      {
        topLeftY: layout.labelHeight,
        topLeftX: (2 * layout.pointRadius + layout.responseGap) * responseGroupIdx + widthToBeDistributed * pAtRG.prevCumProportion,
        width: 2 * layout.pointRadius + widthToBeDistributed * pAtRG.proportion,
        height: layout.waveHeight * numWavesIncluded
      }
    ]))
  )
}