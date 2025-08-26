import { describe, test, expect } from '@jest/globals'
import makePointsMapUnsplit from '../functions-and-types/make-points-map-unsplit.ts'
import { fakeSegmentViews } from './fake-segment-views.ts'

const pmUnsplit = makePointsMapUnsplit(fakeSegmentViews)
const totalPointsAllocated = pmUnsplit.values()
  .map(rgVal =>
    rgVal.values().filter(waveVal => waveVal !== null)
      .map(waveVal =>
        waveVal.values()
          .map(pgVal =>
            pgVal.length
          )
          .reduce((acc, curr) => acc + curr, 0)
      )
      .reduce((acc, curr) => acc + curr, 0)
  )
  .reduce((acc, curr) => acc + curr, 0)

describe('The map returned by makePointsMapUnsplit...', () => {
  //has the correct number of points
  test('has the correct number of points', () => {
    expect(totalPointsAllocated).toBe(fakeSegmentViews.unsplit.allPoints.length)
  })
})
