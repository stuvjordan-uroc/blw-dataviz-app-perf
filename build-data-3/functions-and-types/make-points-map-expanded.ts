import { all } from "arquero";
import type { SegmentViews, Point, PointsMap } from "./types.ts";

export function setUnsplitPoints(
  pointsMap: PointsMap,
  segmentViews: SegmentViews
) {
  const allPoints = segmentViews.unsplit.allPoints;
  pointsMap.entries().forEach(([rg, rgVal]) => {
    rgVal
      .entries()
      .filter(([wave, waveVal]) => waveVal !== null)
      .forEach(([wave, waveVal]) => {
        waveVal?.entries().forEach(([pg, pgVal]) => {
          const spliceSize = pgVal.count;
          if (typeof spliceSize !== "number") {
            throw new Error(
              `You passed a pointsMap to setUnsplitPoints that does not have count property set to a number at response group [${rg.toString()}], wave ${wave.toString(10)}, party group [${pg.toString()}]`
            );
          }
          if (isNaN(spliceSize)) {
            throw new Error(
              `You passed a pointsMap to setUnsplitPoints that has a count of NaN at response group [${rg.toString()}], wave ${wave.toString(10)}, party group [${pg.toString()}]`
            );
          }
          if (spliceSize < 0) {
            throw new Error(
              `You passed a pointsMap to setUnsplitPoints that has a negative count at response group [${rg.toString()}], wave ${wave.toString(10)}, party group [${pg.toString()}]`
            );
          }
          const pointSlice = allPoints.splice(0, spliceSize);
          if (pointSlice.length < spliceSize) {
            throw new Error(
              `The segmentViews object you passed to setUnsplitPoints map does not have enough points in it's unpslit segment to fill out the pointsMap you passed.`
            );
          }
          pgVal.points.unsplit = pointSlice;
        });
      });
  });
}

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
        //at that party group for the byResponseAndParty view at rg,pg
        const segmentsByResponseAndPartyAtRg = segmentViews.expanded.byResponseAndParty.get(rg)
        let allPointsMapByResponseAndPartyAtRg = undefined as undefined | Map<string[],Point[]>
        if (segmentsByResponseAndPartyAtRg) {
          allPointsMapByResponseAndPartyAtRg = new Map(
            segmentsByResponseAndPartyAtRg.entries().map(([pg,pgVal]) => ([
              pg,
              pgVal.allPoints
            ])) 
          ) as Map<string[],Point[]>
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
                    let allPointsByResponseAndPartyAtRgAndPg = undefined;
                    if (allPointsMapByResponseAndPartyAtRg) {
                      allPointsByResponseAndPartyAtRgAndPg = allPointsMapByResponseAndPartyAtRg.get(pg)
                    }
                    if (allPointsByResponseAndPartyAtRgAndPg) {

                    }
                    return [
                      pg,
                      {
                        byResponse: allPointsByResponseAtRg
                          ? allPointsByResponseAtRg.splice(0, pgVal.count)
                          : ([] as Point[]),
                        byResponseAndParty: allPointsMapByResponseAndPartyAtRg ? ,
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
