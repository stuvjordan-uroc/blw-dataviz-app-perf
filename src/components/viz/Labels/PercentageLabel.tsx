//css
import "./PercentageLabel.css";
//hooks
import { useSegmentLabelDimensions } from "../../../hooks/useLabelDimensions";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
import type { MouseEvent } from "react";

export default function PercentageLabel({
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
  const [labelDimensions, labelRef] = useSegmentLabelDimensions(segment);
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
      onClick={clickHandler}
    >
      {Math.round(segment.proportion * 100).toString() + "%"}
    </div>
  );
}
