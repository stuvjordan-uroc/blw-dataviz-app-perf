import type { ProportionsMap, VizConfig } from "../../types.ts";

export function aggregateProportionsByResponseExpanded(proportionsMap: ProportionsMap, vizConfig: VizConfig) {
  //first construct a map that takes each response group to a nested
  //map that gives a proportion for that response group at each combination
  //of wave and party group
  const pMapUnFolded = new Map(
    vizConfig.responseGroups.expanded.map(targetRG => ([
      targetRG,
      new Map(
        proportionsMap.entries().filter(([wave, psAtWave]) => psAtWave !== null).map(([wave, psAtWave]) => ([
          wave,
          new Map(
            psAtWave?.entries().map(([partyGroup, psAtPartyGroup]) => {
              //find the matching responseGroup
              const matchingGroup = psAtPartyGroup.expanded.keys().find(rg => (
                rg.every(r => targetRG.includes(r)) &&
                targetRG.every(r => rg.includes(r))
              ))
              if (!matchingGroup) {
                console.log('WARNING: We tried to aggregate proportions, but could not find a match for', targetRG, 'in the proportions map you passed at wave', wave, 'and party group', partyGroup)
                return ([partyGroup, 0])
              }
              const returnP = psAtPartyGroup.expanded.get(matchingGroup)
              if (!returnP) {
                console.log('WARNING: In trying to aggregate proportions, we found a matching group, but failed to use it to retrieve the proportion.')
                return ([partyGroup, 0])
              }
              return ([partyGroup, returnP.proportion])
            })
          )
        ]))
      )
    ]))
  )
  //now roll up the proportions!
  const pMapFolded = new Map(
    pMapUnFolded.entries().map(([rG, psAtRG]) => {
      const waveAvgs = psAtRG.entries().map(([wave, psAtCurrentWave]) => {
        const currentWaveAvg =
          psAtCurrentWave.values().reduce((acc, curr) => acc + curr, 0) /
          psAtCurrentWave.size
        if (isNaN(currentWaveAvg)) {
          console.log('WARNING: In aggregating proportions, we ended up with 0 party groups with defined proportions at wave', wave)
        }
        return currentWaveAvg
      })
      const rgAvg = waveAvgs.reduce((acc, curr) => acc + curr, 0) / waveAvgs.toArray().length
      if (isNaN(rgAvg)) {
        console.log('WARNING: In aggregating proportions, we ended up with 0 waves with defined proportions at response group', rG)
      }
      return ([
        rG,
        rgAvg
      ])
    })
  )
  //add the prevCumProportions
  return (
    new Map(pMapFolded.entries().map(([rG, p], rGIdx) => ([
      rG,
      {
        proportion: p,
        prevCumProportion: pMapFolded.values().take(rGIdx).reduce((acc, curr) => acc + curr, 0)
      }
    ])))
  )
}