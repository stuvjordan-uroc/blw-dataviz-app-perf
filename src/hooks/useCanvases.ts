/*
sets up refs for the canvases,
images to be drawn on the canvases
state to track whether canvases are ready to be drawn on

returns the handles we need for these things
*/
import { useRef, useCallback, useState } from "react";
import type { BreakpointConfig, BreakpointKey } from "../config/layouts-types";
import { setAllunsplit } from "../view-setters/set-points-to";

export default function useCanvases(
  partyGroupToImagePathMap: Map<string[], string>,
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined
) {
  //create a ref that will (once the viz-es are rendered) hold
  //a map that takes the each impVar to the canvas node
  //in which the viz for that impVar is rendered
  //We'll use these refs to draw on the canvases
  //technique copied from https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
  const vizRefs = useRef<null | Map<string, HTMLCanvasElement>>(null);
  //function to get the vizRefs map in whatever it's current state is.
  // (Used by canvas nodes to get the vizRefs map so they can put themselves into the map)
  const getVizRefMap = () => {
    //initialize the map if the viz nodes have not been rendered
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!vizRefs.current) {
      vizRefs.current = new Map();
    }
    //now return the map
    return vizRefs.current;
  };
  //factory that creates functions for canvas nodes to use as their ref callbacks
  const vizRefCallBackFactory = useCallback((impVarName: string) => {
    return (node: HTMLCanvasElement) => {
      const vizRefMap = getVizRefMap();
      vizRefMap.set(impVarName, node);
      //update vizReadyMap
      //setVizReadyMap((prevVizReadyMap) => {
      //  const newVizReadyMap = new Map(prevVizReadyMap.entries());
      //  newVizReadyMap.set(impVarName, true);
      //  return newVizReadyMap;
      //});
      //cleanup when node is removed from dom
      return () => {
        vizRefMap.delete(impVarName);
      };
    };
  }, []);
  //set up state that tracks whether the canvases are rendered and
  // circle images are loaded and thus the canvases are ready
  //to receive input from controls.
  //rendering of controls will be conditional on this state being true.
  const [canvasesReady, setCanvasesReady] = useState(false);
  //create the images to be used in the viz-es
  const partyGroupToImages = partyGroupToImagePathMap
    .entries()
    .map((partyGroup, pathToImage) => [
      partyGroup,
      {
        image: new Image(),
        path: pathToImage,
      },
    ]);
  let imagesLoaded = 0;
  function imageLoadedCallBack() {
    imagesLoaded++;
    if (imagesLoaded === partyGroupToImagePathMap.size) {
      if (vizRefs.current && partyGroupToImages.get([])) {
        //draw the initial view
        setAllunsplit(
          vizRefs.current,
          coordinates,
          partyGroupToImages.get([]).image
        );
      }
    }
  }
}
