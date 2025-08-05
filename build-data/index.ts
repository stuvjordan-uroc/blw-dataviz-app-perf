import path from "node:path";
import Data from "./functions/Data.ts";

const rawDataPathString = path.resolve(
  "build-data",
  "raw-data/dem_characteristics_importance.gz"
);

const data = new Data(rawDataPathString);
//previous line automatially sets utility columns to ['wave', 'weight', 'pid3'].
//to set different utility columns, call data.setUtilityColumns(['othercol','anothercol','yetanothercol'])
const SAMPLESIZE = 1;
//get array of non-empty values of the wave column
const nonEmptyWaveValues = data.nonemptyWaveValues;
//get imp columns
const impColumns = data.impCols;
//get nonempty imp values
const nonEmptyImpResponses = data.nonemptyImpResponses;
//array of party values for sample
const partyValues = [["Republican"], ["Democrat"], ["Independent", "Other"]];
//construct the sample
const outSample = Object.fromEntries(
  impColumns.map((impCol) => [
    impCol.colName,
    Object.fromEntries(
      nonEmptyWaveValues.map((waveValue) => [Data.waveString(waveValue), []])
    ),
  ])
) as Record<string, Record<string, (string | number | null)[][]>>;
impColumns.forEach((impCol) => {
  nonEmptyWaveValues.forEach((waveNum) => {
    partyValues.forEach((partiesArray) => {
      //console.log("building sample for", impCol.colName, waveNum, partiesArray);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      outSample[impCol.colName]![Data.waveString(waveNum)]!.concat(
        data.sample(
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
Object.keys(outSample).forEach((impvar) => {
  Object.keys(outSample[impvar] as object).forEach((waveString) => {
    console.log(impvar, waveString, outSample[impvar][waveString]?.length);
  });
});
