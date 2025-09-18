//data
import "./ImpVizArray.css";
//hooks
import { useEffect, useRef } from "react";
//components
import Spinner from "../Spinner";
import Labels from "./Labels/Labels";
//types
import type { RequestedView } from "../../hooks/use-view";
import type { CoordinatesState } from "../../hooks/useCoordinates";
import type { SegmentCoordinates } from "../../../build-data";

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
  requestedView,
  coordinates,
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
  requestedView: RequestedView;
  coordinates: CoordinatesState;
}) {
  const arrayContainerRef = useRef<null | HTMLDivElement>(null);
  //this is the cludge for the intersection observer not working
  //when you get it fixed, delete it
  useEffect(() => {
    if (
      !coordinatesLoading &&
      !imagesLoading &&
      canvasMap.current &&
      viewDataReady
    ) {
      canvasMap.current.forEach(({ node }) => {
        drawViewHandler(node);
      });
    }
  }, [coordinatesLoading, imagesLoading, viewDataReady]);
  function filteredSegments(
    requestedView: RequestedView,
    allSegments: {
      view: RequestedView;
      groups?: {
        response: string[];
        wave?: number;
        party?: string[];
      };
      coordinates: SegmentCoordinates;
    }[]
  ) {
    return allSegments.filter(
      (segment) =>
        segment.view.response === requestedView.response &&
        segment.view.wave === requestedView.wave &&
        segment.view.party === requestedView.party
    );
  }
  return (
    <div ref={arrayContainerRef} className="imp-viz-array">
      {varsAndQs.map(({ varName, questionText }) => (
        <div key={varName} className="impvar-display-root">
          <div>{questionText}</div>
          <div
            className="impvar-canvas-container"
            style={{ width: vizWidth + "px" }}
          >
            {coordinates.data && coordinates.data.get(varName) && (
              <Labels
                key={Object.values(requestedView).reduce(
                  (acc: number, val: boolean, idx) => acc + +val * 2 ** idx,
                  0
                )}
                requestedView={requestedView}
                segments={filteredSegments(
                  requestedView,
                  coordinates.data.get(varName)!.segments
                )}
              />
            )}
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
