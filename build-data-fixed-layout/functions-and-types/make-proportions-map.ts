import type { Data, VizConfig } from "./types-new.ts";

function proportion(impVar: string, data: Data, wave: number, partyGroup: string[], responseGroup: string[]) {
  //subset the data...all rows within the party group
  const subset = data.data.filter(row => (
    row.wave === wave &&  //row.wave is equal to the wave requested
    row.pid3 && //row.pid3 is not null
    partyGroup.includes(row.pid3) &&//row.pid3 is in the requested partyGroup
    row.imp[impVar] && //row.imp[impVar] is not null 
    row.weight //row.weight is not null
  ))
  //compute the total weight within the subset
  //disabling non-null assertion because we filtered out rows with null weight
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const totalWeight = subset.reduce((acc, curr) => acc + (curr.weight!), 0)
  // if (impVar === 'misconduct') {
  //   console.log('totalWeight for =misconduct= at wave', wave, 'and partyGroup', partyGroup, ':', totalWeight)
  // }

  //compute the total weight in the responseGroup
  const totalWeightResponseGroup = subset
    .filter(row => responseGroup.includes(row.imp[impVar] ?? ''))
    .reduce((acc, curr) => acc + (curr.weight ?? 0), 0)
  // if (impVar === 'misconduct') {
  //   console.log('For =misconduct=, total weight in responseGroup', responseGroup, 'for partyGroup', partyGroup, ':', totalWeightResponseGroup)
  // }
  //compute the proportions
  // if (impVar === 'misconduct') {
  //   console.log('For =misconduct=, proportion in responseGroup', responseGroup, 'for partyGroup', partyGroup, ':', totalWeightResponseGroup / totalWeight)
  // }
  return totalWeightResponseGroup / totalWeight
}

function impVarIsIncluded(impVar: string, data: Data, wave: number) {
  const subset = data.data.filter(row => (
    row.wave === wave &&  //row.wave is equal to the wave requested
    row.pid3 && //row.pid3 is not null
    row.imp[impVar] && //row.imp[impVar] is not null 
    row.weight //row.weight is not null
  ))
  return subset.length !== 0
}

export default function makeImpProportionsMap(impVar: string, data: Data, vizConfig: VizConfig) {
  return new Map(data.waves.imp
    .filter(wave => impVarIsIncluded(impVar, data, wave))
    .map(wave => ([
      wave,
      new Map(vizConfig.partyGroups.map(partyGroup => ([
        partyGroup,
        Object.fromEntries(Object.entries(vizConfig.responseGroups).map(([groupedState, arrayOfResponseGroups]) => [
          groupedState,
          new Map(arrayOfResponseGroups.map((responseGroup, rgIdx, aRg) => ([
            responseGroup,
            {
              proportion: proportion(impVar, data, wave, partyGroup, responseGroup),
              prevCumProportion: rgIdx === 0 ? 0 : aRg.slice(0, rgIdx).reduce((acc, curr) =>
                acc + proportion(impVar, data, wave, partyGroup, curr),
                0
              )
            }
          ])))
        ]))
      ])))
    ]))
  )
}
