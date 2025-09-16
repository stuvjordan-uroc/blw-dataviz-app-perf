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
//components
import useView, { type RequestedView } from "../../hooks/use-view";
import ImpVizArray from "./ImpVizArray";
import Controls from "./Controls";

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
  function updateViewHandler(newRequestedView: RequestedView) {
    if (coordinates.data && canvasMap.current && images.data) {
      //previousViewData
      const prevViewData = view.viewData.current;
      //first we mutate the refs holding the
      //current requested view, and the current viewData
      view.requestedView.current = newRequestedView;
      view.viewData.current = view.computeViewData(
        newRequestedView,
        coordinates.data
      );
      //By doing so, we cause the vizes that are off screen to
      //instantly switch to the new view.
      // (Logic for that is in the ImpVizArray component, which uses intersectionObserver
      // API to manage views for the out-of-frame canvases)

      //having done that, we now need to run code that causes the canvases that are visible
      //to transition to the new view
      const prevNoPartyOpacity = prevViewData?.noPartyOpacity;
      const newNoPartyOpacity = view.viewData.current.noPartyOpacity;
      const visibleCanvases = canvasMap.current
        .entries()
        .filter(([, { isVisible }]) => isVisible)
        .toArray();

      canvasMap.current.forEach(({ node, isVisible }, impVar) => {
        if (isVisible) {
          //node is a canvas that is currently in-view
          const prevCoordinatesAtImpVar = prevViewData?.coordinates.get(impVar);
          const newCoordinatesAtImpVar =
            view.viewData.current?.coordinates.get(impVar);
          if (
            prevNoPartyOpacity &&
            newNoPartyOpacity &&
            prevCoordinatesAtImpVar &&
            newCoordinatesAtImpVar
          ) {
            view.transitionView(
              node,
              prevNoPartyOpacity,
              newNoPartyOpacity,
              prevCoordinatesAtImpVar,
              newCoordinatesAtImpVar,
              images.data
            );
          }
        }
      });
    }
  }

  //render
  if (coordinates.didError || images.didError) {
    return <div>Something went wrong</div>;
  }
  //if we get here, coordinates and images are each either loading or ready
  const canvasHeight =
    layoutConfig.labelHeight +
    (layoutConfig.waveHeight + layoutConfig.labelHeight) *
      dataMeta.waves.length;
  return (
    <div className="imp-viz-root">
      {canvasesReady && coordinates.data !== null && images.data !== null && (
        <Controls
          requestedView={view.requestedView}
          patchRequestedView={view.patchRequestedView}
          updateViewHandler={updateViewHandler}
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
