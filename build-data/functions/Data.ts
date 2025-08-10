import fs from "node:fs";
import { decompressSync, strFromU8 } from "fflate";
import type { RawData, Point } from "./types.ts";
import lodash from "lodash";
function getNonEmptyVals(
  columnNameStrings: string[],
  allColumnNames: string[],
  data: (string | number | null)[][],
  emptyValues: (string | number | null | undefined)[]
) {
  const colIndices = columnNameStrings.map((nameString) =>
    allColumnNames.findIndex((col) => col === nameString)
  );
  if (colIndices.includes(-1)) {
    console.log(
      `WARNING: build-data could not find one or more of the following columns in the raw data:`,
      columnNameStrings
    );
  }
  const allValues = lodash.uniq(
    colIndices
      .map((colIndex) => lodash.uniq(data.map((row) => row[colIndex]))) //returns and array of arrays.  Each array is the unique array of values in one of the colIndices columns
      .flat(Infinity) //now it's flattend to just be an array of values
  ) as (string | number | null | undefined)[]; //now it's the uniq values entirely
  return allValues.filter((value) => !emptyValues.includes(value)) as (
    | string
    | number
  )[];
}
export default class Data {
  //declare members
  columns = [] as string[];
  data = [] as (string | number | null)[][];
  emptyValues = [NaN, "", null, undefined];
  utilityColumnNames = ["wave", "weight", "pid3"];
  utilityColumns = Object.fromEntries(
    this.utilityColumnNames.map((colName) => [colName, null])
  ) as Record<string, number | null>;
  impCols = [] as { colName: string; colIdx: number }[];
  nonemptyWaveValues = [] as number[];
  nonemptyImpResponses = [] as string[];
  //static
  static waveString(waveNum: number) {
    return "w" + waveNum.toString().padStart(2, "0");
  }
  //constructor
  constructor(filePathString: string) {
    //read raw data from passed file path string
    const rawData = JSON.parse(
      strFromU8(decompressSync(fs.readFileSync(filePathString)))
    ) as RawData;
    //array of column names in this.columns
    this.columns = rawData.columns;
    //array of data rows in this.data
    this.data = rawData.data;
    //initialize this.utilityColumns using default utility column names ['wave', 'weight', 'pid3']
    this.utilityColumns = Object.fromEntries(
      this.utilityColumnNames
        .map((cn) => [cn, this.columns.findIndex((c) => c === cn)])
        .map((el) => [el[0], el[1] === -1 ? null : el[1]])
    ) as Record<string, number | null>;
    //warn if any of the default utility column names cannot be found
    Object.keys(this.utilityColumns).forEach((ucKey) => {
      if (lodash.isNull(this.utilityColumns[ucKey])) {
        console.log(
          "WARNING: The following column is not in the raw data: ",
          ucKey
        );
      }
    });
    //initialize the impCols
    this.impCols = this.columns
      .map((col, idx) => ({
        colName: col,
        colIdx: idx,
      }))
      .filter((col) => col.colName.startsWith("imp_"));
    //warn if there aren't enough impCols
    if (this.impCols.length <= 27) {
      console.log(
        `WARNING: Build data search for columns starting with imp_ and only found ${this.impCols.length.toString()} columns.`
      );
    }
    //initialize the nonempty wave values
    this.nonemptyWaveValues = getNonEmptyVals(
      ["wave"],
      this.columns,
      this.data,
      this.emptyValues
    ) as number[];
    //warn if there are not enough waves
    if (this.nonemptyWaveValues.length < 2) {
      console.log(
        `WARNING: There are only ${this.nonemptyWaveValues.length.toString()} non-empty wave values`
      );
    }
    this.nonemptyImpResponses = getNonEmptyVals(
      this.impCols.map((col) => col.colName),
      this.columns,
      this.data,
      this.emptyValues
    ) as string[];
    if (this.nonemptyImpResponses.length !== 4) {
      console.log(
        `WARNING: There should be 4 nonempty imp responses, but we only found `,
        this.nonemptyImpResponses.length
      );
    }
  }
  sample(
    impVarColIndex: number,
    nonEmptyImpResponses: string[],
    wave: number,
    pids: string[],
    sampleSize: number
  ) {
    const waveColumnNumber = this.utilityColumns.wave;
    const pidColumnNumber = this.utilityColumns.pid3;
    const weightColumnNumber = this.utilityColumns.weight;
    if (waveColumnNumber && pidColumnNumber && weightColumnNumber) {
      //subset the data
      const subset = this.data
        .filter((row) => {
          //select rows from the requested wave
          const rowWaveValue = row[waveColumnNumber];
          return rowWaveValue && rowWaveValue === wave;
        })
        .filter((row) => {
          //select rows non-empty on requested impvar
          const rowImpValue = row[impVarColIndex] as string;
          return rowImpValue && nonEmptyImpResponses.includes(rowImpValue);
        })
        .filter((row) => {
          //select rows from the requested pid
          const rowPidResponse = row[pidColumnNumber];
          return (
            rowPidResponse &&
            typeof rowPidResponse === "string" &&
            pids.includes(rowPidResponse)
          );
        })
        .filter((row) => {
          //weight column index exists
          const weightValue = row[weightColumnNumber];
          return !lodash.isUndefined(weightValue);
        });
      //create the cumulative weights array
      const cumulativeWeights = [] as number[];
      subset.forEach((row, rowIdx) => {
        const cumWeightSoFar = cumulativeWeights[rowIdx - 1];
        const currentRowWeight = row[weightColumnNumber] as number;
        if (cumWeightSoFar && typeof cumWeightSoFar === "number") {
          cumulativeWeights.push(cumWeightSoFar + currentRowWeight);
        } else {
          cumulativeWeights.push(currentRowWeight);
        }
      });
      //construct the sample
      const sample = [] as Partial<Point>[];
      // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
      const weightsTotal = cumulativeWeights[
        cumulativeWeights.length - 1
      ] as number;
      for (let sampleRowIdx = 0; sampleRowIdx < sampleSize; sampleRowIdx++) {
        const randomThreshold = Math.random() * weightsTotal;
        const firstMatchIdx = cumulativeWeights.findIndex(
          (cw) => cw >= randomThreshold
        );
        const selectedRow = subset[firstMatchIdx];
        if (selectedRow) {
          sample.push({
            response: selectedRow[impVarColIndex] as string,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            pid3: selectedRow[this.utilityColumns.pid3!] as string
          });
        }
      }
      if (sample.length === sampleSize) {
        return sample;
      } else {
        return [];
      }
    } else {
      return [];
    }
  }
}
