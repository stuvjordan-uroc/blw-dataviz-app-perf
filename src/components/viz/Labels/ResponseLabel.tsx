//css
import "./ResponseLabel.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
//hooks
import { useLayoutEffect, useRef, useState } from "react";

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
  };
}) {
  //state to track label dimensions so we can center the label on an absolute position
  const [labelDimensions, setLabelDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  //ref for the label node so we can get dimensions
  const labelRef = useRef<null | HTMLDivElement>(null);
  //useLayoutEffect to get dimensions and set labelDimensions state
  useLayoutEffect(() => {
    if (labelRef.current) {
      const rect = labelRef.current.getBoundingClientRect();
      setLabelDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [segment]);
  return (
    <div
      ref={labelRef}
      //appearance is specified in ResponseLabel.css under className "response-label"
      className="response-label"
      //positioning
      style={{
        position: "absolute",
        top: (-labelDimensions.height).toString() + "px",
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
