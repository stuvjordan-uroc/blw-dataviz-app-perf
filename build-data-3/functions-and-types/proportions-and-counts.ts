import type { Data, VizConfig } from "./types.ts";
import impVarIsIncluded from "./impvar-is-included.ts";

type GroupedState = 'collapsed' | 'expanded'
type PAndC = Record<
  GroupedState,
  Map<string[], {
    p: number;
    c: number;
    waveSplit: Map<number, null | {
      p: number;
      c: number;
      partySplit: Map<string[], {
        p: number;
        c: number;
      }>;
    }>;
    partySplit: Map<string[], {
      p: number;
      c: number;
    }>;
  }>
>

function proportion(impVar: string, data: Data, wave: number, partyGroup: string[], responseGroup: string[]) {
  //subset the data...all rows within the party group and wave
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

function countsMap(pMap: Map<string[], number>, sampleSize: number) {
  if (pMap.size <= 0) {
    return undefined
  }
  const values = new Map(
    pMap.entries().map(([rg, p]) => ([
      rg,
      {
        rounded: Math.floor(p * sampleSize),
        real: p * sampleSize
      }
    ]))
  )
  while (
    values.values().reduce((acc, curr) => acc + curr.rounded, 0) < sampleSize
  ) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const furthestKey = values.keys().reduce((acc, curr) => values.get(curr)!.real - values.get(curr)!.rounded > values.get(acc!)!.real - values.get(acc!)!.rounded ? curr : acc, values.keys().next().value)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    values.get(furthestKey!)!.rounded = values.get(furthestKey!)!.rounded + 1
  }
  return new Map(values.entries().map(([rg, v]) => [rg, v.rounded]))
}



export default function proportionsAndCounts(impVar: string, data: Data, vizConfig: VizConfig) {
  //first make the empty pAndC map, nulling out the waves that do not include the impVar
  const pAndC = {} as PAndC
  ['expanded', 'collapsed'].forEach(groupedState => {
    const typedGroupedState = groupedState as GroupedState
    pAndC[typedGroupedState] = new Map(
      vizConfig.responseGroups[typedGroupedState].map(rg => ([
        rg,
        {
          p: 0,
          c: 0,
          waveSplit: new Map(
            data.waves.imp.map(wave => ([
              wave,
              !impVarIsIncluded(impVar, data, wave) ? null : {
                p: 0,
                c: 0,
                partySplit: new Map(
                  vizConfig.partyGroups.map(partyGroup => ([
                    partyGroup,
                    {
                      p: 0,
                      c: 0
                    }
                  ]))
                )
              }
            ]))
          ),
          partySplit: new Map(
            vizConfig.partyGroups.map(partyGroup => ([
              partyGroup,
              {
                p: 0,
                c: 0
              }
            ]))
          )
        }
      ]))
    )
  })
  //now populate the proportions at the bottom level of the expanded view
  pAndC.expanded.forEach((rgvalue, rgkey, rgmap) => {
    rgvalue.waveSplit.entries().filter(([wave, valAtWave]) => valAtWave !== null).forEach(([wave, valAtWave]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      valAtWave!.partySplit.forEach((pgValue, pgKey, pgMap) => {
        pgValue.p = proportion(impVar, data, wave, pgKey, rgkey)
      })
    })
  })
  //now aggregate up
  //first do the waves
  pAndC.expanded.forEach((rgValue, rgKey, rgMap) => {
    rgValue.waveSplit.entries().filter(([wave, valAtWave]) => valAtWave !== null).forEach(([wave, valAtWave]) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      valAtWave!.p = valAtWave!.partySplit.values().map(valAtPg => valAtPg.p).reduce((acc, curr) => acc + curr, 0) / valAtWave!.partySplit.size
    })
  })
  //now do the parties
  pAndC.expanded.forEach((rgValue, rgKey, rgMap) => {
    rgValue.partySplit.forEach((pgValue, pgKey, pgMap) => {
      pgValue.p = rgValue.waveSplit
        .values()
        .filter(waveValue => waveValue !== null)
        .map(waveValue => {
          const matchingParty = waveValue.partySplit.get(pgKey)
          return matchingParty ? matchingParty.p : 0
        })
        .reduce((acc, curr) => acc + curr, 0) / rgValue.waveSplit.values().filter(waveValue => waveValue !== null).toArray().length
    })
  })
  //now do the top level
  pAndC.expanded.forEach((rgValue, rgKey, rgMap) => {
    rgValue.p = rgValue.waveSplit
      .values()
      .filter(waveVal => waveVal !== null)
      .map(waveVal => waveVal.p)
      .reduce((acc, curr) => acc + curr, 0) / rgValue.waveSplit.values().filter(waveVal => waveVal !== null).toArray().length
  })
  //now do the counts at the bottom level
  //start by generating a map that takes each wave-partyGroup to a map from response group to count
  const countsMapsByWaveAndParty = new Map(
    data.waves.imp.map(w => ([
      w,
      !impVarIsIncluded(impVar, data, w) ? null : new Map(
        vizConfig.partyGroups.map(pg => {
          const rgToP = new Map(
            pAndC.expanded.entries().map(([rg, rgVal]) => ([
              rg,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              rgVal.waveSplit.get(w)!.partySplit.get(pg)!.p
            ]))
          )
          return ([pg, countsMap(rgToP, vizConfig.sampleSize)])
        })
      )
    ]))
  )
  //now distribute these counts to the bottom level
  pAndC.expanded.forEach((rgValue, rgKey, rgMap) => {
    rgValue.waveSplit.entries()
      .filter(([w, wVal]) => wVal !== null)
      .forEach(([w, wVal]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        wVal!.partySplit.forEach((pgVal, pgKey, pgMap) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pgVal.c = countsMapsByWaveAndParty.get(w)!.get(pgKey)!.get(rgKey)!
        })
      })
  })
  //now aggregate the counts
  //start at the wave level
  pAndC.expanded.forEach((rgValue, rgKey, rgMap) => {
    rgValue.waveSplit.values().filter(waveVal => waveVal !== null).forEach(waveVal => {
      waveVal.c = waveVal.partySplit.values().map(pgVal => pgVal.c).reduce((acc, curr) => acc + curr, 0)
    })
  })
  //now aggregate counts for rgValue.partySplit
  pAndC.expanded.forEach((rgValue, rgKey, rgMap) => {
    rgValue.partySplit.forEach((pgValue, pgKey, pgMap) => {
      pgValue.c = rgValue.waveSplit
        .values()
        .filter(waveVal => waveVal !== null)
        .map(waveVal =>
          waveVal.partySplit.get(pgKey)
        )
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .reduce((acc, curr) => acc + (curr!.c), 0)
    })
  })
  //finally aggregate counts at the top level
  pAndC.expanded.forEach((rgValue, rgKey, rgMap) => {
    rgValue.c = rgValue.waveSplit
      .values()
      .filter(waveVal => waveVal !== null)
      .map(waveVal => waveVal.c)
      .reduce((acc, curr) => acc + curr, 0)
  })
  return pAndC
}