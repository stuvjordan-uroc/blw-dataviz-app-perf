import * as _ from 'lodash'
interface RawData {
  columns: string[];
  data: (string | number | null)[][]
}

export default function getNonEmptyWaves(data: RawData, waveColumnNameString: string) {
  const emptyVals = [null, NaN, ""]
  const waveColIndex = data.columns.findIndex(col => col === waveColumnNameString);
  if (!waveColIndex) {
    return undefined;
  }
  return (_.uniq(data.data.map(row => row[waveColIndex])).filter(w => {
    if (w === undefined) {
      return false
    }
    return !(emptyVals.includes(w))
  })
  )
}