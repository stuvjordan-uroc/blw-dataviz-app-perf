import { useEffect, useRef, useTransition, useState } from "react";
import type { CoordinatesState } from "../useCoordinates";
import computeViewData from "./computeViewData";
import { drawPoints } from "./draw-points";
import { patchRequestedView, type RequestedView } from "./requested-view";
import type { ViewData } from "./computeViewData";
import { transitionViews } from "./transition-view";

export type { ViewData, RequestedView };

export default function useView(coordinates: CoordinatesState) {
  ///on initial render, set the requested view to unsplit
  const [requestedView, setRequestedView] = useState<RequestedView>({
    response: false,
    wave: false,
    party: false,
  });
  const [viewTransitionPending, setViewTransitionPending] = useState<boolean>(false)
  const [viewDataReady, setViewDataReady] = useState<boolean>(false)
  ///on initial render, compute the viewData from whatever the current value of requestedView is
  const viewData = useRef<null | ViewData>(
    coordinates.data === null
      ? null
      : computeViewData(requestedView, coordinates.data)
  );
  useEffect(() => {
    //update the viewData when coordinates are ready
    if (coordinates.data) {
      viewData.current = computeViewData(
        requestedView,
        coordinates.data
      );
      setViewDataReady(true)
    }
  }, [coordinates.data]);
  return {
    requestedView: requestedView,
    viewTransitionPending: viewTransitionPending,
    setViewTransitionPending: setViewTransitionPending,
    setRequestedView: setRequestedView,
    viewData: viewData,
    viewDataReady: viewDataReady,
    computeViewData: computeViewData,
    drawPointsOnCanvas: drawPoints,
    patchRequestedView: patchRequestedView,
    transitionViews: transitionViews,
  };
}
