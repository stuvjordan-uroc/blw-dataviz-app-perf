import { useEffect, useRef, useTransition } from "react";
import type { CoordinatesState } from "../useCoordinates";
import computeViewData from "./computeViewData";
import { drawPoints } from "./draw-points";

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
) {
  const [viewTransitionInProgress, startTransitionToNewView] = useTransition();
  //wrap the calls of the function that triggers the animation startTransitionToNewView
  //inside event handlers.  This this will cause "newViewPending" to switch to "true"
  //when the animation commences (so we can disable the control checkboxes), 
  // and allow user interaction with other controls (e.g. the tabs) during the animation
  //https://react.dev/reference/react/useTransition

  ///on initial render, set the requested view to unsplit 
  const requestedView = useRef<RequestedView>([null, null, null])
  ///on initial render, compute the viewData from whatever the current value of requestedView is
  const viewData = useRef<null | ViewData>(coordinates.data === null ? null : computeViewData(requestedView.current, coordinates.data))
  useEffect(() => {
    //update the viewData when coordinates are ready
    if (coordinates.data) {
      viewData.current = computeViewData(requestedView.current, coordinates.data)
    }
  }, [coordinates.data])
  return ({
    requestedView: requestedView,
    viewData: viewData,
    viewTransitionInProgress: viewTransitionInProgress,
    computeViewData: computeViewData,
    drawPointsOnCanvas: drawPoints
  })
}