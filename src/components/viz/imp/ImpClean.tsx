import "./Imp.css";
import useCanvasRefs from "../../../hooks/useCanvasRefs";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { ImpVarDisplay } from "./ImpVarDisplay";
import { usePointsMaps } from "../../../hooks/usePointsMaps";

export default function ImpClean({
  layout,
}: {
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined;
}) {
  //set up the canvas ref callbacks and get the state
  //tracking whether the canvases are rendered and thus ready
  //to be drawn on
  const [canvasRefsCallBackFactory, cavasesReady] = useCanvasRefs();

  const pointsMaps = usePointsMaps(layout);

  //TO DO
  //Modify usePointsMaps to add question text to each impVar

  //TO DO
  //define the setView handler
  //note these handlers are only invoked
  //in context where coordinates are not null
  //and images are loaded.  So no need
  //to test that these things are true
  //inside the handler

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
