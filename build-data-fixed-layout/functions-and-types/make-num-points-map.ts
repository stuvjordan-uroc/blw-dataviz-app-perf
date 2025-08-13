import type { Data, ProportionsMap, VizConfig } from "./types-new.ts";


//next step:  Fix this so that it returns whole numbers
//this means that we have to work with the entire array of proportions
//for any given wave and partyGroup.
//we have to somehow pick whole numbers that are close to proportional,
//but add up to exactly 100

function numberOfPoints(wave: number, partyGroup: string[], responseGroup: string[], vizConfig: VizConfig, proportionsMap: ProportionsMap) {
  const p = proportionsMap.get(wave)?.get(partyGroup)?.expanded.get(responseGroup)
  if (!p) {
    return 0
  }
  return p * vizConfig.sampleSize
}

export default function makeNumPointsMap(data: Data, vizConfig: VizConfig, proportionsMap: ProportionsMap) {
  return new Map(data.waves.imp.map(wave => ([
    wave,
    new Map(vizConfig.partyGroups.map(partyGroup => ([
      partyGroup,
      new Map(vizConfig.responseGroups.expanded.map(responseGroup => ([
        responseGroup,
        numberOfPoints(wave, partyGroup, responseGroup, vizConfig, proportionsMap)
      ])))
    ])))
  ])))
}