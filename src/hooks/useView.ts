import { useEffect, useRef, useTransition } from "react";
import type { ImageState } from "./use-circle-images";
import type { CoordinatesState } from "./useCoordinates";
import { drawPoints, viewPropsAtRequestedView } from "./transitionView";


export type ViewDataAtImpVar = {
  noPartyOpacity: number,
  partyOpacity: number,
  pointGroups: {
    imageCoordinates: {
      x: number,
      y: number
    }[];
    rg: string[];
    wave: number;
    pg: string[];
  }[];
}

export interface ViewData {
  noPartyOpacity: number,
  partyOpacity: number,
  coordinates: Map<
    string,
    {
      rg: string[],
      wave: number,
      pg: string[],
      coordinates: { x: number, y: number }[]
    }[]
  >
}


export type RequestedView =
  | [null, null, null] //unsplit
  | ["expanded" | "collapsed", null, null] //by response expanded
  | ["expanded" | "collapsed", "wave", null] //byResponseAndWave expanded
  | ["expanded" | "collapsed", null, "party"] //byResponseAndParty expanded
  | ["expanded" | "collapsed", "wave", "party"] //byResponseAndWaveAndParty



export default function useView(
  coordinates: CoordinatesState,
  images: ImageState,
  canvasesReady: boolean,
  canvasMap: React.RefObject<Map<string, HTMLCanvasElement> | null>
) {
  const [newViewPending, startTransitionToNewView] = useTransition();
  //wrap the calls of the function that triggers the animation startTransitionToNewView
  //inside event handlers.  This this will cause "newViewPending" to switch to "true"
  //when the animation commences (so we can disable the control checkboxes), 
  // and allow user interaction with other controls (e.g. the tabs) during the animation
  //https://react.dev/reference/react/useTransition

  //on initial render, set the actual view (a ref) to unsplit (if the data needed to calculate the view exists)
  const viewProps = useRef<null | ViewData>(coordinates.data === null ? null : viewPropsAtRequestedView([null, null, null], coordinates.data))
  //useEffect to set the view to unsplit when canvases are ready
  useEffect(() => {
    //this runs on first render, and on ever re-render when 
    //coordinates.data, images.data, or canvasesReady has changed.

    //on first render, view will be null, and we don't want to change
    //that if coordinates.data or images.data is null, or if canvasesReady is false
    //But if on first render, coordinates.data and images.data are defined, and
    //canvasesReady is true, we want to switch to the view defined by viewProps

    //viewProps is a ref, so that means that its value will
    //be remembered across renders!
    if (viewProps.current && images.data && canvasesReady && canvasMap.current) {
      const currentNoPartyOpacity = viewProps.current.noPartyOpacity
      const currentPartyOpacity = viewProps.current.partyOpacity
      viewProps.current.coordinates.forEach((value, impVarName) => {
        const canvasNode = canvasMap.current?.get(impVarName)
        if (canvasNode) {
          drawPoints(
            currentPartyOpacity,
            currentNoPartyOpacity,
            value as {
              rg: string[];
              wave: number;
              pg: string[];
              coordinates: {
                x: number;
                y: number;
              }[];
            }[],
            images.data,
            canvasNode
          )
        }
      })
    }
  }, [coordinates.data, images.data, canvasesReady])
  return [viewProps, newViewPending, startTransitionToNewView]
}