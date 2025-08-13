import type { Data, Layout, ProportionsMap, VizConfig } from "./types-new.ts";


function makeSegmentUnsplit(waveIndex: number, partyGroupIndex: number, data: Data, vizConfig: VizConfig, proportionsMap: ProportionsMap, layout: Layout) {
  const justUnsplit = {
    unsplit: {
      topLeftX: layout.vizWidth / vizConfig.partyGroups.length * partyGroupIndex,
      topLeftY: layout.vizWidth / layout.A / data.waves.imp.length * waveIndex,
      width: layout.vizWidth / layout.A / data.waves.imp.length,
      height: layout.vizWidth / layout.A / data.waves.imp.length,
      points: 
    }
  }
}



export default function makeSegmentMap(impVar: string, data: Data, vizConfig: VizConfig, proportionsMap: ProportionsMap, layout: Layout) {
  new Map(data.waves.imp.map(wave => ([
    wave,
    new Map(vizConfig.partyGroups.map(partyGroup => ([
      partyGroup,
      //make segment here
    ])))
  ])))
}