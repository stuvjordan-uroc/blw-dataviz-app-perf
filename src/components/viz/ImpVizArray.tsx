import "./ImpVizArray.css";
import { useEffect, useRef } from "react";
import Spinner from "../Spinner";

export default function ImpVizArray({
  varsAndQs,
  imagesLoading,
  coordinatesLoading,
  vizWidth,
  vizHeight,
  canvasRefsCallBackFactory,
  canvasMap,
  drawViewHandler,
  viewDataReady,
  _clearViewHandler,
}: {
  varsAndQs: { varName: string; questionText: string }[];
  imagesLoading: boolean;
  coordinatesLoading: boolean;
  vizWidth: number;
  vizHeight: number;
  canvasRefsCallBackFactory: (
    impVarName: string
  ) => (node: HTMLCanvasElement) => () => void;
  canvasMap: React.RefObject<Map<
    string,
    {
      node: HTMLCanvasElement;
      isVisible: boolean;
    }
  > | null>;
  drawViewHandler: (canvasNode: HTMLCanvasElement) => void;
  viewDataReady: boolean;
  clearViewHandler: (impVar: string) => void;
}) {
  const arrayContainerRef = useRef<null | HTMLDivElement>(null);
  //useEffect to set up intersection observer
  //we know that this sets up the observer, and causes
  //each canvas node to be observed by it.

  /*Somehow changing the requestedView from a ref to a state
  made the intersection observer stop working.
  Specifically, it made the observer mark visible canvases
  as not visible.  So we're going to turn the whole fucking thing
  off for now.
  */
  // useEffect(() => {
  //   const arrayContainerNode = arrayContainerRef.current;
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         const nodeInfo = canvasMap.current?.get(entry.target.id);
  //         if (nodeInfo) {
  //           const nodeWasVisible = nodeInfo.isVisible;
  //           nodeInfo.isVisible = entry.isIntersecting;
  //           if (!nodeWasVisible && nodeInfo.isVisible) {
  //             drawViewHandler(nodeInfo.node);
  //           }
  //           if (nodeWasVisible && !nodeInfo.isVisible) {
  //             clearViewHandler(entry.target.id);
  //           }
  //         }
  //       });
  //     },
  //     {
  //       root:
  //         arrayContainerNode &&
  //         arrayContainerNode.scrollHeight > arrayContainerNode.clientHeight
  //           ? arrayContainerNode
  //           : null, //container is the array container if it is a scroll container, otherwise container is the viewport
  //       threshold: [0, 1],
  //     }
  //   );
  //   if (!coordinatesLoading && !imagesLoading) {
  //     if (canvasMap.current) {
  //       canvasMap.current.forEach(({ node }) => {
  //         observer.observe(node);
  //       });
  //     }
  //   }
  //   return () => {
  //     observer.disconnect();
  //   };
  // }, [coordinatesLoading, imagesLoading]);

  //this is the cludge for the intersection observer not working
  //when you get it fixed, delete it
  useEffect(() => {
    if (
      !coordinatesLoading &&
      !imagesLoading &&
      canvasMap.current &&
      viewDataReady
    ) {
      canvasMap.current.forEach(({ node }, impVar) => {
        drawViewHandler(node);
      });
    }
  }, [coordinatesLoading, imagesLoading, viewDataReady]);
  return (
    <div ref={arrayContainerRef} className="imp-viz-array">
      {varsAndQs.map(({ varName, questionText }) => (
        <div key={varName} className="impvar-display-root">
          <div>{questionText}</div>
          <div
            className="impvar-canvas-container"
            style={{ width: vizWidth + "px" }}
          >
            {(imagesLoading || coordinatesLoading) && (
              <Spinner canvasWidth={vizWidth} canvasHeight={vizHeight} />
            )}
            <canvas
              width={vizWidth}
              height={vizHeight}
              ref={canvasRefsCallBackFactory(varName)}
              id={varName}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
