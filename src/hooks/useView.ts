import { useEffect, useState } from "react";
import type { ImageState } from "./use-circle-images";
import type { CoordinatesState } from "./useCoordinates";
import createjs from "createjs-module";

export type DrawingData = Map<string, {
  stage: createjs.Stage | undefined;
  pointGroups: {
    bitMapsNoParty: createjs.Bitmap[];
    bitMapsParty: createjs.Bitmap[];
    rg: string[];
    wave: number;
    pg: string[];
    coordinates: PointsViews;
  }[];
}> | null

export type ViewState = null |
["unsplit", null] |
["collapsed" | "expanded", "byResponse" | "byResponseAndWave" | "byResponseAndParty" | "byResponseAndWaveAndParty"]

export default function useView(
  coordinates: CoordinatesState,
  images: ImageState,
  canvasesReady: boolean,
  canvasMap: React.RefObject<Map<string, HTMLCanvasElement> | null>
) {
  const [view, setView] = useState<ViewState>(null)
  const drawingData = coordinates.data === null || images.data === null
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
        })
        return ([
          impVar,
          {
            stage: stage,
            pointGroups: pointGroupsWithAssets
          }
        ])
      })
    )
  //useEffect to set the view to unsplit when canvases are ready
  useEffect(() => {
    //this runs on first render, and on ever re-render when 
    //coordinates.data, images.data, or canvasesReady has changed.

    //on first render, view will be null, and we don't want to change
    //that if coordinates.data or images.data is null, or if canvasesReady is false
    //But if on first render, coordinates.data and images.data are defined, and
    //canvasesReady is true, we want to switch to the unsplit view

    //on re-render, where coordinates.data, images.data, or canvasesReady
    //has changed, we have gone from a state where some data need to draw
    //wasn't loaded to a state where that data is loaded,
    //or we've gone from a state where canvases weren't ready for drawing
    //to a state where they are.
    //Either way, view will be null, and we want to set it to unsplit.
    if (coordinates.data && images.data && canvasesReady && drawingData) {
      setView(() => {
        //first draw the unsplit views on the canvas
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
        //now set the view to unsplit
        return (["unsplit", null])
      })
    }

  }, [coordinates.data, images.data, canvasesReady])
  return view
}