import { describe, test, expect } from '@jest/globals'
import { allocatePointsByResponseAndWaveExpanded } from '../functions-and-types/points-map/allocate-points-byresponseandwave.ts'
import fakeSegmentMaps from './fake-segment-maps.ts'
import makeEmptyPointsMap from '../functions-and-types/points-map/make-empty-points-map.ts'
const pointsMap = makeEmptyPointsMap(fakeSegmentMaps.segmentsRWP)

const tSegmentsRW = new Map(
  fakeSegmentMaps.segmentsRWP
    .entries()
    .map(([rg, rgVal]) => ([
      rg,
      new Map(
        rgVal
          .entries()
          .map(([wave, waveVal]) => ([
            wave,
            waveVal === null ? null :
              {
                count: waveVal.values().map((pgVal) => pgVal.count).reduce((acc, curr) => acc + curr, 0),
                segmentCoordinates: { topLeftX: 0, topLeftY: 0, width: 0, height: 0 },
                allPoints: waveVal.values().toArray().map((pgVal) => pgVal.allPoints).flat(1)
              }
          ]))
      )
    ]))
)

allocatePointsByResponseAndWaveExpanded(tSegmentsRW, fakeSegmentMaps.segmentsRWP, pointsMap)
describe('allocatePointsByResponseAndWaveExpanded...', () => {
  //puts the right number of points in every position
  const tableOfCounts = pointsMap
    .entries()
    .toArray()
    .map(([rg, rgVal]) =>
      rgVal
        .entries()
        .filter(([wave, waveVal]) => waveVal !== null)
        .toArray()
        .map(([wave, waveVal]) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          waveVal!
            .entries()
            .toArray()
            .map(([pg, pgVal]) => ({
              rg: rg,
              wave: wave,
              pg: pg,
              numPoints: pgVal.expanded.byResponseAndWave.length,
              correctNumPoints: fakeSegmentMaps.segmentsRWP.get(rg)?.get(wave)?.get(pg)?.count
            }))
        )
    ).flat(2)
  test.each(tableOfCounts)(
    'puts the correct number of points at $rg, $wave, $pg',
    ({ rg, wave, pg, numPoints, correctNumPoints }) => {
      expect(numPoints).toBe(correctNumPoints)
    }
  )
})