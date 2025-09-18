//css
import "./Imp.css";
//types
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../config/layouts-types";
//data
import circles from "../../config/circles.json";
import questions from "../../data/questions.json";
import dataMeta from "../../data/data-meta.json";
//hooks
import { useCoordinates } from "../../hooks/useCoordinates";
import { useCircleImages } from "../../hooks/use-circle-images";
import useCanvases from "../../hooks/useCanvases";
import { useRef } from "react";
//components
import useView, { type RequestedView } from "../../hooks/use-view";
import ImpVizArray from "./ImpVizArray";
import Controls from "./Controls";
import { useLayoutEffect } from "react";
import useCanvasOffsets from "../../hooks/use-canvas-offsets";
//modules

export default function Imp({
  breakPoint,
  layoutConfig,
}: {
  breakPoint: BreakpointKey;
  layoutConfig: BreakpointConfig;
}) {
  //fetch coordinates and get state tracking coordinates and their status (loading/error)
  const coordinates = useCoordinates(`/coordinates/viz-${breakPoint}.json`);

  //load images and get state images and their status (loading/error)
  const images = useCircleImages(
    new Map(
      (circles.fillByPartyGroup as [string[], string][]).map(
        ([partyGroup, _fill]) =>
          [
            partyGroup.join("-"),
            "/img/" + breakPoint + "-" + partyGroup.join("-") + ".png",
          ] as [string, string]
      )
    )
  );

  //set up the canvases
  const [canvasRefsCallBackFactory, canvasesReady, canvasMap] = useCanvases();

  //set up the view
  //note...the properties requestedView and ViewData returned by the following call
  //are refs, NOT STATE.
  //so they have to be updated and kept in sync manually in the
  //various event handlers!
  const view = useView(coordinates);
  function drawViewHandler(canvasNode: HTMLCanvasElement) {
    const currentViewData = view.viewData.current;
    const currentImageMap = images.data;
    const canvasCoordinates = currentViewData?.coordinates.get(canvasNode.id);
    if (currentViewData && currentImageMap && canvasCoordinates) {
      view.drawPointsOnCanvas(
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
      view.setRequestedView((prevRequestedView) => {
        //compute the new requested view
        const newRequestedView = view.patchRequestedView(
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
        view.viewData.current = view.computeViewData(
          newRequestedView,
          coordinates.data
        );
        const newViewData = view.viewData.current;

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
            view.drawPointsOnCanvas(
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

  //compute total height of each canvas (needed for setting each canvas's height property)
  const canvasHeight =
    layoutConfig.labelHeight +
    (layoutConfig.waveHeight + layoutConfig.labelHeight) *
      dataMeta.waves.length;

  //render
  if (coordinates.didError || images.didError) {
    return <div>Something went wrong</div>;
  }
  //if we get here, coordinates and images are each either loading or ready

  return (
    <div className="imp-viz-root">
      {canvasesReady && coordinates.data !== null && images.data !== null && (
        <Controls
          requestedView={view.requestedView}
          updateViewHandler={updateView}
          controlsActive={!view.viewTransitionPending}
        />
      )}
      <ImpVizArray
        varsAndQs={questions.prompts.map(
          ({ variable_name, question_text }) => ({
            varName: variable_name,
            questionText: question_text,
          })
        )}
        imagesLoading={images.isLoading}
        coordinatesLoading={coordinates.isLoading}
        vizWidth={layoutConfig.vizWidth}
        vizHeight={canvasHeight}
        canvasRefsCallBackFactory={canvasRefsCallBackFactory}
        canvasMap={canvasMap}
        drawViewHandler={drawViewHandler}
        viewDataReady={view.viewDataReady}
        clearViewHandler={(impVar: string) => {
          if (canvasMap.current) {
            const ctx = canvasMap.current.get(impVar)?.node.getContext("2d");
            if (ctx) {
              ctx.clearRect(0, 0, layoutConfig.vizWidth, canvasHeight);
            }
          }
        }}
      />
    </div>
  );
}
