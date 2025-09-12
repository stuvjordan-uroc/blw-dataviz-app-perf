import { useEffect } from "react";
import createjs from "createjs-module";
import type { SegmentViewsUnMapped, PointsViews } from "../../build-data";
import questions from "../data/questions.json"
import type { CoordinatesState } from "./useCoordinates";
import type { ImageState } from "./use-circle-images";
export default function useDrawingData(
  coordinates: CoordinatesState,
  images: ImageState,
  canvasesReady: boolean,
  canvasMap: React.RefObject<Map<string, HTMLCanvasElement> | null>
) {
  const [drawingData, setDrawingData] = useState(null)
  const drawingData = coordinates.data === null || images.data === null || !canvasesReady
    ? null
    :
    //TODO define handlers for drawing

    //draw the initial view
    useEffect(() => {
      if (coordinates.data && images.data && canvasesReady) {
        const newDrawingData = new Map(
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
        drawingData.forEach(({ stage, pointGroups }) => {
          if (stage) {
            //clear the stage
            stage.clear()
            //loop through the pointGroups
            pointGroups.forEach(({ bitMapsNoParty, coordinates }) => {
              //add the no-party bitmaps for the current group to the stage
              stage.addChild(...bitMapsNoParty)
              //set the bitmaps x-s and y-s to the unsplit view coordinates
              bitMapsNoParty.forEach((bm, bmIdx) => {
                bm.set({
                  x: coordinates.unsplit[bmIdx].x,
                  y: coordinates.unsplit[bmIdx].y
                })
              })
            })
            //update the stage
            stage.update()
          }
        })
      }
    }, [coordinates, images, canvasesReady])
  //return the drawing data
  return drawingData
}