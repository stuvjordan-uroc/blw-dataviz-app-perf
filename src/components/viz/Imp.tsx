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
import useDrawingData from "../../hooks/useDrawingData";
//components
import Spinner from "../Spinner";

export default function Imp({
  breakPoint,
  layoutConfig,
}: {
  breakPoint: BreakpointKey;
  layoutConfig: BreakpointConfig;
}) {
  //fetch coordinates along with states tracking fetch status (loading/error)
  const coordinates = useCoordinates(`/coordinates/viz-${breakPoint}.json`);

  //state tracking the images and the status of their loading
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
  /* 
  useCanvases uses useRef to create a map which takes each impVar name to an object
  The object cooresponding to each impVar is like this:
  {
    node: HTMLCanvasNode //the html node for the canvas
    stage: createjs.Stage //createjs Stage for drawing stuff on the canvas
    points: 
  }
  */
  //canvas ref callbacks,
  //state tracking whether the canvases are rendered and thus ready to be drawn on
  //map taking each impVar to its canvas node and a createjs Stage for drawing
  const [canvasRefsCallBackFactory, canvasesReady, canvasMap] = useCanvases();

  //create a data structure for drawing on the canvases
  const forDrawing = useDrawingData(
    coordinates,
    images,
    canvasesReady,
    canvasMap
  );
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
      <div>Controls here</div>
      <div className="imp-viz-vizarray">
        {questions.prompts.map(({ variable_name, question_text }) => (
          <div className="impvar-display-root">
            <div>{question_text}</div>
            <div className="impvar-canvas-container">
              {(coordinates.isLoading || images.isLoading) ?? <Spinner />}
              <canvas
                width={layoutConfig.vizWidth}
                height={canvasHeight}
                ref={canvasRefsCallBackFactory(variable_name)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
