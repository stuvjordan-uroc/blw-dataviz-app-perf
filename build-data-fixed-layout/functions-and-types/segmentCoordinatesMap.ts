import segmentPoints from "./segment-points.ts";
import type { ProportionsByGroupedState, ResponseGroup, Layout, VizConfig } from "./types-new.ts";

export default function segmentCoordinatesExpandedMap(
  waveIdx: number,
  partyGroupIdx: number,
  proportions: ProportionsByGroupedState,
  counts: Map<ResponseGroup, number>,
  layout: Layout,
  vizConfig: VizConfig,
  waveGap: number,
  partyGap: number,
  responseGap: number,
) {
  /*
  returns a map from responseGroup to segment coordinates.

  By taking waveGap, partyGap, and segmentGap arguments,
  can return segment coordinates for any view!
  */

  //first compute the total width (including responseGap) of any one
  //partyGroup row of segments
  //each partyGroup gets an equal share of the vizWidth minus partyGaps between partyGroups
  const totalWidthPartyGroup = (layout.vizWidth - partyGap * (vizConfig.partyGroups.length - 1)) / vizConfig.partyGroups.length
  //now compute the top left X of the requested partyGroup row of segments
  const topLeftXPartyGroup = (totalWidthPartyGroup + partyGap) * partyGroupIdx
  //now compute the top left Y of the requested wave
  const topLeftYWave = layout.labelHeight + (layout.waveHeight + waveGap) * waveIdx
  //now compute the width to be distributed proportionally between the segments
  //each segment will have a basis width of 2*layout.pointRadius.
  //Then we will add a proportional amount to that from the available width
  const widthToBeDistributed = totalWidthPartyGroup //start with the total width of the group
    - 2 * layout.pointRadius * vizConfig.responseGroups.expanded.length //subtract the basis widths
    - responseGap * (vizConfig.responseGroups.expanded.length - 1)//subtract the responseGaps
  //now we can map!
  return new Map(
    proportions.expanded.entries().map(([responseGroup, valAtResponseGroup], responseGroupIdx) => {
      const currentSegmentWidth = 2 * layout.pointRadius + widthToBeDistributed * valAtResponseGroup.proportion;
      const cumPrevSegmentWidths = (2 * layout.pointRadius + responseGap) * responseGroupIdx + widthToBeDistributed * valAtResponseGroup.prevCumProportion;

      return ([
        responseGroup,
        {
          topLeftX: topLeftXPartyGroup + cumPrevSegmentWidths,
          topLeftY: topLeftYWave,
          width: currentSegmentWidth,
          height: layout.waveHeight,
          points: segmentPoints(
            topLeftXPartyGroup + cumPrevSegmentWidths,
            topLeftYWave,
            currentSegmentWidth,
            layout.waveHeight,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            counts.get(responseGroup)!,
            layout.pointRadius
          )
        }
      ])
    })
  )
}