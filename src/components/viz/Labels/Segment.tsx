//css
import "./Segment.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
//componenets
import ResponseLabel from "./ResponseLabel";
import PercentageLabel from "./PercentageLabel";
//hooks
import { useState } from "react";

export default function Segment({
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
  const [labelsAreVisible, setLabelsAreVisible] = useState(false);
  return (
    <div
      //appearance is specified in the Segment.css under className "segment-rectangle"
      className="segment-rectangle"
      //positioning
      style={{
        position: "absolute",
        top: segment.coordinates.topLeftY.toString() + "px",
        left: segment.coordinates.topLeftX.toString() + "px",
        width: segment.coordinates.width.toString() + "px",
        height: segment.coordinates.height.toString() + "px",
      }}
      onClick={() => {
        setLabelsAreVisible((prevLabelsAreVisible) => {
          return !prevLabelsAreVisible;
        });
      }}
    >
      {labelsAreVisible && <ResponseLabel segment={segment} />}
      {labelsAreVisible && <PercentageLabel segment={segment} />}
    </div>
  );
}
