import { useEffect, useRef, useState } from "react";
import * as createjs from 'createjs-module'
import type { PointsViews, SegmentViewsUnMapped } from "../../build-data";
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



export default function useCanvases(coordinates: CoordinatesState, images: ImageState) {
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
      {
        node: HTMLCanvasElement,
        stage: createjs.Stage,
        pointGroups: PointGroup[]
      }
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
        {
          node: node, //use the node to populate the node propery
          stage: new createjs.Stage(node), //create the canvas stage
          pointGroups: [] as PointGroup[] //points starts as an empty array.  We'll run a useEffect below to populate it when the data we need is ready
        }
      );
      return (() => {
        canvasMap.delete(impVarName)
      })
    }
  )
  //create state tracking whether canvases are ready
  //to be drawn on
  const [canvasesReady, setCanvasesReady] = useState<boolean>(false)

  //useEffect to populate the points properties of the refs once the data from coordinates and images are ready
  useEffect(() => {
    //only when coordinates.data and images.data are not null do we have the data we need!
    if (coordinates.data && images.data) {
      //hydrate the canvas map with the data
      canvasMap.current?.forEach((val, impVar, map) => {
        //get the coordinate data at the current impVar
        const dataAtImpVar = coordinates.data.get(impVar)
        //set the current value of the canvases map based on the data...
        if (dataAtImpVar) {
          const noPartyImage = images.data.get("none")
          map.set(impVar, {
            ...val,
            pointGroups: dataAtImpVar.pointGroups.map(pointGroup => {
              const partyImage = images.data.get(pointGroup.pg.join("-"))
              return ({
                ...pointGroup,
                bitMapsNoParty: noPartyImage ? pointGroup.coordinates.unsplit.map(() => new createjs.Bitmap(noPartyImage)) : [],
                bitMapsParty: partyImage ? pointGroup.coordinates.unsplit.map(() => new createjs.Bitmap(partyImage)) : []
              })
            })
          })
        }
      })
      //draw the initial unsplit view on each canvas
      canvasMap.current?.forEach(({ node, stage, pointGroups }) => {
        //empty the display list
        stage.removeAllChildren()
        //at each pointGroup...
        pointGroups.forEach((pointGroup) => {
          //set the x and y properties of the noparty bitmaps
          //to the coordinates at the unsplit view
          pointGroup.bitMapsNoParty.forEach((bm, bmIdx) => {
            bm.set({ x: pointGroup.coordinates.unsplit[bmIdx].x, y: pointGroup.coordinates.unsplit[bmIdx].y })
          })
          //add those bitmaps to the stage
          stage.addChild(...pointGroup.bitMapsNoParty)
        })
        //all bitmaps are added to the stage, so draw it!
        stage.update()
      })
      setCanvasesReady(true)
    }
  }, [coordinates, images])

  return [canvasRefCallBackFactory, canvasesReady, canvasMap] as [
    (impVarName: string) => (node: HTMLCanvasElement) => () => void,
    boolean,
    React.RefObject<Map<string, {
      node: HTMLCanvasElement;
      stage: createjs.Stage;
      pointGroups: PointGroup[];
    }> | null>
  ]
}