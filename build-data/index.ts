/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from "node:path";
import Data from "./functions/Data.ts";
import apartmentWindows from "./functions/apartment-windows.ts";
import { unGroupedProportions } from "./functions/proportions.ts";

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

  //now assign the locations
  const ORDEREDRESPONSESUNGROUPED = [['Not relevant'], ['Beneficial'], ['Important'], ['Essential']]
  const ORDEREDRESPONSESGROUPED = [['Not relevant', 'Beneficial'], ['Important', 'Essential']]
  //unsplit view
  Object.keys(outSample).forEach(impVarName => {
    //in this view, all waves and party ids are combined into a single rectangle.
    //compute total number of residents
    const totalResidents = Object.keys(outSample[impVarName]!)
      .map(waveString => outSample[impVarName]![waveString]!.length)
      .reduce((acc, curr) => acc + curr, 0)
    //get the radius and coordinates for each resident
    const heads = apartmentWindows(0, 0, 100, 30, totalResidents)
    //add the coordinates to the sampled points
    Object.keys(outSample[impVarName]!).forEach(waveString => {
      outSample[impVarName]![waveString]!.forEach((el, idx) => {
        outSample[impVarName]![waveString]![idx] = {
          ...outSample[impVarName]![waveString]![idx],
          unsplit: heads.shift()
        }
      })
    })
  })
  //by response
  //in this view, we take all sampled persons from each imp item (regardless of pid3), and group
  //them by response into horizontal segments.
  //the lengths of the segment for a given response depends on the proportions of the group giving
  //that response.
  //so the first step for each impvar is to compute the proportions.
  Object.keys(outSample).forEach(impVar => {
    //consolidate the sampled points across waves into a single array of points
    const singleArrayOfPoints = Object.values(outSample[impVar]!).flat().map(point => point.response) as string[]
    const propMap = unGroupedProportions(singleArrayOfPoints, ORDEREDRESPONSESUNGROUPED)
  })

  return outSample;
}

