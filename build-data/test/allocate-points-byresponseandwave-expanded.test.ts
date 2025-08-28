import { describe, test, expect } from "@jest/globals";
import { allocatePointsByResponseAndWaveExpanded } from "../functions-and-types/points-map/allocate-points-byresponseandwave.ts";
import fakeSegmentMaps from "./fake-segment-maps.ts";
import makeEmptyPointsMap from "../functions-and-types/points-map/make-empty-points-map.ts";
const pointsMap = makeEmptyPointsMap(fakeSegmentMaps.segmentsRWP);

allocatePointsByResponseAndWaveExpanded(
  fakeSegmentMaps.segmentsRW,
  fakeSegmentMaps.segmentsRWP,
  pointsMap
);
describe("The view in the pointsMap populated by allocatePointsByResponseAndWaveExpanded...", () => {
  //assigns a position for every point that needs one.
  const tableOfCounts = pointsMap
    .entries()
    .toArray()
    .map(([rg, rgVal]) =>
      rgVal
        .entries()
        .filter(([wave, waveVal]) => waveVal !== null)
        .toArray()
        .map(([wave, waveVal]) =>
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          waveVal!
            .entries()
            .toArray()
            .map(([pg, pgVal]) => ({
              rg: rg,
              wave: wave,
              pg: pg,
              numPoints: pgVal.expanded.byResponseAndWave.length, //total number of positions assigned
              correctNumPoints: fakeSegmentMaps.segmentsRWP //total number of positions that need to be assigned
                .get(rg)
                ?.get(wave)
                ?.get(pg)?.count,
            }))
        )
    )
    .flat(2);
  test.each(tableOfCounts)(
    "provides a position for each point ",
    ({ rg, wave, pg, numPoints, correctNumPoints }) => {
      expect(numPoints).toBe(correctNumPoints);
    }
  );
  //Take the segmentMapRW used to assign point positions.
  //At each rg-wave where the wave is not null in that segmentMapRW, get the count.
  //Call that the inputAggregatedCount.  It is the number of positions at the rg-wave in the byResponseAndWave view.
  //Check that that number of positions
  //matches the number of positions points allocated in the pointsMap at that rg-wave.
  const tableOfAggregatedCounts = fakeSegmentMaps.segmentsRW
    .entries()
    .toArray()
    .map(([rg, rgVal]) =>
      rgVal
        .entries()
        .filter(([wave, waveVal]) => waveVal !== null)
        .toArray()
        .map(([wave, waveVal]) => {
          return {
            rg: rg,
            wave: wave,
            inputAggCount: waveVal?.count,
            pointsMapAggCount: pointsMap
              .get(rg)
              ?.get(wave)
              ?.values()
              .map((pgVal) => pgVal.expanded.byResponseAndWave.length)
              .reduce((acc, curr) => acc + curr, 0),
          };
        })
    )
    .flat(1);
  test.each(tableOfAggregatedCounts)(
    "Allocates points at $rg, $wave across the party groups that aggregate correctly up to the response-group-wave level.",
    ({ rg, wave, inputAggCount, pointsMapAggCount }) => {
      expect(pointsMapAggCount).toBe(inputAggCount);
    }
  );
});
