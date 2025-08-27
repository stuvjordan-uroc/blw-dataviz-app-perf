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
  //point counts aggregate across waves correctly at each rg-pg
  const tableOfAggregatedCounts = pointsMap.entries().toArray().map(([]))
  //each point is correctly allocated at each rg-pg
})