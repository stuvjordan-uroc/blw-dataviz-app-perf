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
import Spinner from "../Spinner";
import useView from "../../hooks/useView";
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
  //set up the canvas refs, getting..
  // a callback to populate the refs (canvasRefsCallBackFactory),
  //a state tracking whether canvases are in the dom and ready to be drawn on (canvasesReady)
  //and the map (which is a ref) that takes each impVar to its canvas canvasMap
  const [canvasRefsCallBackFactory, canvasesReady, canvasMap] = useCanvases();

  //get a state tracking which view is being displayed, and trigger the canvases
  //to show the unsplit view once the coordinates and images are loaded and the
  //canvases are ready
  //const viewState = useView(coordinates, images, canvasesReady, canvasMap);

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
      />
      {/* <div className="imp-viz-vizarray">
        {questions.prompts.map(({ variable_name, question_text }) => (
          <div key={variable_name} className="impvar-display-root">
            <div>{question_text}</div>
            <div className="impvar-canvas-container">
              {(images.isLoading || coordinates.isLoading) && (
                <Spinner
                  canvasWidth={layoutConfig.vizWidth}
                  canvasHeight={canvasHeight}
                />
              )}
              <canvas
                width={layoutConfig.vizWidth}
                height={canvasHeight}
                ref={canvasRefsCallBackFactory(variable_name)}
              />
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
}
