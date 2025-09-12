import { useEffect, useRef, useState } from "react";
import * as createjs from 'createjs-module'
import type { PointsViews } from "../../build-data";
import type { CoordinatesState } from "./useCoordinates";
import type { ImageState } from "./use-circle-images";

interface PointGroup {
  rg: string[];
  wave: number;
  pg: string[];
  coordinates: PointsViews;
  bitMapsNoParty: createjs.Bitmap[]
  bitMapsParty: createjs.Bitmap[]
}



export default function useCanvases() {
  /*
  Create a map that takes each impVar to an object like this:
  {
    node: HTMLCanvasNode, //the actual canvas node for the impVar
    stage: createjs.Stage, //createjs stage instance used to draw on the canvas
    points: Points //defined above, commentary below
  }
  The points property holds (1) the arrays of createjs bitmaps needed to render
  a point for each response at a given response group / wave / party group,
  and (2) the data needed to know where in the canvas to position these bitmaps
  depending on the selected by the user
  */
  const canvasMap = useRef<
    null |
    Map<
      string,
      HTMLCanvasElement
    >
  >(null);
  //function used by canvas nodes to get the vizRefs map so they can put themselves into the map)
  const getCanvasMap = () => {
    //If the ref has been created, return it
    if (canvasMap.current) {
      return canvasMap.current
    }
    //Otherwise initialize the ref...
    canvasMap.current = new Map()
    //...and return the new map
    return canvasMap.current;
  };
  //factory that creates functions for canvas nodes to use as their ref callbacks
  //Techniqued used here for creating
  //a Mapped collection of DOM nodes adapted from
  //https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
  const canvasRefCallBackFactory = (impVarName: string) => (
    (node: HTMLCanvasElement) => {
      const canvasMap = getCanvasMap();
      canvasMap.set(
        impVarName,
        node
      );
      return (() => {
        canvasMap.delete(impVarName)
      })
    }
  )
  //create state tracking whether canvases are ready
  //to be drawn on
  const [canvasesReady, setCanvasesReady] = useState<boolean>(false)
  //useEffect runs at commit after all refs have been hydrated
  //so setCanvasesReady to true in a useEffect
  useEffect(() => {
    setCanvasesReady(true)
  })

  return [canvasRefCallBackFactory, canvasesReady, canvasMap] as [
    (impVarName: string) => (node: HTMLCanvasElement) => () => void,
    boolean,
    React.RefObject<Map<string, HTMLCanvasElement> | null>
  ]
}