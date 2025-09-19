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
import vizConfig from "../../../config/viz-config.json";
import PartyLabel from "./PartyLabel";

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
  partyGap,
  vizWidth,
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
  partyGap: number;
  vizWidth: number;
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
  const waves = dataMeta.waves;
  const partyGroups = vizConfig.partyGroups;
  const totalVizHeight =
    labelHeight + (waveHeight + labelHeight) * waves.length;
  const pointsHeight = requestedView.wave
    ? totalVizHeight - 2 * labelHeight
    : waves.length * waveHeight;
  const pointsBottomTop = requestedView.wave
    ? labelHeight + pointsHeight
    : (totalVizHeight - pointsHeight) / 2 + pointsHeight;
  const partyGroupWidth =
    (vizWidth - (partyGroups.length - 1) * partyGap) / partyGroups.length;
  return (
    <>
      {segments.map((segment, segmentIdx) => (
        <Segment key={segmentIdx} segment={segment} />
      ))}
      {requestedView.wave &&
        waves.map((wave, waveIdx) => (
          <WaveLabel
            key={waveIdx}
            wave={wave}
            waveIdx={waveIdx}
            labelHeight={labelHeight}
            waveHeight={waveHeight}
          />
        ))}
      {requestedView.party &&
        partyGroups.map((pg, pgIdx) => (
          <PartyLabel
            key={pgIdx}
            partyGap={partyGap}
            partyGroup={pg}
            partyGroupIdx={pgIdx}
            partyGroupWidth={partyGroupWidth}
            pointsBottomTop={pointsBottomTop}
          />
        ))}
    </>
  );
}
