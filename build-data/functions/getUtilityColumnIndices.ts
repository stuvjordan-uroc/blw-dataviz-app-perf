import type { RawData } from "./types.ts"
export default function getUtilityColumnIndices(data: RawData, columnNames: string[]) {
  const unChecked = columnNames.map(cn => data.columns.findIndex(c => c === cn))
  if (unChecked.includes(-1)) {
    console.log('WARNING: One or more of the following columns are not in the raw data: ', columnNames)
    return undefined
  }
  return Object.fromEntries(columnNames.map((cn, idx) => ([cn, unChecked[idx]])))
}