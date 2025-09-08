import { useState, useEffect } from "react";
import makePointsMaps from "./make-points-maps";
import type { BreakpointKey } from "../../config/layouts-types";
import type { PointsViews } from "../../../build-data";
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
export default function usePointsMaps(breakPointKey: BreakpointKey | undefined) {
  //create a state that is null as long as the pointsMaps are not populated
  //and othwerise holds the points maps
  const [pointsMaps, setPointsMaps] = useState<null | PointsMaps>(null)
  //useEffect to fetch the data needed for the pointsMaps,
  //use that data to populate the pointsMaps,
  //and then update the pointsMaps state if fetching and populatig succceed
  useEffect(() => {
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