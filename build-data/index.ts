/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from "node:path";
import Data from "./functions/Data.ts";
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
  const ORDEREDRESPONSES_EXPANDED = [
    ["Not relevant"],
    ["Beneficial"],
    ["Important"],
    ["Essential"],
  ];
  const ORDEREDRESPONSES_COLLAPSED = [
    ["Not relevant", "Beneficial"],
    ["Important", "Essential"],
  ];
  const PARTYGROUPS = [["Democrat"], ["Independent", "Other"], ["Republican"]];
  const VIZWIDTH = 100;
  const PARTYROWGAP = 5; //in the split-by-party views, this leaves 90% of the space for rows of segments split by party
  const SEGMENTGAP = 1; //with VIZWIDTH = 100 and ROWGAP = 5, each party's row is 30 units long.  So setting SEGMENTGAP to 1 leaves 90% of space in expanded view for segments.
  const ROWHEIGHT = 30;
  const WAVEVIZGAP = 5;

  const coordinateMaker = new ImpCoordinates(
    ORDEREDRESPONSES_EXPANDED,
    ORDEREDRESPONSES_COLLAPSED,
    PARTYGROUPS,
    SEGMENTGAP,
    PARTYROWGAP,
    WAVEVIZGAP,
    ROWHEIGHT,
    VIZWIDTH
  );
  //UNSPLIT VIEW
  //in this view, all waves and party ids are combined into a single rectangle.
  coordinateMaker.addUnsplit(outSample);

  //BY RESPONSE
  //in this view, we take all sampled persons from each imp item (regardless of pid3), and group
  //them by response into horizontal segments, with separate coordinates for each of the collapsed and expanded views
  //the lengths of the segment for a given response depends on the proportions of the group giving
  //that response.
  coordinateMaker.addByResponse(outSample);

  //BY RESPONSE AND PARTY
  /*
  in this view, we take all sampled persons from each imp item and create three rows
  of horizontal segments -- one row for Dems, one row for Inds+Others, one row for Reps.
  These rows are laid out side-by-side, so total vizHeight is just ROWHEIGHT.
  Each of these rows is segmented by response.
  */
  coordinateMaker.addByResponseAndParty(outSample);

  //BY RESPONSE AND WAVE
  /*
  This view takes all sampled persons from each imp item, and creates on row of
  segments for each wave, segmented by response.
  These rows are laid out vertically.  Each has height ROWHEIGHT, and there is a 
  gap between each row of WAVEVIZGAP.
  So total heigh of this viz is expanded from ROWHEIGHT to
  ROWHEIGHT * (number of waves) + WAVEVIZGAP * (number of waves - 1)
  */
  coordinateMaker.addByResponseAndWave(outSample);

  //BY RESPONSE AND WAVE AND PARTY
  /*
  All sampled persons from each imp item...
  Three rows of segments -- laid out side-by-side -- for each party group...
  One of these rows of segments for each wave, laid out vertically
  total heigh of this viz is expanded from ROWHEIGHT to
  ROWHEIGHT * (number of waves) + WAVEVIZGAP * (number of waves - 1)
  */

  coordinateMaker.addByResponseAndWaveAndParty(outSample);

  //TODO...
  /*
  after all the views are built, pass through the sample to...
  1. Set the radius on every point to the minimum of the radius for the view
  that point belongs to.
  2. Create an additional object that stores the point radius for each view
  3. Remove the radius property from every point.

  Then, change the return statement below so it returns BOTH the sample 
  (with the radius properties removed from all the points) AND an object that gives 
  (1) the radius for each view and (2) the total viz height for each view.
  Clearly, this object will have a property for each view.
  */

  //TODO...
  /*
  After all the samples are built, scale everything up so that radii come out to
  values that are order-of-magnitude 10 or more, then 
  round off all coordinates to whole numbers s(sub-pixel units slows browser performance)
  */

  return outSample;
}
