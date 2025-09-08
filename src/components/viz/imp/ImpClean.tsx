import "./Imp.css";
import useCanvasRefs from "../../../hooks/useCanvasRefs";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { ImpVarDisplay } from "./ImpVarDisplay";
import { usePointsMaps } from "../../../hooks/usePointsMaps";
import questions from "../../../data/questions.json";

export default function ImpClean({
  layout,
}: {
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined;
}) {
  //set up the canvas ref callbacks and get the state
  //tracking whether the canvases are rendered and thus ready
  //to be drawn on
  const [canvasRefsCallBackFactory, cavasesReady] = useCanvasRefs();

  const pointsMaps = usePointsMaps(layout?.breakPointKey);
  const pointsMapsPlusQuestions = pointsMaps
    ? new Map(
        pointsMaps.entries().map(([impVarName, pointsMap]) => {
          const q = questions.prompts.find(
            (v) => v.variable_name === impVarName
          );
          if (!q && import.meta.env.DEV) {
            console.log(
              `WARNING: build-data produced a variable with name ${impVarName}, but there is no variable in questions.json with that name.`
            );
          }
          return [
            impVarName,
            {
              questions: q?.question_text,
              points: pointsMap,
            },
          ];
        })
      )
    : null;

  //TO DO
  //add loading state with spinner while data is loading

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
      {cavasesReady && pointsMapsPlusQuestions && (
        <div>Canvases and images ready! Render controls here!</div>
      )}
      <div className="imp-viz-vizarray">
        {pointsMapsPlusQuestions &&
          layout &&
          pointsMapsPlusQuestions
            .entries()
            .map(([impVarName, atImpVar]) => (
              <ImpVarDisplay
                key={impVarName}
                impVarQuestionText={atImpVar.questions}
                layout={layout}
                vizRefCallBack={canvasRefsCallBackFactory(impVarName)}
              />
            ))}
      </div>
    </div>
  );
}
