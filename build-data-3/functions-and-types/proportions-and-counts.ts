import type { Data, VizConfig } from "./types.ts";

export default function proportionsAndCounts(impVar: string, data: Data, vizConfig: VizConfig) {
  //first make the empty pAndC map
  const pAndC = {}
  Object.entries(vizConfig.responseGroups).forEach(([key, value]) => {
    const groupedState = key as 'expanded' | 'collapsed'
    const responseGroups = value
    pAndC[groupedState] = new Map(
      responseGroups.map(rg => ([
        rg,
        {
          p: 0,
          c: 0,
          waveSplit: new Map(data.waves.imp.map(w => ([w, { p: 0, c: 0, partySplit: new Map() }]))),
          partySplit: new Map(vizConfig.partyGroups.map(pg => ([pg, { p: 0, c: 0, waveSplit: new Map() }])))
        }
      ]))
    )
  })
}