//css
import "./ResponseLabel.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
import { useLabelDimensions } from "../../../hooks/useLabelDimensions";
import type { MouseEvent } from "react";

/*
DESIGN:

By Response View: Always visible, positioned at the top-center of each segment

By Response and Wave: Only visible when user clicks or taps on a segment, and then 
only in the row of the segment
*/

export default function ResponseLabel({
  segment,
  clickHandler,
}: {
  segment: {
    view: RequestedView;
    groups?: {
      response: string[];
      wave?: number;
      party?: string[];
    };
    coordinates: SegmentCoordinates;
    proportion: number;
  };
  clickHandler: (event: MouseEvent) => void;
}) {
  const [labelDimensions, labelRef] = useLabelDimensions();
  return (
    <div
      ref={labelRef}
      //appearance is specified in ResponseLabel.css under className "response-label"
      className="response-label"
      //positioning
      style={{
        position: "absolute",
        top:
          (
            segment.coordinates.topLeftY -
            labelDimensions.height * 0.5
          ).toString() + "px",
        left:
          (
            segment.coordinates.topLeftX +
            segment.coordinates.width / 2 -
            labelDimensions.width / 2
          ).toString() + "px",
      }}
      onClick={clickHandler}
    >
      {segment.groups?.response.join(" or ") ?? "  "}
    </div>
  );
}
