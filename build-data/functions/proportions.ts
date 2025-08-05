export function unGroupedProportions(data: string[], responseGroups: string[][]) {
  const counts = responseGroups.map(group => data.filter(point => group.includes(point)).length)
  if (counts.reduce((acc, prev) => acc + prev, 0) !== data.length) {
    console.log('WARNING:  You called unGroupedProportions with responseGroups', responseGroups, 'But these groups do not exaust the data passed.')
  }
  const propMap = new Map()
  responseGroups.forEach((g, gIdx) => {
    propMap.set(g, counts[gIdx] ? counts[gIdx] / data.length : 0)
  })
  return propMap
}