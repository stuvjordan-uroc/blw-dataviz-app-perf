import type { VizConfig, Data } from "../types.ts";

export default function aggPropMapByResponseExpanded(impVar: string, data: Data, vizConfig: VizConfig) {
  //returns a map that takes each expanded response group
  //to an aggregated proportion.

  //subset to the non-empty responses on the requested impVar
  //from among non-empty pid3s, waves, and weights
  const subset = data.data
    .filter(row => (
      row.pid3 !== null &&
      row.wave !== null &&
      row.weight !== null &&
      row.imp[impVar] !== undefined &&
      row.imp[impVar] !== null &&
      (vizConfig.responseGroups.expanded.flat(Infinity) as string[]).includes(row.imp[impVar]) &&
      (vizConfig.partyGroups.flat(Infinity) as string[]).includes(row.imp[impVar])
    ))
  //compute the total weight in the subset
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const totalWeight = subset.reduce((acc, curr) => acc + curr.weight!, 0)
  return new Map(
    vizConfig.responseGroups.expanded.map((responseGroup, responseGroupIdx, rGArray) => {
      const rgTotalWeight = subset
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .filter(row => responseGroup.includes(row.imp[impVar]!))
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .reduce((acc, curr) => acc + curr.weight!, 0)
      const prevResponseGroups = rGArray.slice(0, responseGroupIdx)
      const prevResponseGroupsTotalWeight = responseGroupIdx === 0 ? 0 :
        subset
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .filter(row => (prevResponseGroups.flat(Infinity) as string[]).includes(row.imp[impVar]!))
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .reduce((acc, curr) => acc + curr.weight!, 0)
      return ([
        responseGroup,
        {
          proportion: rgTotalWeight / totalWeight,
          prevCumProportion: prevResponseGroupsTotalWeight / totalWeight
        }
      ])
    })
  )
}