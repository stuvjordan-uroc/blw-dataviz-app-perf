/* eslint-disable @typescript-eslint/no-non-null-assertion */
export default function getProportions(
  data: Record<string, string>[],
  responseGroups: string[][],
  responseKey: string,
  splitGroups: string[][] | undefined,
  splitKey: string | undefined
) {
  if (!splitGroups) {
    const counts = responseGroups
      .map(responseGroup =>
        data
          .filter(point => responseGroup.includes(point[responseKey] ?? ''))
          .length
      )
    if (counts.reduce((acc, prev) => acc + prev, 0) !== data.length) {
      console.log('WARNING:  You called getProportions with responses array', responseGroups, 'but those responses are not exaustive in the data you passed.')
    }
    const propMap = new Map()
    responseGroups.forEach((responseGroup, responseGroupIdx) => {
      propMap.set(responseGroup, counts[responseGroupIdx]! / data.length)
    })
    return propMap as Map<string[], number>
  } else {
    if (splitKey) {
      const outMap = new Map() as Map<string[], Map<string[], number>>
      splitGroups.forEach(splitGroup => {
        const dataSubsettedToCurrentSplitGroup = data.filter(point => splitGroup.includes(point[splitKey] ?? ''))
        outMap.set(splitGroup, getProportions(dataSubsettedToCurrentSplitGroup, responseGroups, responseKey, undefined, undefined) as Map<string[], number>)
      })
      return outMap
    } else {
      //splitGroups is defined but splitKey is undefined
      console.log('WARNING: You passed splitGroups to getProportions without passing a split key.  getProportions returning undefined')
      return undefined
    }
  }
}