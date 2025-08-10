/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from "node:path";
import Data from "./functions/Data.ts";
import ImpCoordinates from "./functions/NewCoordinates.ts";
import type { Config, Sample, ScreenSize } from "./functions/types.ts"



const config: Config = {
  sampleSize: 100, //so total of 1200 per imp-question
  responsesExpanded: [
    ["Not relevant"],
    ["Beneficial"],
    ["Important"],
    ["Essential"],
  ],
  responsesCollapsed: [
    ["Not relevant", "Beneficial"],
    ["Important", "Essential"]
  ],
  partyGroups: [['Democrat'], ['Independent', 'Other'], ['Republican']],
  small: {
    screenWidthRange: [0, 768],
    vizWidth: 360,
    A: 16 / 9,
    pointRadius: 3,
    segmentGap: (3 / 2) * 3,
    rowGap: (3 / 2) * (3 / 2) * 3,
    labelHeightTop: 30,
    labelHeightBottom: 30
  },
  medium: {
    screenWidthRange: [768, 1024],
    vizWidth: 760,
    A: 16 / 9,
    pointRadius: 4,
    segmentGap: (3 / 2) * 3,
    rowGap: (3 / 2) * (3 / 2) * 3,
    labelHeightTop: 30,
    labelHeightBottom: 30
  },
  large: {
    screenWidthRange: [1024, 1200],
    vizWidth: 1020,
    A: 16 / 9,
    pointRadius: 4,
    segmentGap: (3 / 2) * 3,
    rowGap: (3 / 2) * (3 / 2) * 3,
    labelHeightTop: 30,
    labelHeightBottom: 30
  },
  xLarge: {
    screenWidthRange: [1200, Infinity],
    vizWidth: 1180,
    A: 16 / 9,
    pointRadius: 4,
    segmentGap: (3 / 2) * 3,
    rowGap: (3 / 2) * (3 / 2) * 3,
    labelHeightTop: 30,
    labelHeightBottom: 30
  },
}




export function makeImpSample(screenSize: ScreenSize) {
  const rawDataPathString = path.resolve(
    "build-data",
    "raw-data/dem_characteristics_importance.gz"
  );
  const data = new Data(rawDataPathString);
  //get array of non-empty values of the wave column
  const nonEmptyWaveValues = data.nonemptyWaveValues;
  //get imp columns
  const impColumns = data.impCols;
  //get nonempty imp values
  const nonEmptyImpResponses = data.nonemptyImpResponses;
  //array of party values for sample
  const partyValues = config.partyGroups;
  //construct the sample
  const outSample = Object.fromEntries(
    impColumns.map((impCol) => [
      impCol.colName,
      Object.fromEntries(
        nonEmptyWaveValues.map((waveValue) => [Data.waveString(waveValue), []])
      ),
    ])
  ) as Sample;
  //outSample as constructed on the previous lines has empty arrays of responses
  //So now sample points from the data to fill in those arrays
  impColumns.forEach((impCol) => {
    nonEmptyWaveValues.forEach((waveNum) => {
      partyValues.forEach((partiesArray) => {
        outSample[impCol.colName]![Data.waveString(waveNum)]!
          .splice(
            outSample[impCol.colName]![Data.waveString(waveNum)]!.length - 1,
            0,
            ...data.sample(
              impCol.colIdx,
              nonEmptyImpResponses,
              waveNum,
              partiesArray,
              config.sampleSize
            )
          );
      });
    });
  });

  //now assign the coordinates

  const coordinateMaker = new ImpCoordinates(config, screenSize);
  //UNSPLIT VIEW
  //in this view, all waves and party ids are combined into a single rectangle.
  coordinateMaker.addUnsplit(outSample);

  //BY RESPONSE
  //In this view, there is a single horizontal row of segments, with one segment for each
  // response, with one for for the responses collapsed, and one view for the responses expanded 
  //The lengths of the segment for a given response depends on the proportions of the group giving
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
  //coordinateMaker.addByResponseAndWave(outSample);

  //BY RESPONSE AND WAVE AND PARTY
  /*
  All sampled persons from each imp item...
  Three rows of segments -- laid out side-by-side -- for each party group...
  One of these rows of segments for each wave, laid out vertically
  total heigh of this viz is expanded from ROWHEIGHT to
  ROWHEIGHT * (number of waves) + WAVEVIZGAP * (number of waves - 1)
  */

  //coordinateMaker.addByResponseAndWaveAndParty(outSample);

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
