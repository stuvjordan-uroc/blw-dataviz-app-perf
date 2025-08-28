import { describe, test, expect } from '@jest/globals'
import allocatePointsUnsplit from '../functions-and-types/points-map/allocate-points-unsplit.ts'
import fakeSegmentMaps from './fake-segment-maps.ts'
import makeEmptyPointsMap from '../functions-and-types/points-map/make-empty-points-map.ts'
const pointsMap = makeEmptyPointsMap(fakeSegmentMaps.segmentsRWP)
allocatePointsUnsplit(fakeSegmentMaps.allPoints, fakeSegmentMaps.segmentsRWP, pointsMap)
describe('allocatePointsUnsplit...', () => {
  //puts the right number of points in each position
  const tableOfCounts = pointsMap.entries().toArray().map(([rg, rgVal]) =>
    rgVal.entries().filter(([wave, waveVal]) => waveVal !== null).toArray().map(([wave, waveVal]) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      waveVal!.entries().toArray().map(([pg, pgVal]) => {
        return ({
          rg: rg,
          wave: wave,
          pg: pg,
          numPoints: pgVal.unsplit.length,
          correctNumPoints: fakeSegmentMaps.segmentsRWP.get(rg)?.get(wave)?.get(pg)?.count
        })
      })
    )
  ).flat(2)
  test.each(tableOfCounts)(
    'Allocates the correct number of points at $rg, $wave, $pg',
    ({ rg, wave, pg, numPoints, correctNumPoints }) => {
      expect(numPoints).toBe(correctNumPoints)
    }
  )
  //puts the correct points in each position
  const tableOfPoints = pointsMap.entries().toArray().map(([rg, rgVal]) =>
    rgVal.entries().filter(([wave, waveVal]) => waveVal !== null).toArray().map(([wave, waveVal]) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      waveVal!.entries().toArray().map(([pg, pgVal]) => {
        return ({
          rg: rg,
          wave: wave,
          pg: pg,
          points: pgVal.unsplit,
          correctPoints: fakeSegmentMaps.segmentsRWP.get(rg)?.get(wave)?.get(pg)?.allPoints
        })
      })
    )
  ).flat(2)
  test.each(tableOfPoints)(
    'Allocates the correct points at $rg, $wave, $pg',
    ({ rg, wave, pg, points, correctPoints }) => {
      expect(points).toStrictEqual(correctPoints)
    }
  )
})