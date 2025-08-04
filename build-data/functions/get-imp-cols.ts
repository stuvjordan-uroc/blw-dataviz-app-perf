import type { RawData } from "./types.ts";
export default function getImpCols(rawData: RawData) {
  const impCols = rawData
    .columns
    .map((col, idX) => ({
      colName: col,
      colIdx: idX
    }))
    .filter(col => col.colName.startsWith('imp_'))
  if (impCols.length <= 20) {
    console.log(`WARNING: Build data search for columns starting with imp_ and only found ${impCols.length.toString()} columns.`)
    return undefined;
  }
  return (impCols)
}