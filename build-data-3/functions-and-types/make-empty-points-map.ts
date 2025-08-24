import type { Point, PAndC } from "./types.ts";

export default function makeEmptyPointsMap(pAndC: PAndC) {
  return new Map(
    pAndC.expanded
      .entries()
      .map(([rg, rgVal]) => ([
        rg,
        new Map(
          rgVal.waveSplit
            .entries()
            .map(([wave, waveVal]) => ([
              wave,
              waveVal === null ? null :
                new Map(
                  waveVal.partySplit
                    .entries()
                    .map(([pg, pgVal]) => ([
                      pg,
                      {
                        count: pgVal.c,
                        points: {
                          unsplit: [] as Point[],
                          collapsed: {
                            byResponse: [] as Point[],
                            byResponseAndParty: [] as Point[],
                            byResponseAndWave: [] as Point[],
                            byResponseAndPartyAndWave: [] as Point[]
                          },
                          expanded: {
                            byResponse: [] as Point[],
                            byResponseAndParty: [] as Point[],
                            byResponseAndWave: [] as Point[],
                            byResponseAndPartyAndWave: [] as Point[]
                          }
                        }
                      }
                    ]))
                )
            ]))
        )
      ]))
  )
}