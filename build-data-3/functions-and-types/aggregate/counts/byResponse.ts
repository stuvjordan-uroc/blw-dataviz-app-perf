import type { CountsMap, VizConfig } from "../../types.ts";

export function aggregateCountsByResponseExpanded(countsMap: CountsMap, vizConfig: VizConfig) {
  //first construct a map that takes each response group to a nested map
  //that gives the count for that response group at each combination of wave and response group.
  const countsMapUnFolded = new Map(
    vizConfig.responseGroups.expanded.map(targetRG => ([
      targetRG,
      new Map(
        countsMap.entries().filter(([wave, countsAtWave]) => countsAtWave !== null).map(([wave, countsAtWave]) => ([
          wave,
          new Map(
            countsAtWave?.entries().map(([partyGroup, countsAtPartyGroup]) => {
              //find the matching responseGroup
              const matchingGroup = countsAtPartyGroup.keys().find(rg => (
                rg.every(r => targetRG.includes(r)) &&
                targetRG.every(r => rg.includes(r))
              ))
              if (!matchingGroup) {
                console.log('WARNING: We tried to aggregate counts, but could not find a match for', targetRG, 'in the counts map you passed at wave', wave, 'and party group', partyGroup)
                return ([partyGroup, 0])
              }
              const returnCount = countsAtPartyGroup.get(matchingGroup)
              if (!returnCount) {
                console.log('WARNING: In trying to aggregate counts, we found a matching group, but failed to use it to retrieve the count.')
                return ([partyGroup, 0])
              }
              return ([partyGroup, returnCount])
            })
          )
        ]))
      )
    ]))
  )
  //now roll up the counts!
  const countsMapFolded = new Map(
    countsMapUnFolded.entries().map(([rG, countsAtRG]) => {
      const waveTotals = countsAtRG.values().map(countsAtCurrentWave => {
        const currentWaveTotal = countsAtCurrentWave.values().reduce((acc, curr) => acc + curr, 0)
        return currentWaveTotal
      })
      return ([
        rG,
        waveTotals.reduce((acc, curr) => acc + curr, 0)
      ])
    })
  )
  return countsMapFolded
}