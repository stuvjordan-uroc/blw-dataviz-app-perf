import type { CountsMap, Point } from "./types.ts";

export default function makeEmptyPointsMap(countsMap: CountsMap) {
  return new Map(countsMap.entries().map(([wave, valAtWave]) => ([
    wave,
    valAtWave === null ? null :
      new Map(
        valAtWave.entries().map(([partyGroup, valAtPartyGroup]) => ([
          partyGroup,
          new Map(
            valAtPartyGroup.keys().map((responseGroup) => ([
              responseGroup,
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
  ])))
}