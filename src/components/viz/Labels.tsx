import type { RequestedView } from "../../hooks/use-view";
import type { SegmentCoordinates } from "../../../build-data";
import { useLayoutEffect, useRef, useState } from "react";
import { number } from "zod";
export default function Labels({
  requestedView,
  segments,
}: {
  requestedView: RequestedView;
  segments: {
    view: RequestedView;
    groups?: {
      response: string;
      wave?: number;
      party?: string;
    };
    coordinates: SegmentCoordinates;
  }[];
}) {
  //unsplit view
  if (requestedView.response === false) {
    return null;
  }
  /*
  Note that this component assumes that the segments
  passed as a prop by been filtered so that the only 
  segments passed are those that are consistend with
  the view passed!!!!
  */

  //response label refs so that we can measure the response label widths and heights
  const responseLabelRefMap = useRef<null | Map<number, HTMLDivElement>>(null);
  function getResponseLabelRefMap() {
    if (responseLabelRefMap.current) {
      return responseLabelRefMap.current;
    }
    return new Map() as Map<number, HTMLDivElement>;
  }
  const labelRefCallbackFactory = (labelIndex: number) => {
    return (node: HTMLDivElement) => {
      const currentResponseLabelRefMap = getResponseLabelRefMap();
      currentResponseLabelRefMap.set(labelIndex, node);
    };
  };
  //state to track label widths and heights
  const [labelDimensions, setLabelDimensions] = useState<
    Map<number, { width: number; height: number }>
  >(
    new Map(
      segments.map(
        (_segment, idx) =>
          [idx, { width: 0, height: 0 }] as [
            number,
            { width: number; height: number },
          ]
      )
    )
  );
  //layout effect to set the widths and heights
  useLayoutEffect(() => {
    if (responseLabelRefMap.current) {
      responseLabelRefMap.current.forEach((node, segmentIdx) => {
        const rect = node.getBoundingClientRect();
        setLabelDimensions((prevLabelDimensions) => {
          prevLabelDimensions.set(segmentIdx, {
            width: rect.width,
            height: rect.height,
          });
          return prevLabelDimensions;
        });
      });
    }
  }, [segments]);
  return segments.map((segment, segmentIdx) => (
    <div key={segmentIdx} ref={labelRefCallbackFactory(segmentIdx)}>
      {segment.groups?.response}
    </div>
  ));
}
