import type { PointsMaps } from "./index"
import type { BreakpointKey } from "../../config/layouts-types"
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
