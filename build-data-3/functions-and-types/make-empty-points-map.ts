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
                    .keys()
                    .map((pg) => ([
                      pg,
                      {
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
                    ]))
                )
            ]))
        )
      ]))
  )
}