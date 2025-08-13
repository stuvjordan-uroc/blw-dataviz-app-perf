import { map } from "lodash";
import type { Data, ProportionsMap, VizConfig } from "./types-new.ts";


//next step:  Fix this so that it returns whole numbers
//this means that we have to work with the entire array of proportions
//for any given wave and partyGroup.
//we have to somehow pick whole numbers that are close to proportional,
//but add up to exactly 100

function numberOfPoints(wave: number, partyGroup: string[], vizConfig: VizConfig, proportionsMap: ProportionsMap) {
  //first set the numbers of points to the rounded-down values
  type Values = { rounded: number, real: number }
  const values: Values = vizConfig.responseGroups.expanded.map(responseGroup => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    rounded: Math.floor(proportionsMap.get(wave)!.get(partyGroup)!.expanded.get(responseGroup)! * vizConfig.sampleSize),
    real: proportionsMap.get(wave)!.get(partyGroup)!.expanded.get(responseGroup)! * vizConfig.sampleSize
  }))
  while (values.reduce((acc, curr) => acc + curr.rounded, 0) < vizConfig.sampleSize) {
    //get the value with the greatest distance from its real value

  }

}

export default function makeNumPointsMap(data: Data, vizConfig: VizConfig, proportionsMap: ProportionsMap) {
  return new Map(data.waves.imp.map(wave => ([
    wave,
    new Map(vizConfig.partyGroups.map(partyGroup => ([
      partyGroup,
      //make numbers of points here
    ])))
  ])))
}