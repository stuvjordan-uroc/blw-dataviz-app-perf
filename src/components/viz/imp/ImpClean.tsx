import "./Imp.css";
import useCanvasRefs from "../../../hooks/useCanvasRefs";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import circles from "../../../config/circles.json";
import useCircleImages from "../../../hooks/useCircleImages";
import {
  useCoordinates,
  type Coordinates,
} from "../../../hooks/useCoordinates";
import { ImpVarDisplay } from "./ImpVarDisplay";

export default function ImpClean({
  layout,
}: {
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined;
}) {
  //set up the canvas ref callbacks and get the state
  //tracking whether the canvases are rendered and thus ready
  //to be drawn on
  const [canvasRefsCallBackFactory, cavasesReady] = useCanvasRefs();

  //create an array that maps each party group (collected from circles.json),
  //to a path an and id for the image element for the circle representing
  //that party group,
  //create a state that tracks how many of the circle images are loaded
  //and create a handler to pass to each image that updates that state when the image
  //loads
  const [images, numImagesReady, imageOnLoadHander] = useCircleImages(
    (circles.fillByPartyGroup as [string[], string][]).map(([pg, _fill]) => pg),
    layout
  );

  //load the coordinates
  const coordinates = useCoordinates(layout);

  //define the setView handler
  //note these handlers are only invoked
  //in context where coordinates are not null
  //and images are loaded.  So no need
  //to test that these things are true
  //inside the handler
  const setView = (
    oldView: null | string,
    newView: null | string,
    coordinates: Coordinates,
    images: [string[], HTMLImageElement][]
  ) => {};

  //TO DO
  //run a useEffect that...
  //checks if numImagesReady === images.length
  //and if so, invokes the setView handler to
  //draw the unsplit view.

  //render
  return (
    <div className="imp-viz-root">
      {cavasesReady && images.length === numImagesReady && (
        <div>Canvases and images ready! Render controls here!</div>
      )}
      <div className="imp-viz-vizarray">
        {images.map(([_partyGroup, { path, id }]) => (
          <img
            key={id}
            id={id}
            src={path ?? ""}
            style={{
              display: "none",
            }}
            onLoad={imageOnLoadHander}
          />
        ))}
        {coordinates &&
          layout &&
          Object.entries(coordinates).map(([impVarName, coordAtImpVar]) => (
            <ImpVarDisplay
              key={impVarName}
              impVarQuestionText={coordAtImpVar.questionText}
              layout={layout}
              vizRefCallBack={canvasRefsCallBackFactory(impVarName)}
            />
          ))}
      </div>
    </div>
  );
}
