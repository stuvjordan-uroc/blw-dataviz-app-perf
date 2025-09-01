import Controls from "./Controls";
import "./Imp.css";
import { useState } from "react";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import type {
  PointsMapUnMapped,
  SegmentViewsUnMapped,
} from "../../../../build-data/functions-and-types/types";
import useCoordinates from "../../../hooks/useCoordinates";
import ImpVarDisplay from "./ImpVarDisplay";

export default function Imp({
  layout,
}: {
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined;
}) {
  //split-by controls state
  const [isSplitByWave, setIsSplitByWave] = useState(false);
  const [isSplitByParty, setIsSplitByParty] = useState(false);
  //set up an effect that fetches the coordinate data (and refetch when the layout changes)
  const coordinates = useCoordinates(layout);
  //fallback if layout or coordinates are null
  //for instnace, coordinates will be null if/until the coordinates data sucessfully loads
  if (!layout || !coordinates) {
    return null;
  }
  return (
    <div className="imp-viz-root">
      <Controls
        waveState={{ state: isSplitByWave, setter: setIsSplitByWave }}
        partyState={{ state: isSplitByParty, setter: setIsSplitByParty }}
      />
      <div className="imp-viz-vizarray">
        {(
          Object.entries(coordinates) as [
            string, //impVar name, such as "misconduct"
            {
              questionText: string;
              shortText: string;
              segments: SegmentViewsUnMapped;
              points: PointsMapUnMapped;
            },
          ][]
        ).map(
          (
            [impVarName, impVarCoordinates]: [
              string,
              {
                questionText: string;
                shortText: string;
                segments: SegmentViewsUnMapped;
                points: PointsMapUnMapped;
              },
            ],
            _impVarIdx: number,
            _impVarEntries: [
              string,
              {
                questionText: string;
                shortText: string;
                segments: SegmentViewsUnMapped;
                points: PointsMapUnMapped;
              },
            ][]
          ) => (
            <ImpVarDisplay
              key={impVarName}
              impVarCoordinates={impVarCoordinates}
              layout={layout}
            />
          )
        )}
      </div>
    </div>
  );
}
