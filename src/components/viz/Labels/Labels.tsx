//css
import "./Labels.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
//components
import Segment from "./Segment";

/*
DESIGN: 
+"TAP ON A SEGMENT FOR MORE INFO, TAP AGAIN TO HIDE THE INFO"
+"DOUBLE TAP ON A SEGMENT FOR A FULL SENTENCE"
*/

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
    <Segment key={segmentIdx} segment={segment} />
  ));
}
