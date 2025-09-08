import type { PointsViews, VizByImpVar } from "../../build-data"
import type { BreakpointKey } from "../config/layouts-types"
import { useEffect, useState } from "react"

export type PointsMap = Map<
  string[],
  Map<
    number,
    null | Map<
      string[],
      {
        pointsViews: PointsViews,
        images: {
          party: HTMLImageElement,
          noParty: HTMLImageElement
        }
      }
    >
  >
>

export type PointsMaps = Map<
  string,
  PointsMap
>



export function usePointsMaps(breakPointKey: BreakpointKey | undefined) {
  //create a state that is null as long as the pointsMaps are not populated
  //and othwerise holds the points maps
  const [pointsMaps, setPointsMaps] = useState<null | PointsMaps>(null)
  //useEffect to fetch the data needed for the pointsMaps,
  //use that data to populate the pointsMaps,
  //and then update the pointsMaps state if fetching and populatig succceed
  useEffect(() => {
    if (import.meta.env.DEV) { console.log("useEffect in usePointsMaps triggered") }
    //flag to prevent race conditions in case of fast layout changes.
    let ignore = false;
    //just in case we have pointsMaps from a layout that no longer applies...
    setPointsMaps(null)
    //create the new pointsMaps
    makePointsMaps(ignore, breakPointKey, setPointsMaps).catch((error: unknown) => {
      console.error(error)
    })
    //cleanup function that sets ignore to true until the next render,
    //somehow (who the fuck knows) preventing race conditions.
    return (() => { ignore = true; })
  }, [breakPointKey])
  //return the pointsMaps state 
  // (which will be null until/unless the callback inside the useEffect succeeds)
  return pointsMaps
}

//callback to run inside useEffect.
//async because it uses await to make the sequence
//of operations more transparent
async function makePointsMaps(
  ignore: boolean,
  breakPointKey: BreakpointKey | undefined,
  pointsMapsStateSetter: React.Dispatch<React.SetStateAction<PointsMaps | null>>
) {
  //if the layout is undefined, we do not know neither which coordinates nor which images to fetch, so do nothing
  if (!ignore && breakPointKey) {
    //fetch the coordinate data, and use it to construct a pointsMaps that does
    //not yet have the required circle images attached.
    try {
      const pointsMapsWithoutImages = await getPointsMapsWithoutImages(breakPointKey)
      if (import.meta.env.DEV) { console.log("here is pointsMapsWithoutImages", pointsMapsWithoutImages) }
      //now try to load the images and put references to those loaded images
      //at the appropriate spots in the pointsMaps
      try {
        const pointsMaps = await attachImages(pointsMapsWithoutImages, breakPointKey)
        if (import.meta.env.DEV) { console.log("here is the pointsMaps:", pointsMaps) }
        //Everything has succeed if we get to this point, so update the pointsMaps state
        //with the now-populated pointsMaps!
        pointsMapsStateSetter(pointsMaps)
      } catch (error) {
        console.error("Error attaching images needed for drawing viz:", error)
      }
    } catch (error: unknown) {
      console.error("Error fetching coordinate data:", error)
    }
  } else {
    if (import.meta.env.DEV) { console.log("Either ignore is true or breakpoint key is undefined.  Leaving pointsMaps null.") }
  }
}

export async function getPointsMapsWithoutImages(breakPointKey: BreakpointKey) {
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

export function attachImages(pointsMaps: PointsMaps, breakPointKey: BreakpointKey) {
  const attachmentOutcome = new Promise<PointsMaps>((resolve, reject) => {
    //create the empty image map
    const imageMap = new Map() as Map<string, HTMLImageElement>
    //use the party group vaues in the points map to populate the image map
    (Object.entries(pointsMaps) as [string, PointsMap][]).forEach(([_pmKey, pointsMap]) => {
      pointsMap.forEach((pmAtRg) => {
        pmAtRg.forEach((pmAtWave) => {
          if (pmAtWave) {
            pmAtWave.forEach((pmAtPg, pg) => {
              console.log("setting images at pg", pg)
              const pgString = pg.join("-")
              if (!(imageMap.get(pgString) instanceof Image)) {
                imageMap.set(pgString, new Image())
              }
              if (!(imageMap.get("none") instanceof Image)) {
                imageMap.set("none", new Image())
              }
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              pmAtPg.images.party = imageMap.get(pgString)!
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              pmAtPg.images.noParty = imageMap.get("none")!
            })
          }
        })
      })
    })
    if (import.meta.env.DEV) { console.log("tried to populate imageMap.  Here's what we made:", imageMap) }
    //counter to track how many images have successfully loaded
    let numImagesLoaded = 0;
    //array to track any images that error when they try to load
    const imagesErrored = [] as [string, string][]
    //set event listeners on the images that track and respond
    //to load and error events, triggering fulfillment or rejection
    //of the attachmentOutcome Promise
    imageMap.forEach((image, pgString) => {
      //load listener
      image.addEventListener("load", () => {
        numImagesLoaded = numImagesLoaded + 1
        if (numImagesLoaded + imagesErrored.length === imageMap.size) {
          //if we get here, all images have either loaded or errored
          if (imagesErrored.length > 0) {
            //at least one image errored
            //write the error message
            const errorEntries = [
              "The following images failed to load:",
              ...imagesErrored.map(([errorPg, errorPath]) => `  ${errorPg} with path ${errorPath}`)
            ]
            //set the attachmentOutcome promise to rejected
            reject(new Error(errorEntries.join("\n")))
          } else {
            //all images successfully loaded
            //set the attachmentOutcoe promise to resolved
            resolve(pointsMaps)
          }
        }
      })
      //error listener
      image.addEventListener("error", () => {
        imagesErrored.push([pgString, image.src])
        if (numImagesLoaded + imagesErrored.length === imageMap.size) {
          //all images have either errored or loaded, and the current image has definitely errored
          //write the error message
          const errorEntries = [
            "The following images failed to load:",
            ...imagesErrored.map(([errorPg, errorPath]) => `  ${errorPg} with path ${errorPath}`)
          ]
          //set the attachmentOutcome promise to rejected
          reject(new Error(errorEntries.join("\n")))
        }
      })
      //assign the image path so the browser starts trying to load the image
      image.src = `/img/${breakPointKey}-${pgString}.png`
    })
  })
  return attachmentOutcome
}

