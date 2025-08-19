import type { Data, ProportionsMap, ResponseGroupToProportionMap, VizConfig } from "./types-new.ts";

function counts(expandedResponseGroupsToProportionsMap: ResponseGroupToProportionMap, vizConfig: VizConfig) {
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

// export default function makeNumPointsMap(data: Data, vizConfig: VizConfig, proportionsMap: ProportionsMap) {
//   return new Map(
//     proportionsMap.entries().map(([wave, valAtWave]) => ([
//       wave,
//       new Map(
//         valAtWave.entries().map(([partyGroup, valAtPartyGroup]) => ([
//           partyGroup,
//           counts(valAtPartyGroup.expanded, vizConfig)
//         ]))
//       )
//     ]))
//   )
// }



export default function addNumPointsToProportionsMap(data: Data, vizConfig: VizConfig, proportionsMap: ProportionsMap) {
  return new Map(
    proportionsMap.entries().map(([wave, valAtWave]) => ([
      wave,
      {
        impVarIsIncluded: valAtWave.impVarIsIncluded,
        proportions: valAtWave.proportions,
        counts: new Map(
          valAtWave.proportions.entries().map(([partyGroup, valAtPartyGroup]) => ([
            partyGroup,
            counts(valAtPartyGroup.expanded, vizConfig)
          ]))
        )
      }
    ]))
  )
}