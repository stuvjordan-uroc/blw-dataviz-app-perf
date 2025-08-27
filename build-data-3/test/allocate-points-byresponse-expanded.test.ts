import { describe, test, expect } from '@jest/globals'
import { allocatePointsByResponseExpanded } from '../functions-and-types/points-map/allocate-points-byresponse.ts'
import fakeSegmentMaps from './fake-segment-maps.ts'
import makeEmptyPointsMap from '../functions-and-types/points-map/make-empty-points-map.ts'
const pointsMap = makeEmptyPointsMap(fakeSegmentMaps.segmentsRWP)
allocatePointsByResponseExpanded(fakeSegmentMaps.segmentsR, fakeSegmentMaps.segmentsRWP, pointsMap)
describe('allocatePointsByResponseExpanded...', () => {
  //puts the right number of points in each position
  const tableOfCounts = pointsMap.entries().toArray().map(([rg, rgVal]) =>
    rgVal.entries().filter(([wave, waveVal]) => waveVal !== null).toArray().map(([wave, waveVal]) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      waveVal!.entries().toArray().map(([pg, pgVal]) => {
        return ({
          rg: rg,
          wave: wave,
          pg: pg,
          numPoints: pgVal.expanded.byResponse.length,
          correctNumPoints: fakeSegmentMaps.segmentsRWP.get(rg)?.get(wave)?.get(pg)?.count
        })
      })
    )
  ).flat(2)
  test.each(tableOfCounts)(
    'puts the correct number of points at $rg, $wave, $pg',
    ({ rg, wave, pg, numPoints, correctNumPoints }) => {
      expect(numPoints).toBe(correctNumPoints)
    }
  )
  //points aggregate across waves and party groups correctly at each response group
  const tableOfAggregatedCounts = pointsMap.entries().toArray().map(([rg, rgVal]) => {
    const aggregatedCount = rgVal.values()
      .filter(waveVal => waveVal !== null)
      .map(waveVal =>
        waveVal.values()
          .map(pgVal => pgVal.expanded.byResponse.length)
          .reduce((acc, curr) => acc + curr, 0)
      )
      .reduce((acc, curr) => acc + curr, 0)
    const correctAggregatedCount = fakeSegmentMaps.segmentsRWP.get(rg)?.values()
      .filter(waveVal => waveVal !== null)
      .map(waveVal =>
        waveVal.values()
          .map(pgVal => pgVal.count)
          .reduce((acc, curr) => acc + curr, 0)
      ).reduce((acc, curr) => acc + curr, 0)
    return ({
      rg: rg,
      aggregatedCount: aggregatedCount,
      correctAggregatedCount: correctAggregatedCount
    })
  })
  test.each(tableOfAggregatedCounts)(
    'aggregated counts are correct at $rg',
    ({ rg, aggregatedCount, correctAggregatedCount }) => {
      expect(aggregatedCount).toBe(correctAggregatedCount)
    }
  )
  //each point is correctly allocated
  const tableOfPoints = pointsMap.entries().toArray().map(([rg, rgVal]) =>
    rgVal.entries().filter(([wave, waveVal]) => waveVal !== null).toArray().map(([wave, waveVal]) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      waveVal!.entries().toArray().map(([pg, pgVal]) => {
        return ({
          rg: rg,
          wave: wave,
          pg: pg,
          points: pgVal.expanded.byResponse,
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