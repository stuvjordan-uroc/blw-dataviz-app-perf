import "./ImpVizArray.css";
import { useEffect, useRef } from "react";
import Spinner from "../Spinner";
import type { RequestedView, ViewData } from "../../hooks/useView";

export default function ImpVizArray({
  varsAndQs,
  imagesLoading,
  coordinatesLoading,
  vizWidth,
  vizHeight,
  canvasRefsCallBackFactory,
  canvasMap,
  drawViewHandler,
  clearViewHandler,
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
  drawViewHandler: (impVar: string) => void;
  clearViewHandler: (impVar: string) => void;
}) {
  const arrayContainerRef = useRef<null | HTMLDivElement>(null);
  //useEffect to set up intersection observer
  //we know that this sets up the observer, and causes
  //each canvas node to be observed by it.
  useEffect(() => {
    const arrayContainerNode = arrayContainerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const nodeInfo = canvasMap.current?.get(entry.target.id);
          if (nodeInfo) {
            const nodeWasVisible = nodeInfo.isVisible;
            nodeInfo.isVisible = entry.isIntersecting;
            if (!nodeWasVisible && nodeInfo.isVisible) {
              drawViewHandler(entry.target.id);
            }
            if (nodeWasVisible && !nodeInfo.isVisible) {
              clearViewHandler(entry.target.id);
            }
          }
        });
        canvasMap.current?.forEach(({ isVisible }, impVar) => {
          console.log("Canvas for", impVar, "isVisible is now: ", isVisible);
        });
      },
      {
        root:
          arrayContainerNode &&
          arrayContainerNode.scrollHeight > arrayContainerNode.clientHeight
            ? arrayContainerNode
            : null, //container is the array container if it is a scroll container, otherwise container is the viewport
        threshold: [0, 1],
      }
    );
    if (canvasMap.current) {
      canvasMap.current.forEach(({ node }) => {
        observer.observe(node);
      });
    }
    return () => {
      observer.disconnect();
    };
  }, []);

  //TO DO: specify dependences for the above useEffect!!!
  return (
    <div ref={arrayContainerRef} className="imp-viz-array">
      {varsAndQs.map(({ varName, questionText }) => (
        <div key={varName} className="impvar-display-root">
          <div>{questionText}</div>
          <div className="impvar-canvas-container">
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
