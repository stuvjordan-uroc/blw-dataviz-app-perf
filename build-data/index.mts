import path from "node:path";
import Data from "./functions/Data.ts";

const rawDataPathString = path.resolve(
  "build-data",
  "raw-data/dem_characteristics_importance.gz"
);

const data = new Data(rawDataPathString);
//previous line automatially sets utility columns to ['wave', 'weight', 'pid3'].
//to set different utility columns, call data.setUtilityColumns(['othercol','anothercol','yetanothercol'])
const SAMPLESIZE = 1000;
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
console.log(outSample);
impColumns.forEach((impCol) => {
  nonEmptyWaveValues.forEach((waveNum) => {
    partyValues.forEach((partiesArray) => {
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
//outSample now has an empty array for each imp variable and each wave value.
//so fill in the samples
// impColumns.forEach((impCol) => {
//   nonEmptyWaveValues.forEach((waveValue) => {
//     //check if the current imp var has non-empty responses in the current wave
//     const universe = data.data
//       .filter((row) => {
//         //filter to wave value is waveValue
//         const waveColumn = data.utilityColumns.wave;
//         if (waveColumn) {
//           const rowWaveValue = row[waveColumn] as number;
//           return rowWaveValue && rowWaveValue === waveValue;
//         } else {
//           return false;
//         }
//       })
//       .filter((row) => {
//         //filter to non-empty imp values
//         const impValue = row[impCol.colIdx] as string | undefined;
//         return impValue && nonEmptyImpResponses.includes(impValue);
//       });
//     if (universe.length > 0) {
//       //if there are no non-empty imp responses, leave the sample null here
//       const refToImpInSample = outSample[impCol.colName];
//       if (refToImpInSample) {
//         const refToWaveInSample =
//           refToImpInSample["w" + waveValue.toString().padStart(2, "0")];
//         if (refToWaveInSample) {
//           partyValues.forEach((arrayOfParties) => {
//             refToWaveInSample.concat(
//               data.sample(
//                 impCol.colIdx,
//                 nonEmptyImpResponses,
//                 waveValue,
//                 arrayOfParties,
//                 SAMPLESIZE
//               )
//             );
//           });
//         }
//       }
//     }
//   });
// });
// //outsample is now constructed.
// //let's console log to see if it worked
// console.log(
//   "outsample has collections of samples for this many imp variables: ",
//   Object.keys(outSample).length
// );
// console.log("at imp_misconduct, here are the sample sizes for each wave:");
// nonEmptyWaveValues.forEach((waveVal) => {
//   // eslint-disable-next-line @typescript-eslint/dot-notation
//   const refToImpInSample = outSample["imp_misconduct"];
//   if (refToImpInSample) {
//     const refToWaveInSample =
//       refToImpInSample["w" + waveVal.toString().padStart(2, "0")];
//     if (refToWaveInSample) {
//       console.log(
//         `Number of rows in sample at imp_misconduct at ${"w" + waveVal.toString().padStart(2, "0")} is:`
//       );
//       console.log(refToWaveInSample.length);
//     } else {
//       console.log(
//         `Something failed.  Out sample at imp_misconduct has no key ${"w" + waveVal.toString().padStart(2, "0")}`
//       );
//     }
//   } else {
//     console.log(
//       "Something failed.  Out sample has no top level key imp_misconduct"
//     );
//   }
// });
