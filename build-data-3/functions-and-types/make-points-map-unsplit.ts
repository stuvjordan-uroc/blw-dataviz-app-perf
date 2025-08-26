import type { SegmentViews } from "./types.ts";

export default function makePointsMapUnsplit(segmentViews: SegmentViews) {
  const allPoints = segmentViews.unsplit.allPoints
  return new Map(
    segmentViews.expanded.byResponseAndWaveAndParty.entries().map(([rg, rgVal]) => {
      return ([
        rg,
        new Map(
          rgVal.entries().map(([wave, waveVal]) => {
            return ([
              wave,
              waveVal === null ? null : new Map(
                waveVal.entries().map(([pg, pgVal]) => {
                  return ([
                    pg,
                    allPoints.splice(0, pgVal.count)
                  ])
                })
              )
            ])
          })
        )
      ])
    })
  )
}