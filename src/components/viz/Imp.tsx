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
import useView from "../../hooks/use-view";
import ImpVizArray from "./ImpVizArray";

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
      {canvasesReady ?? <div>Controls here</div>}
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
