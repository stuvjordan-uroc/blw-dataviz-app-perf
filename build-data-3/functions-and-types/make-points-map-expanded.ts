import type { SegmentViews, Point, PointsMap } from "./types.ts";



export function makePointsMapExpanded(segmentViews: SegmentViews) {
  const allPointsMapByResponse = segmentViews.expanded.byResponse;
  const allPointsMapByResponseAndWave = segmentViews.expanded.byResponseAndWave;
  const out = new Map(
    segmentViews.expanded.byResponseAndWaveAndParty
      .entries()
      .map(([rg, rgVal]) => {
        const allPointsByResponseAtRg =
          allPointsMapByResponse.get(rg)?.allPoints;
        //make a map that takes each party group to an array of all the points needed 
        //at that party group and the current rg for the byResponseAndParty view
        const segmentsByResponseAndPartyAtRg = segmentViews.expanded.byResponseAndParty.get(rg)
        let allPointsMapByResponseAndPartyAtRg = undefined as undefined | Map<string[], Point[]>
        if (segmentsByResponseAndPartyAtRg) {
          allPointsMapByResponseAndPartyAtRg = new Map(
            segmentsByResponseAndPartyAtRg.entries().map(([pg, pgVal]) => ([
              pg,
              pgVal.allPoints
            ]))
          ) as Map<string[], Point[]>
        }
        return [
          rg,
          new Map(
            rgVal.entries().map(([wave, waveVal]) => {
              if (waveVal === null) {
                return [wave, null];
              }
              const allPointsByResponseAndWaveAtRgAndWave =
                allPointsMapByResponseAndWave.get(rg)?.get(wave)?.allPoints;
              return [
                wave,
                new Map(
                  waveVal.entries().map(([pg, pgVal]) => {
                    const allPointsByResponseAndPartyAtRgAndPg = allPointsMapByResponseAndPartyAtRg ? allPointsMapByResponseAndPartyAtRg.get(pg) : [] as Point[]
                    const nextByResponseAndPartySlice = allPointsByResponseAndPartyAtRgAndPg ? allPointsByResponseAndPartyAtRgAndPg.splice(0, pgVal.count) : [] as Point[]
                    return [
                      pg,
                      {
                        byResponse: allPointsByResponseAtRg
                          ? allPointsByResponseAtRg.splice(0, pgVal.count)
                          : ([] as Point[]),
                        byResponseAndParty: nextByResponseAndPartySlice,
                        byResponseAndWave: allPointsByResponseAndWaveAtRgAndWave
                          ? allPointsByResponseAndWaveAtRgAndWave.splice(
                            0,
                            pgVal.count
                          )
                          : ([] as Point[]),
                        byResponseAndWaveAndParty: pgVal.allPoints,
                      },
                    ];
                  })
                ),
              ];
            })
          ),
        ];
      })
  );
}
