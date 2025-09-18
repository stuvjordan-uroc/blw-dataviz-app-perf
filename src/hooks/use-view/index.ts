import { useEffect, useRef, useState } from "react";
import type { CoordinatesState } from "../useCoordinates";
import computeViewData from "./computeViewData";
import { drawPoints } from "./draw-points";
import { patchRequestedView, type RequestedView } from "./requested-view";
import type { ViewData } from "./computeViewData";
import type { ImageState } from "../use-circle-images";

export type { ViewData, RequestedView };

export default function useView(
  coordinates: CoordinatesState,
  images: ImageState,
  canvasMap: React.RefObject<Map<string, {
    node: HTMLCanvasElement;
    isVisible: boolean;
  }> | null>
) {
  ///on initial render, set the requested view to unsplit
  const [requestedView, setRequestedView] = useState<RequestedView>({
    response: false,
    wave: false,
    party: false,
  });
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

  function drawView(canvasNode: HTMLCanvasElement) {
    const currentViewData = viewData.current;
    const currentImageMap = images.data;
    const canvasCoordinates = currentViewData?.coordinates.get(canvasNode.id);
    if (currentViewData && currentImageMap && canvasCoordinates) {
      drawPoints(
        currentViewData.partyOpacity,
        currentViewData.noPartyOpacity,
        canvasCoordinates,
        currentImageMap,
        canvasNode
      );
    }
  }

  function updateView(viewKey: keyof RequestedView, newVal: boolean) {
    const currentCanvasMap = canvasMap.current;
    if (coordinates.data && currentCanvasMap && images.data) {
      setRequestedView((prevRequestedView) => {
        //compute the new requested view
        const newRequestedView = patchRequestedView(
          prevRequestedView,
          viewKey,
          newVal
        );
        //get the coordinates for the old view
        //commented out becase we're not longer
        //trying to animate the views
        //const prevViewData = view.viewData.current;
        //update the ref holding coordinates
        //to bring it into line with the new requested view
        viewData.current = computeViewData(
          newRequestedView,
          coordinates.data
        );
        const newViewData = viewData.current;

        /* 
        Changing the requested view from a ref to a state
        broke the intersection observer code that was
        transitioning the views for the off screen canvases
        As a placeholder, we transition all the canvases
        immediately here, and delet the old code
        that was only transitioning the visible canvases
        */

        currentCanvasMap.forEach(({ node }, impVar) => {
          const pointGroups = newViewData.coordinates.get(impVar);
          if (pointGroups) {
            drawPoints(
              newViewData.partyOpacity,
              newViewData.noPartyOpacity,
              pointGroups,
              images.data,
              node
            );
          }
        });
        return newRequestedView;
      });
    }
  }


  //need to return...

  //drawViewHandler ... depends on images.data, 
  //updateView ... depends on canvasMap.current, coordinates.data, images.data
  //requestedView
  //viewDataReady

  return {
    requestedView: requestedView,
    viewDataReady: viewDataReady,
    drawView: drawView,
    updateView: updateView
  };
}


