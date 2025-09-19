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
  waveHeight,
  labelHeight,
  partyGap,
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
  waveHeight: number;
  labelHeight: number;
  partyGap: number;
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
  //array of refs for the impvar-display root elements
  const impVarRootRefs = useRef<null | Map<string, HTMLDivElement>>(null);
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
      proportion: number;
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
        <div
          key={varName}
          className="impvar-display-root"
          style={{
            alignItems: requestedView.wave ? "end" : "center",
            paddingRight: "1rem",
            paddingLeft: requestedView.wave ? "0rem" : "1rem",
          }}
          ref={(node: HTMLDivElement) => {
            if (!impVarRootRefs.current) {
              impVarRootRefs.current = new Map();
            }
            impVarRootRefs.current.set(varName, node);
          }}
        >
          <div className="impvar-question">{questionText}</div>
          <div
            className="impvar-canvas-container"
            style={{
              width: vizWidth + "px",
            }}
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
                waveHeight={waveHeight}
                labelHeight={labelHeight}
                partyGap={partyGap}
                vizWidth={vizWidth}
                vizRootNode={
                  (impVarRootRefs.current && impVarRootRefs.current.get(varName)
                    ? impVarRootRefs.current.get(varName)
                    : document.body) as HTMLElement
                }
              />
            )}
            {(imagesLoading || coordinatesLoading) && (
              <Spinner canvasWidth={vizWidth} canvasHeight={vizHeight} />
            )}
            <canvas
              style={{
                zIndex: "999",
              }}
              width={vizWidth}
              height={vizHeight}
              ref={canvasRefsCallBackFactory(varName)}
              id={varName}
            />
          </div>
        </div>
      ))}
      {/* extra div to pad the bottom of the array of canvases so the last one can be fully scrolled into view */}
      <div
        className="impvar-display-root"
        style={{
          width: "100%",
          height:
            (labelHeight + (labelHeight + waveHeight) * 3).toString() + "px",
        }}
      ></div>
    </div>
  );
}
