/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from "node:path";
import Data from "./functions/Data.ts";
import apartmentWindows from "./functions/apartment-windows.ts";
import { getProportions, unGroupedProportions } from "./functions/proportions.ts";
import ImpCoordinates from "./functions/Coordinates.ts";

export function makeImpSample(sampleSize: number, partyGroups: string[][]) {
  const rawDataPathString = path.resolve(
    "build-data",
    "raw-data/dem_characteristics_importance.gz"
  );
  const data = new Data(rawDataPathString);
  const SAMPLESIZE = sampleSize;
  //get array of non-empty values of the wave column
  const nonEmptyWaveValues = data.nonemptyWaveValues;
  //get imp columns
  const impColumns = data.impCols;
  //get nonempty imp values
  const nonEmptyImpResponses = data.nonemptyImpResponses;
  //array of party values for sample
  const partyValues = partyGroups;
  //construct the sample
  const outSample = Object.fromEntries(
    impColumns.map((impCol) => [
      impCol.colName,
      Object.fromEntries(
        nonEmptyWaveValues.map((waveValue) => [Data.waveString(waveValue), []])
      ),
    ])
  ) as Record<string, Record<string, Record<string, unknown>[]>>;
  impColumns.forEach((impCol) => {
    nonEmptyWaveValues.forEach((waveNum) => {
      partyValues.forEach((partiesArray) => {
        //console.log("building sample for", impCol.colName, waveNum, partiesArray);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        outSample[impCol.colName]![Data.waveString(waveNum)]!.splice(
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          outSample[impCol.colName]![Data.waveString(waveNum)]!.length - 1,
          0,
          ...data.sample(
            impCol.colIdx,
            nonEmptyImpResponses,
            waveNum,
            partiesArray,
            SAMPLESIZE
          )
        );
      });
    });
  });

  //now assign the coordinates
  const ORDEREDRESPONSES_EXPANDED = [['Not relevant'], ['Beneficial'], ['Important'], ['Essential']]
  const ORDEREDRESPONSES_COLLAPSED = [['Not relevant', 'Beneficial'], ['Important', 'Essential']]
  const PARTYGROUPS = [['Democrat'], ['Independent', 'Other'], ['Republican']];
  const SEGMENTGAP = 10;
  const ROWGAP = 20; //gap between rows when we have one row for each party
  const ROWHEIGHT = 30;
  const VIZWIDTH = 100;
  const coordinateMaker = new ImpCoordinates(
    ORDEREDRESPONSES_EXPANDED,
    ORDEREDRESPONSES_COLLAPSED,
    PARTYGROUPS,
    SEGMENTGAP,
    ROWGAP,
    ROWHEIGHT,
    VIZWIDTH
  )
  //UNSPLIT VIEW
  //in this view, all waves and party ids are combined into a single rectangle.
  coordinateMaker.addUnsplit(outSample)

  //BY RESPONSE 
  //in this view, we take all sampled persons from each imp item (regardless of pid3), and group
  //them by response into horizontal segments, with separate coordinates for each of the collapsed and expanded views
  //the lengths of the segment for a given response depends on the proportions of the group giving
  //that response.
  coordinateMaker.addByResponse(outSample)

  //BY RESPONSE AND PARTY
  /*
  in this view, we take all sampled persons from each imp item and create three rows
  of horizontal segments -- one row for Dems, one row for Inds+Others, one row for Reps.
  Obviously, each of these rows is segmented by response 
  */

  //TODO...
  /*
  after all the views are built, pass through the sample to...
  1. Set the radius on every point to the minimum of the radius for the view
  that point belongs to.
  2. Create an additional object that stores the point radius for each view
  3. Remove the radius property from every point.

  Then, change the return statement below so it returns BOTH the sample 
  (with the radius properties removed from all the points) AND the radius object
  created in 2.
  */


  return outSample;
}

