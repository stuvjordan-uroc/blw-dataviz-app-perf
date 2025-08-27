import { describe, test, expect } from '@jest/globals'
import { allocatePointsByResponseAndPartyExpanded } from '../functions-and-types/points-map/allocate-points-byresponseandparty.ts'
import fakeSegmentMaps from './fake-segment-maps.ts'
import makeEmptyPointsMap from '../functions-and-types/points-map/make-empty-points-map.ts'
const pointsMap = makeEmptyPointsMap(fakeSegmentMaps.segmentsRWP)
allocatePointsByResponseAndPartyExpanded(
  fakeSegmentMaps.segmentsRP,
  fakeSegmentMaps.segmentsRWP,
  pointsMap
)
import util from 'node:util'
//console.log(util.inspect(pointsMap, true, 4, true))
describe('allocatePointsByResponseAndPartyExpanded...', () => {
  //puts the right number of points in each position at each rg-pg
  const tableOfCounts = pointsMap.entries().toArray()
    .map(([rg, rgVal]) =>
      rgVal.entries().filter(([wave, waveVal]) => waveVal !== null).toArray()
        .map(([wave, waveVal]) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          waveVal!.entries().toArray()
            .map(([pg, pgVal]) => ({
              rg: rg,
              wave: wave,
              pg: pg,
              numPoints: pgVal.expanded.byResponseAndParty.length,
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
  //take the segmentMapRP used to allocate the points
  //at each rp-pg in that segmentMapRP, get the count.
  //call that the inputAggregatedCount.  Check if that matches the
  //aggregated count implied by the points allocated to the pointsMap
  const tableOfAggregatedCounts = fakeSegmentMaps.segmentsRP.entries().toArray().map(([rg, rgVal]) =>
    rgVal.entries().toArray().map(([pg, pgVal]) => ({
      rg: rg,
      pg: pg,
      inputAggCount: pgVal.count,
      pointsMapAggCount: pointsMap.get(rg)?.entries().filter(([wave, waveVal]) => waveVal !== null).map(([wave, waveVal]) =>
        waveVal?.get(pg)?.expanded.byResponseAndParty.length
      ).reduce((acc, curr) => acc + curr, 0)
    }))
  )
  test.each(tableOfAggregatedCounts)(
    'The aggregated counts are correct at $rg and $pg',
    ({ rg, pg, inputAggCount, pointsMapAggCount }) => {
      expect(pointsMapAggCount).toBe(inputAggCount)
    }
  )
  //point counts aggregate across waves correctly at each rg-pg
  //each point is correctly allocated at each rg-pg
})