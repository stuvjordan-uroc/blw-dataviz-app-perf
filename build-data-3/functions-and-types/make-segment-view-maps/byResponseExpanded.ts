import type { Layout, PAndC } from "../types.ts";

export default function segmentViewMapByResponseExpanded(
  pAndC: PAndC,
  layout: Layout
) {
  //compute the stuff needed for the segments
  const topLeftY = layout.labelHeight
  const widthToBeDistributed =
    layout.vizWidth //start with the whole vizWidth
    - 2 * layout.pointRadius * pAndC.expanded.size //subtract the minimum widths for the segments
    - layout.responseGap * (pAndC.expanded.size - 1) //subtract the responseGaps
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const height = pAndC.expanded.values().toArray()[0]!.waveSplit.size * layout.waveHeight
  return new Map(
    pAndC.expanded.entries().map(([rg, rgVal], rgIdx) => ([
      rg,
      {
        topLeftY: topLeftY,
        topLeftX: rgIdx === 0 ? 0 :
          pAndC.expanded
            .values()
            .take(rgIdx)
            .map((prevRgVal) => 2 * layout.pointRadius + prevRgVal.p * widthToBeDistributed + layout.responseGap)
            .reduce((acc, curr) => acc + curr, 0),
        width: 2 * layout.pointRadius + rgVal.p * widthToBeDistributed,
        height: height
      }
    ]))
  )
}