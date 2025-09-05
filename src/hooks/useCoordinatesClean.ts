import type { PointsViews, VizByImpVar } from "../../build-data"
import type { BreakpointKey, BreakpointConfig } from "../config/layouts-types"
import { useState } from "react"

export type PointsMap = Map<
  string[],
  Map<
    number,
    null | Map<
      string[],
      {
        images: {
          party: HTMLImageElement,
          noParty: HTMLImageElement
        },
        pointsViews: PointsViews
      }
    >
  >
>

export function useCoordinates(
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined
) {
  const [pointsMap, setPointsMap] = useState<
    null |
    Record<string, Map<string[], Map<number, Map<string[], {
      images: {
        party: HTMLImageElement;
        noParty: HTMLImageElement;
      };
      pointsViews: PointsViews;
    }> | null>>>
  >(null);
  const abortController = new AbortController();
  function fetchData() {
    if (layout) {
      fetch("/coordinates/viz-" + layout.breakPointKey + ".json", {
        signal: abortController.signal
      }).then(async (response) => {
        const newCoordinates = (await response.json()) as VizByImpVar
        //initialize the imageMap
        const imageMap = new Map() as Map<string, HTMLImageElement>
        //initialize the pointsMap
        const newPointsMap = Object.fromEntries(
          Object.entries(newCoordinates).map(([impVarName, mapAtImpVar]) => ([
            impVarName,
            new Map(
              mapAtImpVar.points.map(([rg, unMapAtrg]) => ([
                rg,
                new Map(
                  unMapAtrg.map(([wave, unMapAtWave]) => ([
                    wave,
                    unMapAtWave === null ? null : new Map(
                      unMapAtWave.map(([pg, unMapAtPg]) => ([
                        pg,
                        {
                          images: {
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            party: imageMap.has(pg.join("-")) ? imageMap.get(pg.join("-"))! : new Image(),
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            noParty: imageMap.has("none") ? imageMap.get("none")! : new Image()
                          },
                          pointsViews: unMapAtPg
                        }
                      ]))
                    )
                  ]))
                )
              ]))
            )
          ]))
        )
        //set listeners to trigger setting the poinstMap state when all images have loaded
        //and point images to their sources to start loading
        let imagesLoaded = 0
        imageMap.forEach((imageEl, pgString) => {
          imageEl.addEventListener("load", () => {
            imagesLoaded = imagesLoaded + 1;
            if (imagesLoaded === imageMap.size) {
              //set pointsMap
              setPointsMap(newPointsMap)
            }
          })
          imageEl.src = `/img/${layout.breakPointKey}-${pgString}.png`
        })
      }).catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") { }
        //handle other erros here
      })
    }
  }
  fetchData();
  return pointsMap
}