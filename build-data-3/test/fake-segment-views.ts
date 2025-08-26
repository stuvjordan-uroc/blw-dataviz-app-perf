import type { Segment, SegmentGroupedViews } from "../functions-and-types/types.ts"

export const fakeSegmentViews = {
  unsplit: {
    count: 100,
    segmentCoordinates: {
      topLeftX: 0,
      topLeftY: 0,
      width: 2,
      height: 200
    }, //segment is 2 units wide and 200 units high
    //divded it into a single column of 100 rows
    //so each cell is 2 units wide and 2 units high
    allPoints: new Array(100).fill(1).map((el, idx) => {
      return ({
        x: 0,
        y: 2 * idx,
        cx: 1,
        cy: 2 * idx + 1
      })
    })
  } as Segment,//top left x/y is at the top left corner of each cell,
  //cx and cy are 1 unit offset from top left corner
  collapsed: {} as SegmentGroupedViews,//SegmentGroupedViews
  expanded: {
    byResponse: new Map(
      [['response1'], ['response2']].map((rg, rgIdx) => ([
        rg,
        {
          count: 100,
          segmentCoordinates: {
            topLeftX: 100 * rgIdx,
            topLeftY: 0,
            width: 2,
            height: 100
          },
          allPoints: new Array(100).map((el, idx) => {
            return ({
              x: 100 * rgIdx,
              y: 2 * idx,
              cx: 100 * rgIdx + 1,
              cy: 2 * idx + 1
            })
          })
        }
      ]))
    ),
    byResponseAndParty: new Map(
      [['response1'], ['response2']].map((rg, rgIdx) => ([
        rg,
        new Map(
          [['pg1'], ['pg2']].map((pg, pgIdx) => ([
            pg,
            {
              count: 100,
              segmentCoordinates: {
                topLeftX: 100 * rgIdx + 100 * pgIdx,
                topLeftY: 0,
                width: 2,
                height: 100
              },
              allPoints: new Array(100).map((el, idx) => ({
                x: 100 * rgIdx + 100 * pgIdx,
                y: 2 * idx,
                cx: 100 * rgIdx + 100 * pgIdx + 1,
                cy: 2 * idx + 1
              }))
            }
          ]))
        )
      ]))
    ),
    byResponseAndWave: new Map(
      [['response1'], ['response2']].map((rg, rgIdx) => ([
        rg,
        new Map(
          [1, 2, 3].map((wave, waveIdx) => ([
            wave,
            wave === 2 ? null : {
              count: 100,
              segmentCoordinates: {
                topLeftX: 100 * rgIdx,
                topLeftY: 100 * waveIdx,
                width: 2,
                height: 200
              },
              allPoints: new Array(100).map((el, pIdx) => ({
                x: 100 * rgIdx,
                y: 100 * waveIdx + 2 * pIdx,
                cx: 100 * rgIdx + 1,
                cy: 100 * waveIdx + 2 * pIdx + 1
              }))
            }
          ]))
        )
      ]))
    ),
    byResponseAndWaveAndParty: new Map(
      [['response1'], ['response2']].map((rg, rgIdx) => ([
        rg,
        new Map(
          [1, 2, 3].map((wave, waveIdx) => ([
            wave,
            wave === 2 ? null : new Map(
              [['pg1'], ['pg2']].map((pg, pgIdx) => ([
                pg,
                {
                  count: 100,
                  segmentCoordinates: {
                    topLeftX: 100 * pgIdx + 100 * rgIdx,
                    topLeftY: 100 * waveIdx,
                    width: 2,
                    height: 200
                  },
                  allPoints: new Array(100).map((p, pIdx) => ({
                    x: 100 * pgIdx + 100 * rgIdx,
                    y: 100 * waveIdx + 2 * pIdx,
                    cx: 100 * pgIdx + 100 * rgIdx + 1,
                    cy: 100 * waveIdx + 2 * pIdx + 1
                  }))
                }
              ]))
            )
          ]))
        )
      ]))
    )
  } as SegmentGroupedViews
}