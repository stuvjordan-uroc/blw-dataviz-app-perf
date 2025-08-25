import { test, describe, expect } from '@jest/globals'
import { byResponse, byResponseAndParty, byResponseAndWave, unSplit } from '../functions-and-types/make-segment-views-expanded.ts'
import fakePAndC from './fake-pandc.ts'
import impVarIsIncluded from '../functions-and-types/impvar-is-included.ts'

function getLastRgSegments(m: Map<string[], Map<never, never>>) {
  const rgSegmentsIterator = m.values()
  let lastElement = new Map()
  let nextElement = rgSegmentsIterator.next()
  while (!nextElement.done) {
    lastElement = nextElement.value
    nextElement = rgSegmentsIterator.next()
  }
  return lastElement
}

const unsplit = unSplit(fakePAndC.pAndC.principle1, fakePAndC.layout, fakePAndC.data.waves.imp.length)
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

const byresponse = byResponse(fakePAndC.pAndC.principle1, fakePAndC.layout, fakePAndC.data.waves.imp.length)
describe("Map returned by byResponse...", () => {
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

const byresponseandparty = byResponseAndParty(fakePAndC.pAndC.principle1, fakePAndC.layout, fakePAndC.data.waves.imp.length, fakePAndC.vizConfig.partyGroups.length)
describe("Map returned by byResponseAndParty", () => {
  //correct counts
  const tableOfCounts = byresponseandparty.entries()
    .map(([rg, rgVal]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const pAndCAtRg = fakePAndC.pAndC.principle1.expanded.get(rg)!
      return rgVal.entries()
        .map(([pg, pgVal]) => ([
          rg,
          pg,
          pgVal.count,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pAndCAtRg.partySplit.get(pg)!.c
        ]))
        .toArray()
    })
    .toArray()
    .flat(1)
  test.each(tableOfCounts)('has the correct count at segment for rg %p and pg %p', (rg, pg, segmentCount, correctCount) => {
    expect(segmentCount).toBe(correctCount)
  })
  //left-most edge of left most segment is at 0
  test('Left most edge of left most segment is 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const leftEdge = byresponseandparty
      .values()
      .toArray()[0]!
      .values()
      .toArray()[0]!
      .coordinates
      .topLeftX
    expect(leftEdge).toBe(0)
  })
  //right-most edge is about where it should be
  //get the last response group map
  const lastRgMap = byresponseandparty.values().toArray()[byresponseandparty.values().toArray().length - 1]
  //get the last party group at the last responsegroup
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const lastSegment = lastRgMap!.values().toArray()[lastRgMap!.values().toArray().length - 1]
  //get the last party group
  test('Right most edge is about where is should be', () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    expect(lastSegment!.coordinates.topLeftX + lastSegment!.coordinates.width).toBeCloseTo(fakePAndC.layout.vizWidth)
  })
  const partyGroupTotalWidth = (fakePAndC.layout.vizWidth - fakePAndC.layout.partyGap * (fakePAndC.vizConfig.partyGroups.length - 1)) / fakePAndC.vizConfig.partyGroups.length
  const partyGroupWidthToDistribute = partyGroupTotalWidth
    - 2 * fakePAndC.layout.pointRadius * fakePAndC.vizConfig.responseGroups.expanded.length
    - fakePAndC.layout.responseGap * (fakePAndC.vizConfig.responseGroups.expanded.length - 1)
  const segmentHeight = fakePAndC.layout.waveHeight * fakePAndC.data.waves.imp.length
  const tableOfSegmentWidthsAndHeights = byresponseandparty.entries().toArray().map(([rg, rgVal], rgIdx) => {
    return rgVal.entries().toArray().map(([pg, pgVal], pgIdx) => {
      const partyGroupTopLeftX = pgIdx === 0 ? 0 : (partyGroupTotalWidth + fakePAndC.layout.partyGap) * pgIdx
      const rgTopLeftX = partyGroupTopLeftX + (rgIdx === 0 ? 0 :
        fakePAndC.pAndC.principle1.expanded.values().take(rgIdx)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((prevRgVal) => 2 * fakePAndC.layout.pointRadius + prevRgVal.partySplit.get(pg)!.p * partyGroupWidthToDistribute + fakePAndC.layout.responseGap)
          .reduce((acc, curr) => acc + curr, 0)
      )
      return ([
        rg,
        pg,
        pgVal.coordinates.width,
        pgVal.coordinates.height,
        pgVal.coordinates.topLeftX,
        pgVal.coordinates.topLeftY,
        //correct width here
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        2 * fakePAndC.layout.pointRadius + fakePAndC.pAndC.principle1.expanded.get(rg)!.partySplit.get(pg)!.p * partyGroupWidthToDistribute,
        //correct height here
        segmentHeight,
        //correct topLeftX here
        rgTopLeftX,
        //correct topLeftY here
        fakePAndC.layout.labelHeight
      ])
    })
  }).flat(1)
  test.each(tableOfSegmentWidthsAndHeights)('has correct coordinates at %p and %p', (rg: number | string[], pg: number | string[], w: number | string[], h: number | string[], tlx: number | string[], tly: number | string[], correctW: number | string[], correctH: number | string[], correctTlx: number | string[], correctTly: number | string[]) => {
    expect(w).toBeCloseTo(correctW as number)
    expect(h).toBeCloseTo(correctH as number)
    expect(tlx).toBeCloseTo(correctTlx as number)
    expect(tly).toBeCloseTo(correctTly as number)
  })
})

