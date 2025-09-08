import getPointsMapsWithoutImages from "./get-points-maps-without-images"
import { attachImages } from "./attach-images"
import type { BreakpointKey } from "../../config/layouts-types"
import type { PointsMaps } from "./index"

export default async function makePointsMaps(
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