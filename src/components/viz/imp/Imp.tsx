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
  //function to get the vizRefs map in whatever it's current state is.
  // (Used by canvas nodes to get the vizRefs map so they can put themselves into the map)
  function getVizRefMap() {
    //initialize the map if the viz nodes have not been rendered
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!vizRefs.current) {
      vizRefs.current = new Map();
    }
    //now return the map
    return vizRefs.current;
  }
  //factory that creates functions for canvas nodes to use as their ref callbacks
  const vizRefCallBackFactory = (impVarName: string) => {
    return (node: HTMLCanvasElement) => {
      const vizRefMap = getVizRefMap();
      vizRefMap.set(impVarName, node);
      //cleanup when node is removed from dom
      return () => {
        vizRefMap.delete(impVarName);
      };
    };
  };

  //set up handlers to alter views when user clicks on one of the buttons in the
  //controls component (child of this component)
  function handleViewChange(newView: {
    splitByWave: boolean;
    splitByParty: boolean;
  }) {
    if (vizRefs.current) {
      vizRefs.current.forEach((canvas) => {
        //get the drawing context
        const ctx = canvas.getContext("2d");
        if (ctx) {
          //clear the existing points
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          //placeholder draw
          ctx.font = "20px serif";
          ctx.fillText(
            `splitByWave: ${newView.splitByWave.toString()}`,
            10,
            24
          );
          ctx.fillText(
            `splitByParty: ${newView.splitByParty.toString()}`,
            10,
            48
          );
        }
      });
    }
    //if vizRefs.current is null, there are no canvases to redraw!
  }

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
      <Controls viewChangeHandler={handleViewChange} />
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
