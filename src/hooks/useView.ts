import { useEffect, useState } from "react";
import type { ImageState } from "./use-circle-images";
import type { CoordinatesState } from "./useCoordinates";
import type { PointsViews } from "../../build-data";
import { drawPoints } from "./transitionView";

export type DrawingDataAtImpVar = {
  drawingContext: null | CanvasRenderingContext2D
  canvasWidth: null | number,
  canvasHeight: null | number,
  noPartyOpacity: number,
  partyOpacity: number,
  pointGroups: {
    imagesNoParty: {
      x: number,
      y: number
    }[];
    imagesParty: {
      x: number,
      y: number
    }[];
    rg: string[];
    wave: number;
    pg: string[];
    coordinates: PointsViews;
  }[];
}

export type DrawingData = Map<string, DrawingDataAtImpVar> | null

export interface ViewState {
  pending: boolean,
  view:
  | [null, null, null] //unsplit
  | ["expanded" | "collapsed", null, null] //by response expanded
  | ["expanded" | "collapsed", "wave", null] //byResponseAndWave expanded
  | ["expanded" | "collapsed", null, "party"] //byResponseAndParty expanded
  | ["expanded" | "collapsed", "wave", "party"] //byResponseAndWaveAndParty
}

export default function useView(
  coordinates: CoordinatesState,
  images: ImageState,
  canvasesReady: boolean,
  canvasMap: React.RefObject<Map<string, HTMLCanvasElement> | null>
) {
  const [view, setView] = useState<ViewState>({ pending: true, view: [null, null, null] })
  const drawingData = coordinates.data === null || images.data === null
    ? null
    : new Map(
      coordinates.data.entries().map(([impVar, { pointGroups }]) => {
        const noPartyImage = images.data.get("none");
        const drawingContext = canvasMap.current && canvasMap.current.get(impVar) ? canvasMap.current.get(impVar)!.getContext('2d') : null;
        const canvasWidth = canvasMap.current && canvasMap.current.get(impVar) ? canvasMap.current.get(impVar)!.width : null;
        const canvasHeight = canvasMap.current && canvasMap.current.get(impVar) ? canvasMap.current.get(impVar)!.height : null;
        const pointGroupsWithAssets = pointGroups.map((pointGroup) => {
          const partyImage = images.data.get(pointGroup.pg.join("-"));
          return {
            ...pointGroup,
            imagesNoParty: noPartyImage
              ? pointGroup.coordinates.unsplit.map((point) => ({
                x: point.x,
                y: point.y
              }))
              : [],
            imagesParty: partyImage
              ? pointGroup.coordinates.expanded.byResponseAndParty.map((point) => ({
                x: point.x,
                y: point.y
              }))
              : [],
          };
        })
        return ([
          impVar,
          {
            drawingContext: drawingContext,
            canvasHeight: canvasHeight,
            canvasWidth: canvasWidth,
            partyOpacity: 0,
            noPartyOpacity: 0,
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
        //draw the unsplit views on the canvas
        drawingData.forEach(({ drawingContext, canvasWidth, canvasHeight, pointGroups, ...dataAtImpVar }) => {
          if (drawingContext && canvasWidth && canvasHeight) {
            //set the opacities and image coordinates for the unsplit view
            dataAtImpVar.noPartyOpacity = 1;
            dataAtImpVar.partyOpacity = 0;
            pointGroups.forEach(({ imagesNoParty, coordinates }) => {
              //set the coordinates for the noParty images
              imagesNoParty.forEach((image, idx) => {
                image.x = coordinates.unsplit[idx].x;
                image.y = coordinates.unsplit[idx].y;
              })
              //don't bother with imagesNoParty, because we set partyOpacity to zero
            })
            //draw the images
            drawPoints({ drawingContext, canvasWidth, canvasHeight, pointGroups, ...dataAtImpVar }, images.data)
          }
        })
        //now set the view to unsplit
        return ({ pending: false, view: [null, null, null] })
      })
    }
  }, [coordinates.data, images.data, canvasesReady])
  return view
}