/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Data, DataRow } from "./types.ts"
interface ResponseGroups {
  collapsed: string[][];
  expanded: string[][];
}
function weightedImpProportion(principle: string, totalWeight: number, responseGroup: string[], data: DataRow[]) {
  const groupTotalWeight = data
    .filter(row => responseGroup.includes(row.imp[principle]!))
    .reduce((acc, curr) => acc + curr.weight!, 0)
  return groupTotalWeight / totalWeight;
}
export function makeImpProportions(
  principle: string,
  data: Data,
  responseGroups: ResponseGroups,
  waves: number[],
  partyGroups: string[][]
) {
  if (!data.impCols.includes(principle)) {
    console.log("you passed principle:", principle)
    console.log("here are the impCols:", data.impCols)
    return undefined
  }
  const outProportions = {
    collapsed: {
      byResponse: [] as number[],
      byResponseAndParty: [] as number[][],
      byResponseAndWave: [] as number[][],
      byResponseAndPartyAndWave: [] as number[][][]
    },
    expanded: {
      byResponse: [] as number[],
      byResponseAndParty: [] as number[][],
      byResponseAndWave: [] as number[][],
      byResponseAndPartyAndWave: [] as number[][][]
    }
  }
  Object.keys(responseGroups).forEach(viewType => {
    //subset the data to rows that are...
    //in the responseGroup on the principle
    //in the partyGroups on party
    const nonEmptyRows = data.data.filter(row => (
      (responseGroups[viewType as keyof ResponseGroups]).flat(Infinity).includes(row.imp[principle]!) && //rows that have non-empty responses on the principle
      (partyGroups.flat(Infinity).includes(row.pid3!)) &&  //rows that have non-empty responses on pid
      row.weight !== null  //rows that have non-empty responses on weight
    ))
    //byResponse proportions
    const byResponseTotalWeight = nonEmptyRows.reduce((acc, curr) => acc + (curr.weight!), 0)
    outProportions[viewType as keyof ResponseGroups].byResponse =
      responseGroups[viewType as keyof ResponseGroups]
        .map(responseGroup =>
          weightedImpProportion(principle, byResponseTotalWeight, responseGroup, nonEmptyRows)
        )
    //byResponseAndParty proportions
    outProportions[viewType as keyof ResponseGroups].byResponseAndParty =
      partyGroups.map(partyGroup => {
        //total weight for the current party group
        const partyGroupTotalWeight = nonEmptyRows
          .filter(row => partyGroup.includes(row.pid3!))
          .reduce((acc, curr) => acc + curr.weight!, 0)
        return responseGroups[viewType as keyof ResponseGroups].map(responseGroup =>
          weightedImpProportion(
            principle,
            partyGroupTotalWeight,
            responseGroup,
            nonEmptyRows.filter(row => partyGroup.includes(row.pid3!))
          )
        )
      })
    //byResponseAndWave proportions
    outProportions[viewType as keyof ResponseGroups].byResponseAndWave =
      waves.map(wave => {
        //total weight for the current wave
        const waveTotalWeight = nonEmptyRows
          .filter(row => row.wave === wave)
          .reduce((acc, curr) => acc + curr.weight!, 0)
        //if the principle was not included in the current wave, waveTotalWeight will be equal to 0.
        if (waveTotalWeight === 0) {
          return []
        }
        return responseGroups[viewType as keyof ResponseGroups].map(responseGroup =>
          weightedImpProportion(
            principle,
            waveTotalWeight,
            responseGroup,
            nonEmptyRows.filter(row => row.wave === wave)
          )
        )
      })
    //byResponseAndPartyAndWave
    outProportions[viewType as keyof ResponseGroups].byResponseAndPartyAndWave =
      waves.map(wave => {
        if (nonEmptyRows.filter(row => row.wave === wave).length === 0) {
          return []
        }
        return partyGroups.map(partyGroup => {
          //total weight for the current wave and partyGroup
          const wavePartyTotalWeight = nonEmptyRows
            .filter(row => row.wave === wave)
            .filter(row => partyGroup.includes(row.pid3!))
            .reduce((acc, curr) => acc + curr.weight!, 0)
          return responseGroups[viewType as keyof ResponseGroups].map(responseGroup =>
            weightedImpProportion(
              principle,
              wavePartyTotalWeight,
              responseGroup,
              nonEmptyRows
                .filter(row => row.wave === wave)
                .filter(row => partyGroup.includes(row.pid3!))
            )
          )
        })
      })
  })
  return outProportions
}