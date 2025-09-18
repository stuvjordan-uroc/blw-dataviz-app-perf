//css
import "./ResponseLabel.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
import { useSegmentLabelDimensions } from "../../../hooks/useLabelDimensions";

/*
DESIGN:

By Response View: Always visible, positioned at the top-center of each segment

By Response and Wave: Only visible when user clicks or taps on a segment, and then 
only in the row of the segment
*/

export default function ResponseLabel({
  segment,
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
}) {
  const [labelDimensions, labelRef] = useSegmentLabelDimensions(segment);
  return (
    <div
      ref={labelRef}
      //appearance is specified in ResponseLabel.css under className "response-label"
      className="response-label"
      //positioning
      style={{
        position: "absolute",
        top: (-labelDimensions.height * 0.5).toString() + "px",
        left:
          (
            segment.coordinates.width / 2 -
            labelDimensions.width / 2
          ).toString() + "px",
      }}
    >
      {segment.groups?.response.join(" or ") ?? "  "}
    </div>
  );
}
