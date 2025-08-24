import { test, describe, expect } from '@jest/globals'
import { byResponse, unSplit } from '../functions-and-types/make-segment-views-expanded.ts'
import fakePAndC from './fake-pandc.ts'

const unsplit = unSplit(fakePAndC.pAndC.principle1, fakePAndC.layout, fakePAndC.data.waves.imp.length)
const byresponse = byResponse(fakePAndC.pAndC.principle1, fakePAndC.layout, fakePAndC.data.waves.imp.length)

describe("Unsplit segment's...", () => {
  test('count matches the pAndC count', () => {
    expect(unsplit.count)
      .toBe(
        fakePAndC.pAndC.principle1.expanded
          .entries()
          .map(([rg, rgVal]) => rgVal.c)
          .reduce((acc, curr) => acc + curr, 0)
      )
  })
})

describe("Map retrned by byResponse...", () => {
  test.each(
    byresponse
      .entries()
      .map(([rg, rgVal]) => ([rgVal.count, fakePAndC.pAndC.principle1.expanded.get(rg)?.c]))
      .toArray()
  )('has the correct count at each response group.', (count, correctCount) => {
    expect(count).toBe(correctCount)
  })
  test('Left most edge of left most segment to be 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(byresponse.get(fakePAndC.vizConfig.responseGroups.expanded[0]!)?.segmentCoordinates.topLeftX).toBe(0)
  })
  test('Right most edge of the right most segment to be the width specified in the vizConfig', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rightMostSegment = byresponse.get(fakePAndC.vizConfig.responseGroups.expanded[fakePAndC.vizConfig.responseGroups.expanded.length - 1]!)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(rightMostSegment!.segmentCoordinates.topLeftX + rightMostSegment!.segmentCoordinates.width).toBeCloseTo(fakePAndC.layout.vizWidth)
  })
  const widthToDistribute = fakePAndC.layout.vizWidth //start with the total width
    - 2 * fakePAndC.layout.pointRadius * fakePAndC.pAndC.principle1.expanded.size  //subtract the minimum width of each segment
    - fakePAndC.layout.responseGap * (fakePAndC.pAndC.principle1.expanded.size - 1)  //subtract the response gaps
  test.each(
    byresponse
      .entries()
      .map(([rg, rgVal]) => ([
        rgVal.segmentCoordinates.width,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        fakePAndC.layout.pointRadius * 2 + fakePAndC.pAndC.principle1.expanded.get(rg)!.p * widthToDistribute
      ]))
      .toArray()
  )('Has approximately the right width for each segment', (segmentWidth, rightWidth) => {
    expect(segmentWidth).toBeCloseTo(rightWidth)
  })
  test.each(
    byresponse
      .entries()
      .map(([rg, rgVal]) => ([
        rgVal.segmentCoordinates.height,
        fakePAndC.layout.waveHeight * fakePAndC.data.waves.imp.length
      ]))
      .toArray()
  )('Has the correct height for each segment', (segmentHeight, correctHeight) => {
    expect(segmentHeight).toBe(correctHeight)
  })
})