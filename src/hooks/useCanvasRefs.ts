import { useEffect, useRef, useState } from "react";
export default function useCanvasRefs(): [
  (impVarName: string) => (
    (node: HTMLCanvasElement) => (
      () => void
    )
  ),
  boolean
] {
  //create state tracking whether canvases are ready
  //to be drawn on
  const [canvasesReady, setCanvasesReady] = useState<boolean>(false)
  //create a ref that will hold a map
  //taking impVarNames to canvas nodes
  //Techniqued used here for creating
  //a Mapped collection of DOM nodes adapted from
  //https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
  const canvasRefsMap = useRef<null | Map<string, HTMLCanvasElement>>(null);
  //function used by canvas nodes to get the vizRefs map so they can put themselves into the map)
  const getCanvasRefsMap = () => {
    //If the ref has been created, return it
    if (canvasRefsMap.current) {
      return canvasRefsMap.current
    }
    //Otherwise initialize the ref...
    canvasRefsMap.current = new Map()
    //...and return the new map
    return canvasRefsMap.current;
  };
  //factory that creates functions for canvas nodes to use as their ref callbacks
  const canvasRefCallBackFactory = (impVarName: string) => (
    (node: HTMLCanvasElement) => {
      const canvasRefsMap = getCanvasRefsMap();
      canvasRefsMap.set(impVarName, node);
      return (() => {
        canvasRefsMap.delete(impVarName)
      })
    }
  )
  //Since useEffect callback is invoked only after rendering is complete,
  //we know the refs in the canvasref map are populated
  //by the time a useEffect callback is invoked
  //so pass a callback that does setCanvasesReady(true) to a useEffect
  //see https://stackoverflow.com/a/79755080/7071537
  useEffect(() => {
    setCanvasesReady(true)
  }, [])
  return [canvasRefCallBackFactory, canvasesReady]
}