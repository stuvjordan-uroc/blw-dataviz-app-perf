/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Data, VizConfig, PAndC, GroupedState, PropCount, DataRow, WaveSplitVal } from "./types.ts";
import impVarIsIncluded from "./impvar-is-included.ts";


function proportion(impVar: string, data: Data, wave: number, partyGroup: string[], responseGroup: string[]): number {
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
  //compute the total weight in the responseGroup
  const totalWeightResponseGroup = subset
    .filter(row => responseGroup.includes(row.imp[impVar] ?? ''))
    .reduce((acc: number, curr: DataRow) => acc + (curr.weight ?? 0), 0)
  return totalWeightResponseGroup / totalWeight
}

function countsMap(pMap: Map<string[], number>, sampleSize: number): Map<string[], number> | undefined {
  if (pMap.size <= 0) {
    return undefined
  }
  const valuesKeyVals = [...pMap.entries()].map(([rg, p]: [string[], number]) => ([
    rg,
    {
      rounded: Math.floor(p * sampleSize),
      real: p * sampleSize
    }
  ])) as [string[], { rounded: number, real: number }][]
  while (valuesKeyVals.map(v => v[1]).reduce((acc: number, curr: { rounded: number, real: number }) => acc + curr.rounded, 0) < sampleSize) {
    const furthestKeyValIdx: number = valuesKeyVals.reduce((
      acc: number,
      curr: [string[], { rounded: number, real: number }],
      currIdx: number,
      array: [string[], { rounded: number; real: number; }][]
    ) =>
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      curr[1].real - curr[1].rounded > array[acc]![1].real - array[acc]![1].rounded ? currIdx : acc,
      0
    )
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    valuesKeyVals[furthestKeyValIdx]![1].rounded = valuesKeyVals[furthestKeyValIdx]![1].rounded + 1
  }
  return new Map(valuesKeyVals.map(([rg, val]) => [rg, val.rounded]))
}