const byresponseandwave = byResponseAndWave(fakePAndC.pAndC.principle1, fakePAndC.layout, fakePAndC.data.waves.imp.length)
describe("Map returned by byResponseAndWave", () => {
  //test waves are null where they should be
  const tableOfWavesNull = byresponseandwave.entries().map(([rg, rgVal]) => {
    return rgVal.entries().map(([wave, waveVal]) => {
      return ({
        rg: rg,
        wave: wave,
        isNull: waveVal === null,
        shouldBeNull: !impVarIsIncluded('principle1', fakePAndC.data, wave)
      })
    }).toArray()
  }).toArray().flat(1)
  test.each(tableOfWavesNull)(
    'At response group $rg and wave $wave, it is has the correct null status',
    ({ rg, wave, isNull, shouldBeNull }) => {
      expect(isNull).toBe(shouldBeNull)
    })
  //test counts are correct
  const tableOfPointCounts = byresponseandwave.entries().toArray().map(([rg, rgVal], rgIdx) =>
    rgVal.entries().toArray().map(([wave, waveVal], waveIdx) => {
      const correctWaveVal = fakePAndC.pAndC.principle1.expanded.get(rg)?.waveSplit.get(wave)
      return ({
        rg: rg,
        wave: wave,
        count: waveVal === null ? null : waveVal.count,
        correctCount: correctWaveVal === null ? null : correctWaveVal?.c
      })
    })
  ).flat(1)
  test.each(tableOfPointCounts)(
    'At response group $rg and wave $wave, it has the correct point count',
    ({ rg, wave, count, correctCount }) => {
      expect(count).toBe(correctCount)
    }
  )
  //test coordinates are correct
  const correctWidthToDistribute = fakePAndC.layout.vizWidth
    - 2 * fakePAndC.layout.pointRadius * fakePAndC.pAndC.principle1.expanded.size
    - fakePAndC.layout.responseGap * (fakePAndC.pAndC.principle1.expanded.size - 1)
  const tableOfCoordinates = byresponseandwave.entries().toArray().map(([rg, rgVal], rgIdx) => {
    return rgVal.entries().toArray().map(([wave, waveVal], waveIdx) => {
      if (waveVal === null) {
        return ({
          rg: rg,
          wave: wave,
          coordinates: null,
          correctCoordinates: null
        })
      }
      const correctTopLeftX = fakePAndC.pAndC.principle1.expanded.values()
        .take(rgIdx)
        .map((prevRgVal) =>
          2 * fakePAndC.layout.pointRadius
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          + prevRgVal.waveSplit.get(wave)!.p * correctWidthToDistribute
          + fakePAndC.layout.responseGap
        )
        .reduce((acc, curr) => acc + curr, 0)
      const correctTopLeftY = fakePAndC.layout.labelHeight + (fakePAndC.layout.waveHeight + fakePAndC.layout.labelHeight) * waveIdx
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const correctWidth = 2 * fakePAndC.layout.pointRadius + fakePAndC.pAndC.principle1.expanded.get(rg)!.waveSplit.get(wave)!.p * correctWidthToDistribute
      const correctHeight = fakePAndC.layout.waveHeight
      return ({
        rg: rg,
        wave: wave,
        coordinates: {
          topLeftX: waveVal.coordinates.topLeftX,
          topLeftY: waveVal.coordinates.topLeftY,
          width: waveVal.coordinates.width,
          height: waveVal.coordinates.height
        },
        correctCoordinates: {
          topLeftX: correctTopLeftX,
          topLeftY: correctTopLeftY,
          width: correctWidth,
          height: correctHeight
        }
      })
    })
  }).flat(1)
  test.each(tableOfCoordinates)(
    'coordinates are correct at response group $rg and wave $wave',
    ({ rg, wave, coordinates, correctCoordinates }) => {
      if (coordinates !== null) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(coordinates?.topLeftX).toBeCloseTo(correctCoordinates!.topLeftX)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(coordinates?.topLeftY).toBeCloseTo(correctCoordinates!.topLeftY)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(coordinates?.width).toBeCloseTo(correctCoordinates!.width)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        expect(coordinates?.height).toBeCloseTo(correctCoordinates!.height)
      }
    }
  )
})