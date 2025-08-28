import type { SegmentMapRWP, SegmentMapR, Segment, SegmentMapRP, SegmentMapRW } from "../functions-and-types/types.ts";

const fakeRgs = [['rg1'], ['rg2']];
const fakeWaves = [1, 2, 3];
const fakePgs = [['pg1'], ['pg2']];
const fakeSampleSize = 100;


const segmentsRWP: SegmentMapRWP = new Map(
  fakeRgs.map((rg, rgIdx) => ([
    rg,
    new Map(
      fakeWaves.map((wave, waveIdx) => ([
        wave,
        wave === 2 ? null : new Map(
          fakePgs.map((pg, pgIdx) => ([
            pg,
            {
              count: fakeSampleSize,
              segmentCoordinates: {
                topLeftX: 100 * pgIdx + 25 * rgIdx,
                topLeftY: 100 * waveIdx,
                width: 20,
                height: 90
              },
              allPoints: new Array(fakeSampleSize).fill(1).map((p, pidx) => ({
                x: 100 * pgIdx + 25 * rgIdx,
                y: 100 * waveIdx + pidx,
                cx: 100 * pgIdx + 25 * rgIdx + 1,
                cy: 100 * waveIdx + pidx + 1
              }))
            }
          ]))
        )
      ]))
    )
  ]))
)

const allPoints = segmentsRWP.values().toArray().map((rgVal) =>
  rgVal.values().filter(waveVal => waveVal !== null).toArray().map(waveVal =>
    waveVal.values().toArray().map(pgVal =>
      pgVal.allPoints
    )
  )
).flat(3)

const segmentsR: SegmentMapR = new Map(
  segmentsRWP.entries().map(([rg, rgVal]) => {
    const countAtRg = rgVal.values().filter(waveVal => waveVal !== null)
      .map((waveVal) =>
        waveVal.values()
          .map((pgVal) =>
            pgVal.count
          )
          .reduce((acc, curr) => acc + curr, 0)
      )
      .reduce((acc, curr) => acc + curr, 0)
    const allPointsAtRg = rgVal.values().filter(waveVal => waveVal !== null)
      .toArray()
      .map((waveVal) =>
        waveVal.values()
          .toArray()
          .map((pgVal) =>
            pgVal.allPoints
          )
      ).flat(2)
    return ([
      rg,
      {
        count: countAtRg,
        allPoints: allPointsAtRg,
        segmentCoordinates: {
          topLeftX: 0,
          topLeftY: 0,
          width: 0,
          height: 0
        }
      } as Segment
    ])
  })
)

const segmentsRP = new Map(
  segmentsRWP.entries().map(([rg, rgVal]) => ([
    rg,
    new Map(
      fakePgs.map((pg) => {
        const countAtRP = rgVal.values()
          .filter(waveVal => waveVal !== null)
          .map(waveVal =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            waveVal.get(pg)!.count
          )
          .reduce((acc, curr) => acc + curr, 0)
        const allPointsAtRP = rgVal.values()
          .filter(waveVal => waveVal !== null)
          .toArray()
          .map(waveVal =>
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            waveVal.get(pg)!.allPoints
          ).flat(1)
        return ([
          pg,
          {
            count: countAtRP,
            segmentCoordinates: {
              topLeftX: 0,
              topLeftY: 0,
              width: 0,
              height: 0
            },
            allPoints: allPointsAtRP
          }
        ])
      })
    )
  ]))
)



const segmentsRW: SegmentMapRW = new Map(
  segmentsRWP.entries().map(([rg, rgVal]) => ([
    rg,
    new Map(
      rgVal.entries().map(([wave, waveVal]) => {
        if (waveVal === null) {
          return ([wave, null])
        }
        const countAtRW = waveVal
          .values()
          .map((pgVal) => pgVal.count)
          .reduce((acc, curr) => acc + curr, 0)
        const allPointsAtRW = waveVal
          .values()
          .toArray()
          .map((pgVal) => pgVal.allPoints)
          .flat(1)
        return ([
          wave,
          {
            count: countAtRW,
            segmentCoordinates: {
              topLeftX: 0,
              topLeftY: 0,
              width: 0,
              height: 0
            },
            allPoints: allPointsAtRW
          }
        ])
      })
    )
  ]))
)

export default {
  segmentsRWP: segmentsRWP,
  allPoints: allPoints,
  segmentsR: segmentsR,
  segmentsRP: segmentsRP,
  segmentsRW: segmentsRW
}
