//css
import "./PercentageLabel.css";
//hooks
import useLabelDimensions from "../../../hooks/useLabelDimensions";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";

export default function PercentageLabel({
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
  };
}) {
  const [labelDimensions, labelRef] = useLabelDimensions(segment);
  return (
    <div
      ref={labelRef}
      //appearance is specified in ResponseLabel.css under className "percentage-label"
      className="percentage-label"
      //positioning
      style={{
        position: "absolute",
        top:
          (
            segment.coordinates.height * 0.5 -
            labelDimensions.height * 0.5
          ).toString() + "px",
        left:
          (
            segment.coordinates.width / 2 -
            labelDimensions.width / 2
          ).toString() + "px",
      }}
    >
      20%
    </div>
  );
}
