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
import Controls from "./Controls";
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
  const view = useView(coordinates, images, canvasMap);

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
      <div className="imp-prefix">
        How important are these characteristics for democratic government?
      </div>
      {canvasesReady && coordinates.data !== null && images.data !== null && (
        <Controls
          requestedView={view.requestedView}
          updateViewHandler={view.updateView}
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
        waveHeight={layoutConfig.waveHeight}
        labelHeight={layoutConfig.labelHeight}
        partyGap={layoutConfig.partyGap}
        canvasRefsCallBackFactory={canvasRefsCallBackFactory}
        canvasMap={canvasMap}
        drawViewHandler={view.drawView}
        viewDataReady={view.viewDataReady}
        requestedView={view.requestedView}
        coordinates={coordinates}
      />
    </div>
  );
}
