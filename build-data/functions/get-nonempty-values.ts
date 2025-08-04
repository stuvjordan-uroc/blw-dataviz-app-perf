import lodash from 'lodash'
import type { RawData } from './types.ts';
import { em } from 'motion/react-client';

export default function getNonEmptyValues(data: RawData, columnNameStrings: string[]): (string | number)[] | undefined {
  const emptyVals = [null, NaN, "", undefined]
  const colIndices = columnNameStrings
    .map(nameString => data.columns.findIndex(col => col === nameString))
  if (colIndices.includes(-1)) {
    console.log(`WARNING: build-data could not find one or more of the following columns in the raw data:`, columnNameStrings)
    return undefined;
  }
  const allValues = lodash.uniq(
    colIndices
      .map(colIndex => (
        lodash
          .uniq(
            data
              .data
              .map(row => row[colIndex])
          ))) //returns and array of arrays.  Each array is the unique array of values in one of the colIndices columns
      .flat(Infinity) //now it's flattend to just be an array of values
  ) as (string | number | null | undefined)[]//now it's the uniq values entirely
  return allValues.filter(value => !emptyVals.includes(value)) as (string | number)[]
  // const colIndex = data.columns.findIndex(col => col === columnNameString);
  // if (!colIndex) {
  //   console.log(`WARNING: build data could not find a column ${columnNameString} in the raw data.`)
  //   return undefined;
  // }
  // return (lodash.uniq(data.data.map(row => row[colIndex])).filter(w => {
  //   if (w === undefined) {
  //     return false
  //   }
  //   return !(emptyVals.includes(w))
  // })
  // )
}