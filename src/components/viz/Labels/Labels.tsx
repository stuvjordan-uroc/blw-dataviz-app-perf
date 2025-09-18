//css
import "./Labels.css";
//types
import type { RequestedView } from "../../../hooks/use-view";
import type { SegmentCoordinates } from "../../../../build-data";
//components
import Segment from "./Segment";
//data
import dataMeta from "../../../data/data-meta.json";
import WaveLabel from "./WaveLabel";

/*
DESIGN: 
+"TAP ON A SEGMENT FOR MORE INFO, TAP AGAIN TO HIDE THE INFO"
+"DOUBLE TAP ON A SEGMENT FOR A FULL SENTENCE"
*/

export default function Labels({
  requestedView,
  segments,
  waveHeight,
  labelHeight,
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
    proportion: number;
  }[];
  waveHeight: number;
  labelHeight: number;
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
  if (requestedView.wave === true) {
    const waves = dataMeta.waves;
    return (
      <>
        {segments.map((segment, segmentIdx) => (
          <Segment key={segmentIdx} segment={segment} />
        ))}
        {waves.map((wave, waveIdx) => (
          <WaveLabel
            key={waveIdx}
            wave={wave}
            waveIdx={waveIdx}
            labelHeight={labelHeight}
            waveHeight={waveHeight}
          />
        ))}
      </>
    );
  }
  //this view is not unsplit and not by wave,
  //so it's either byResponse or byResponseAndParty
  return segments.map((segment, segmentIdx) => (
    <Segment key={segmentIdx} segment={segment} />
  ));
}
