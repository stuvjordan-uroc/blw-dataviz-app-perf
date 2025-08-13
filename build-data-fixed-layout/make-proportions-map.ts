import type { ProportionsMap, VizConfig } from "./functions-and-types/types-new.ts";
import type { Data } from "./functions-and-types/types.ts";

function proportion(impVar: string, data: Data, wave: number, partyGroup: string[], responseGroup: string[]) {
  //subset the data
  const subset = data.data.filter(row => (
    row.wave === wave &&
    partyGroup.includes[row.pid3] &&
    row.imp[impVar] !== null &&
    row.weight !== null
  ))
  //compute the total weight within the subset
  //disabling non-null assertion because we filtered out rows with null weight
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const totalWeight = subset.reduce((acc, curr) => acc + (curr.weight!), 0)
  //compute the proportions
  return subset
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .filter(row => responseGroup.includes(row.imp[impVar]!))
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    .reduce((acc, curr) => acc + curr.weight!, 0) / totalWeight
}


export default function makeImpProportionsMap(impVar: string, data: Data, vizConfig: VizConfig) {
  return new Map(data.waves.imp.map(wave => ([
    wave,
    new Map(vizConfig.partyGroups.map(partyGroup => ([
      partyGroup,
      Object.fromEntries(Object.entries(vizConfig.responseGroups).map(([groupedState, arrayOfResponseGroups]) => [
        groupedState,
        new Map(arrayOfResponseGroups.map(responseGroup => ([
          responseGroup,
          proportion(impVar, data, wave, partyGroup, responseGroup)
        ])))
      ]))
    ])))
  ]))) as ProportionsMap
}
