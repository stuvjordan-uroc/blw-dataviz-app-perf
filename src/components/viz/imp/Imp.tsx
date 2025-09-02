import Controls from "./Controls";
import "./Imp.css";
import { useRef } from "react";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import type {
  PointsMapUnMapped,
  SegmentViewsUnMapped,
} from "../../../../build-data/functions-and-types/types";
import { useCoordinates } from "../../../hooks/useCoordinates";
import ImpVarDisplay from "./ImpVarDisplay";

export default function Imp({
  layout,
}: {
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined;
}) {
  //create a ref that will (once the viz-es are rendered) hold
  //a map that takes the node representing each viz to a ref
  //to that node.
  //We'll use these refs to update the positions of the points in
  //each viz's canvas when the user clicks the buttons that change
  //the view.
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
  //view state ref
  //This holds the current view state for the viz-es
  //It is a ref, which means that changing it will not
  //trigger a re-render of this component, nor
  //will it trigger a re-render of the children
  //to which it is passed as a prop.
  //When the user clicks the controls in this component
  //to switch views, a callback will mutate the .current
  //property of this ref.
  //This mutation will NOT trigger re-renders.
  //But it WILL trigger execution of code that changes
  //the position of points in each viz.
  const viewRef = useRef<{ splitByWave: boolean; splitByParty: boolean }>({
    splitByWave: false,
    splitByParty: false,
  });
  //set up an effect that fetches the coordinate data (and refetch when the layout changes)
  //note this effect depends on the layout, and layout is a state variable.
  //So this whole component and its children will re-render when the layout changes
  //(e.g. in response to a large change in screen width)
  const coordinates = useCoordinates(layout);
  //fallback if layout or coordinates are null
  //for instnace, coordinates will be null if/until the coordinates data successfully loads
  if (!layout || !coordinates) {
    return null;
  }
  return (
    <div className="imp-viz-root">
      <Controls viewRef={viewRef} />
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
