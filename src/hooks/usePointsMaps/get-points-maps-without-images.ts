import type { BreakpointKey } from "../../config/layouts-types"
import type { PointsMaps } from "./index"
import type { VizByImpVar } from "../../../build-data"
export default async function getPointsMapsWithoutImages(breakPointKey: BreakpointKey) {
  const pointsMapsOutcome = new Promise<PointsMaps>((resolve, reject) => {
    fetch("/coordinates/viz-" + breakPointKey + ".json")
      .then(async (rawCoordinates) => {
        try {
          const newCoordinates = (await rawCoordinates.json()) as VizByImpVar
          //initialize the pointsMap
          const newPointsMaps = new Map(
            Object.entries(newCoordinates).map(([impVarName, unMap]) => ([
              impVarName,
              new Map(
                unMap.points.map(([rg, unMapAtRg]) => ([
                  rg,
                  new Map(
                    unMapAtRg.map(([wave, unMapAtWave]) => ([
                      wave,
                      unMapAtWave === null ? null : new Map(
                        unMapAtWave.map(([pg, pvAtPg]) => ([
                          pg,
                          {
                            images: {} as { party: HTMLImageElement, noParty: HTMLImageElement },
                            pointsViews: pvAtPg
                          }
                        ] as [string[], { images: { party: HTMLImageElement, noParty: HTMLImageElement }, pointsViews: PointsViews }]))
                      )
                    ] as [number, null | Map<string[], { images: { party: HTMLImageElement, noParty: HTMLImageElement }, pointsViews: PointsViews }>]))
                  )
                ] as [string[], Map<number, null | Map<string[], { images: { party: HTMLImageElement, noParty: HTMLImageElement }, pointsViews: PointsViews }>>]))
              )
            ] as [string, Map<string[], Map<number, null | Map<string[], { images: { party: HTMLImageElement, noParty: HTMLImageElement }, pointsViews: PointsViews }>>>]))
          )
          resolve(newPointsMaps)
        } catch (error: unknown) {
          reject(error as Error)
        }
      })
      .catch((error: unknown) => {
        reject(error as Error)
      })
  })
  return pointsMapsOutcome;
}