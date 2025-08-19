import type { CountsMap, VizConfig } from "../../types.ts";

export function aggregateCountsByResponseExpanded(countsMap: CountsMap, vizConfig: VizConfig) {
  const out = new Map(
    vizConfig.responseGroups.expanded.map(responseGroup => ([
      responseGroup,
      countsMap
        .entries()
        .filter(([wave, cpAtWave]) => (cpAtWave !== null))
        .map(([wave, cpAtWave]) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const out = cpAtWave!
            .entries()
            .map(([partyGroup, cpAtPartyGroup]) => {
              const out = cpAtPartyGroup
                .entries()
                .filter(([currentResponseGroup, count]) =>
                  responseGroup.every(rg => currentResponseGroup.includes(rg)) &&
                  currentResponseGroup.every(rg => responseGroup.includes(rg))
                )
                .map(([currentResponseGroup, count]) => count)
                .toArray()[0]
              return out
            })
            .toArray()
            //at this point `out` holds an array of number | undefined.
            //each one represents the count for the given responseGroup at one partyGroup
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .reduce((acc, curr) => acc! + (curr ?? 0), 0)
          //now out is the sum of these counts across the party groups.
        })
    ]))
  )
}