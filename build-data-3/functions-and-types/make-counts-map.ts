import type { Data, ProportionsMap, VizConfig } from "./types.ts"

type ResponseGroupToP = Map<string[], {
  proportion: number;
  prevCumProportion: number;
}>

function counts(expandedResponseGroupsToProportionsMap: ResponseGroupToP, vizConfig: VizConfig) {
  const values = expandedResponseGroupsToProportionsMap.entries().map(([responseGroup, proportion]) => ({
    responseGroup: responseGroup,
    rounded: Math.floor(proportion.proportion * vizConfig.sampleSize),
    real: proportion.proportion * vizConfig.sampleSize
  }))
  const valuesA = values.toArray()
  if (valuesA.length === 0) {
    //return an empty version of Map<ResponseGroup, number>
    console.log('WARNING: We tried to create an array of counts from an expandedResponseGroupsToProporionsMap.')
    console.log('but we ended up getting an empty array of rounded and real counts')
    console.log('here is the map we tried to build from:')
    console.log(expandedResponseGroupsToProportionsMap)
    return new Map(expandedResponseGroupsToProportionsMap.keys().map((responseGroup => ([
      responseGroup,
      NaN
    ]))))
  }
  //iterate to get the sum of values up to the sampleSize
  while (
    valuesA.reduce((acc, curr) => curr.rounded + acc, 0) < vizConfig.sampleSize
  ) {
    //find the value that is furthest below its real value
    const furthestValue =
      valuesA.reduce((acc, curr) => {
        if (curr.real - curr.rounded > acc.real - acc.rounded) {
          return curr
        }
        return acc
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      }, valuesA[0]!)
    //increment that value
    furthestValue.rounded = furthestValue.rounded + 1;
  }
  return new Map(valuesA.map(v => ([
    v.responseGroup,
    v.rounded
  ])))
}

export default function makeCountsMap(data: Data, vizConfig: VizConfig, proportionsMap: ProportionsMap) {
  return new Map(proportionsMap.entries().map(([wave, pMapAtWave]) => ([
    wave,
    pMapAtWave === null ? null :
      new Map(pMapAtWave.entries().map(([partyGroup, pMapAtPartyGroup]) => ([
        partyGroup,
        counts(pMapAtPartyGroup.expanded, vizConfig)
      ])))
  ])))
}