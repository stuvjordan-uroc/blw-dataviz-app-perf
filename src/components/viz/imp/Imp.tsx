import Controls from "./Controls";
import "./Imp.css";
import { useRef, useState, createRef } from "react";
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
import questions from "../../../data/questions.json";
import { map } from "lodash";

export default function Imp({
  layout,
}: {
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined;
}) {
  //create a ref that will (once the vizes are rendered) hold
  //a map that takes the node representing each viz to a ref
  //to that node.
  //technique copied from https://react.dev/learn/manipulating-the-dom-with-refs#how-to-manage-a-list-of-refs-using-a-ref-callback
  const vizRefs = useRef<null | Map<string, HTMLCanvasElement>>(null);
  function getVizRefMap() {
    //initialize the map if the viz nodes have not been rendered
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!vizRefs.current) {
      vizRefs.current = new Map();
    }
    //now return the map
    return vizRefs.current;
  }
  const vizRefCallBackFactory = (impVarName: string) => {
    return (node: HTMLCanvasElement) => {
      const vizRefMap = getVizRefMap();
      vizRefMap.set(impVarName, node);
      return () => {
        vizRefMap.delete(impVarName);
      };
    };
  };
  //split-by controls state
  const [isSplitByWave, setIsSplitByWave] = useState(false);
  const [isSplitByParty, setIsSplitByParty] = useState(false);
  //set up an effect that fetches the coordinate data (and refetch when the layout changes)
  const coordinates = useCoordinates(layout);
  //fallback if layout or coordinates are null
  //for instnace, coordinates will be null if/until the coordinates data successfully loads
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
              impVarName={impVarName}
              vizRefs={vizRefs}
              impVarCoordinates={impVarCoordinates}
              layout={layout}
              vizRefCallBack={vizRefCallBackFactory(impVarName)}
            />
          )
        )}
      </div>
    </div>
  );
}
