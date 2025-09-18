//css
import "./Labels.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
//hooks
import { useLayoutEffect, useRef, useState } from "react";
//components
import ResponseLabel from "./ResponseLabel";

export default function Labels({
  requestedView,
  segments,
}: {
  requestedView: RequestedView;
  segments: {
    view: RequestedView;
    groups?: {
      response: string[];
      wave?: number;
      party?: string[];
    };
    coordinates: SegmentCoordinates;
  }[];
}) {
  /*
  Note that this component assumes that the segments
  passed as a prop by been filtered so that the only 
  segments passed are those that are consistent with
  the view passed!!!!
  */
  //unsplit view
  if (requestedView.response === false) {
    return null;
  }
  return segments.map((segment, segmentIdx) => (
    <div
      key={segmentIdx}
      //appearance is specified in the Labels.css under className "segment-rectangle"
      className="segment-rectangle"
      //positioning
      style={{
        position: "absolute",
        top: segment.coordinates.topLeftY.toString() + "px",
        left: segment.coordinates.topLeftX.toString() + "px",
        width: segment.coordinates.width.toString() + "px",
        height: segment.coordinates.height.toString() + "px",
      }}
    >
      <ResponseLabel segment={segment} />
    </div>
  ));
}
