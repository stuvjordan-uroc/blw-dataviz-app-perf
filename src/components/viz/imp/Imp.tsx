//css
import "./Imp.css";
//modules
import createjs from "createjs-module";
//types
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import type { PointsViews } from "../../../../build-data";
//data
import circles from "../../../config/circles.json";
import questions from "../../../data/questions.json";
//hooks
import { useCoordinates } from "../../../hooks/useCoordinates";
import { useCircleImages } from "../../../hooks/use-circle-images";
import useCanvases from "../../../hooks/useCanvases";
//component
import ImpVarDisplay from "./ImpVarDisplay";

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
  const forDrawing =
    coordinates.data === null || images.data === null || !canvasesReady
      ? null
      : new Map(
          coordinates.data.entries().map(([impVar, { pointGroups }]) => {
            const noPartyImage = images.data.get("none");
            const stage =
              canvasMap.current && canvasMap.current.get(impVar)
                ? new createjs.Stage(canvasMap.current.get(impVar)!)
                : undefined;
            const pointGroupsWithAssets = pointGroups.map((pointGroup) => {
              const partyImage = images.data.get(pointGroup.pg.join("-"));
              return {
                ...pointGroup,
                bitMapsNoParty: noPartyImage
                  ? pointGroup.coordinates.unsplit.map(
                      () => new createjs.Bitmap(noPartyImage)
                    )
                  : [],
                bitMapsParty: partyImage
                  ? pointGroup.coordinates.unsplit.map(
                      () => new createjs.Bitmap(partyImage)
                    )
                  : [],
              };
            });
            return [
              impVar,
              {
                question: questions.prompts.find(
                  (v) => v.variable_name === impVar
                )?.question_text,
                stage: stage,
                pointGroups: pointGroupsWithAssets,
              },
            ] as [
              string,
              {
                question: string | undefined;
                stage: createjs.Stage | undefined;
                pointGroups: {
                  bitMapsNoParty: createjs.Bitmap[];
                  bitMapsParty: createjs.Bitmap[];
                  rg: string[];
                  wave: number;
                  pg: string[];
                  coordinates: PointsViews;
                }[];
              },
            ];
          })
        );

  //render
  if (forDrawing) {
    return (
      <div className="imp-viz-root">
        <div>Controls here</div>
        <div className="imp-viz-vizarray">
          {forDrawing.entries().map(([impVarName, { question }]) => (
            <ImpVarDisplay
              key={impVarName}
              impVarQuestionText={question}
              layout={layoutConfig}
              vizRefCallBack={canvasRefsCallBackFactory(impVarName)}
            />
          ))}
        </div>
      </div>
    );
  }
  //if we get here, coordinates and/or images are loading or errored
  if (coordinates.didError || images.didError) {
    return <div>Something went wrong</div>;
  }
  return <div>Loading...</div>;
}
