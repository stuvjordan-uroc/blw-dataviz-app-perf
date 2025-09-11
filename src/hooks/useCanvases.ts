import { useEffect, useRef, useState } from "react";
import * as createjs from 'createjs-module'
import type { PointsViews } from "../../build-data";
import type { CoordinatesState } from "./useCoordinates";
import type { ImageState } from "./use-circle-images";

interface PointsViewsAndBitMaps {
  pointsViews: PointsViews,
  bitMapsNoParty: createjs.Bitmap[],
  bitMapsParty: createjs.Bitmap[]
}
type Points = [
  string[],//response group
  [
    number, //wave
    null | [
      string,  //party group as string
      PointsViewsAndBitMaps //see above
    ][]
  ][]
][]



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
  const canvasMap = useRef<null | Map<string, { node: HTMLCanvasElement, stage: createjs.Stage, points: Points }>>(null);
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
          points: [] //points starts as an empty array.  We'll run a useEffect below to populate it when the data we need is ready
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
        const dataAtImpVar = coordinates.data[impVar]
        //set the current value of the canvases map based on the data...
        map.set(impVar, {
          ...val,
          points: dataAtImpVar.points.map(([rg, unMapAtRg]) => ([
            rg,
            unMapAtRg.map(([wave, unMapAtWave]) => ([
              wave,
              unMapAtWave === null ? null : unMapAtWave.map(([pg, pointsViews]) => {
                //at the given rg-wave-pg...
                //construct the party string
                const partyString = pg.join("-")
                //get a reference to the image for the "none" circle
                const noPartyImage = images.data.get("none")
                //get a reference to the image for the circle for the current pg
                const partyImage = images.data.get(partyString)
                //return the entry for the current rg-wave-pg
                return ([
                  partyString,
                  {
                    //coordinate data for the points at this rg-wave-pg
                    pointsViews: pointsViews,
                    //bitmaps that will be used to represent points at this rg-wave-pg in non-byParty views
                    bitMapsNoParty: noPartyImage ? pointsViews.unsplit.map(() => new createjs.Bitmap(noPartyImage)) : [],
                    //bitmaps that will  used to represent points at this rg-wave-pg in the byParty views
                    bitMapsParty: partyImage ? pointsViews.unsplit.map(() => new createjs.Bitmap(partyImage)) : [],
                  }
                ])
              })
            ]))
          ]))
        })
      })
      //NEXT STEP: draw the initial unsplit view on the canvas
      setCanvasesReady(true)
    }
  }, [coordinates, images])

  return [canvasRefCallBackFactory, canvasesReady, canvasMap] as [
    (impVarName: string) => (node: HTMLCanvasElement) => () => void,
    boolean,
    React.RefObject<Map<string, {
      node: HTMLCanvasElement;
      stage: createjs.Stage;
      points: Points;
    }> | null>
  ]
}