export default function proportionsAndCounts(impVar: string, data: Data, vizConfig: VizConfig): PAndC {
  //first make the empty pAndC map, nulling out the waves that do not include the impVar
  const pAndC = {} as PAndC
  ['expanded', 'collapsed'].forEach((groupedState: string) => {
    const typedGroupedState = groupedState as GroupedState
    pAndC[(typedGroupedState)] = new Map(
      vizConfig.responseGroups[typedGroupedState].map((rg: string[]) => ([
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
  pAndC.expanded.forEach((
    rgvalue: PropCount & { partySplit: Map<string[], PropCount>, waveSplit: Map<number, null | WaveSplitVal> },
    rgkey: string[],
    _rgmap: Map<string[], PropCount & { partySplit: Map<string[], PropCount>, waveSplit: Map<number, null | WaveSplitVal> }>
  ) => {
    [...rgvalue.waveSplit.entries()]
      .filter(([_wave, valAtWave]: [number, null | WaveSplitVal]) => valAtWave !== null)
      .forEach((
        [wave, valAtWave]: [number, null | WaveSplitVal],
        _idx: number,
        _array: [number, null | WaveSplitVal][]
      ) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        valAtWave!.partySplit.forEach((pgValue: PropCount, pgKey: string[], _pgMap: Map<string[], PropCount>) => {
          pgValue.p = proportion(impVar, data, wave, pgKey, rgkey)
        })
      })
  })
  //now aggregate up
  //first do the waves
  pAndC.expanded.forEach((
    rgValue: PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> },
    _rgKey: string[],
    _rgMap: Map<string[], PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> }>
  ) => {
    [...rgValue.waveSplit.entries()]
      .filter(([_wave, valAtWave]: [number, null | WaveSplitVal]) => valAtWave !== null)
      .forEach(([_wave, valAtWave]: [number, null | WaveSplitVal]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        valAtWave!.p = [...valAtWave!.partySplit.values()].map((valAtPg: PropCount) => valAtPg.p).reduce((acc: number, curr: number) => acc + curr, 0) / valAtWave!.partySplit.size
      })
  })
  //now do the parties
  pAndC.expanded.forEach((
    rgValue: PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> },
    _rgKey: string[],
    _rgMap: Map<string[], PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> }>
  ) => {
    rgValue.partySplit.forEach((
      pgValue: PropCount,
      pgKey: string[],
      _pgMap: Map<string[], PropCount>
    ) => {
      pgValue.p = [...rgValue.waveSplit.values()]
        .filter((waveValue: WaveSplitVal | null) => waveValue !== null)
        .map((waveValue: WaveSplitVal) => {
          const matchingParty = waveValue.partySplit.get(pgKey)
          return matchingParty ? matchingParty.p : 0
        })
        .reduce((acc: number, curr: number) => acc + curr, 0) / [...rgValue.waveSplit.values()].filter((waveValue: null | WaveSplitVal) => waveValue !== null).length
    })
  })
  //now do the top level
  pAndC.expanded.forEach((
    rgValue: PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> },
    _rgKey: string[],
    _rgMap: Map<string[], PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> }>
  ) => {
    rgValue.p = [...rgValue.waveSplit.values()]
      .filter((waveVal: WaveSplitVal | null) => waveVal !== null)
      .map((waveVal: WaveSplitVal) => waveVal.p)
      .reduce((acc: number, curr: number) => acc + curr, 0) / [...rgValue.waveSplit.values()].filter((waveVal: null | WaveSplitVal) => waveVal !== null).length
  })
  //now do the counts at the bottom level
  //start by generating a map that takes each wave-partyGroup to a map from response group to count
  const countsMapsByWaveAndParty = new Map(
    data.waves.imp.map((w: number) => ([
      w,
      !impVarIsIncluded(impVar, data, w) ? null : new Map(
        vizConfig.partyGroups.map((pg: string[]) => {
          const rgToP = new Map(
            [...pAndC.expanded.entries()].map(([rg, rgVal]: [
              string[],
              PropCount & {
                waveSplit: Map<
                  number,
                  null | PropCount & {
                    partySplit: Map<string[], PropCount>
                  }
                >,
                partySplit: Map<string[], PropCount>
              }
            ]) => ([
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
  pAndC.expanded.forEach((
    rgValue: PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> },
    rgKey: string[],
    _rgMap: Map<string[], PropCount & { waveSplit: Map<number, null | WaveSplitVal>, partySplit: Map<string[], PropCount> }>
  ) => {
    ([...rgValue.waveSplit.entries()] as [number, null | WaveSplitVal][])
      .filter(([_w, wVal]: [number, null | WaveSplitVal]) => wVal !== null)
      .forEach(([w, wVal]: [number, null | WaveSplitVal]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        wVal!.partySplit.forEach((
          pgVal: PropCount,
          pgKey: string[],
          _pgMap: Map<string[], PropCount>
        ) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          pgVal.c = countsMapsByWaveAndParty.get(w)!.get(pgKey)!.get(rgKey)!
        })
      })
  })
  //now aggregate the counts
  //start at the wave level
  pAndC.expanded.forEach((rgValue, _rgKey, _rgMap) => {
    [...rgValue.waveSplit.values()]
      .filter((waveVal: null | WaveSplitVal) => waveVal !== null)
      .forEach((waveVal: WaveSplitVal) => {
        waveVal.c = [...waveVal.partySplit.values()]
          .map((pgVal: PropCount) => pgVal.c).reduce((acc, curr) => acc + curr, 0)
      })
  })
  //now aggregate counts for rgValue.partySplit
  pAndC.expanded.forEach((rgValue, _rgKey, _rgMap) => {
    rgValue.partySplit.forEach((pgValue, pgKey, _pgMap) => {
      pgValue.c = [...rgValue.waveSplit.values()]
        .filter((waveVal: null | WaveSplitVal) => waveVal !== null)
        .map((waveVal: WaveSplitVal) =>
          waveVal.partySplit.get(pgKey)
        )
        .reduce((acc: number, curr: {
          p: number;
          c: number;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        } | undefined) => acc + (curr!.c), 0)
    })
  })
  //finally aggregate counts at the top level
  pAndC.expanded.forEach((rgValue, _rgKey, _rgMap) => {
    rgValue.c = [...rgValue.waveSplit.values()]
      .filter((waveVal: null | WaveSplitVal) => waveVal !== null)
      .map((waveVal: WaveSplitVal) => waveVal.c)
      .reduce((acc: number, curr: number) => acc + curr, 0)
  })
  return pAndC
}