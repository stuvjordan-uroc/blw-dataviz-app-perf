import type { SegmentViews, Point, PointsMap } from "./types.ts";

export function setUnsplitPoints(pointsMap: PointsMap, segmentViews: SegmentViews) {
  const allPoints = segmentViews.unsplit.allPoints
  pointsMap.entries().forEach(([rg, rgVal]) => {
    rgVal.entries().filter(([wave, waveVal]) => waveVal !== null).forEach(([wave, waveVal]) => {
      waveVal?.entries().forEach(([pg, pgVal]) => {
        const spliceSize = pgVal.count
        if (typeof spliceSize !== "number") {
          throw new Error(`You passed a pointsMap to setUnsplitPoints that does not have count property set to a number at response group [${rg.toString()}], wave ${wave.toString(10)}, party group [${pg.toString()}]`)
        }
        if (isNaN(spliceSize)) {
          throw new Error(`You passed a pointsMap to setUnsplitPoints that has a count of NaN at response group [${rg.toString()}], wave ${wave.toString(10)}, party group [${pg.toString()}]`)
        }
        if (spliceSize < 0) {
          throw new Error(`You passed a pointsMap to setUnsplitPoints that has a negative count at response group [${rg.toString()}], wave ${wave.toString(10)}, party group [${pg.toString()}]`)
        }
        const pointSlice = allPoints.splice(0, spliceSize)
        if (pointSlice.length < spliceSize) {
          throw new Error(`The segmentViews object you passed to setUnsplitPoints map does not have enough points in it's unpslit segment to fill out the pointsMap you passed.`)
        }
        pgVal.points.unsplit = pointSlice
      })
    })
  })
}

export function makePointsMapExpanded(segmentViews: SegmentViews) {
  const out = new Map(
    segmentViews.expanded.byResponseAndWaveAndParty.entries().map(([rg, rgVal]) => ([
      rg,
      new Map(
        rgVal.entries().map(([wave, waveVal]) => ([
          wave,
          waveVal === null ? null :
            new Map(
              waveVal.entries().map(([pg, pgVal]) => ([
                pg,
                {
                  count: pgVal.count,
                  points: {
                    unsplit: [] as Point[],
                    expanded: {
                      byResponse: [] as Point[],
                      byResponseAndParty: [] as Point[],
                      byResponseAndWave: [] as Point[],
                      byResponseAndWaveAndParty: [] as Point[]
                    }
                  }
                }
              ]))
            )
        ]))
      )
    ]))
  )
}