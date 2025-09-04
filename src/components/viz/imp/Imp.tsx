import Controls from "./Controls";
import "./Imp.css";
import { useCallback, useMemo, useRef } from "react";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { useCoordinates } from "../../../hooks/useCoordinates";
import { ImpVarDisplay } from "./ImpVarDisplay";
import {
  byResponse,
  byResponseAndParty,
  byResponseAndWave,
  setAllByResponse,
  setAllByResponseAndParty,
  setAllByResponseAndWave,
  setAllunsplit,
  unsplit,
} from "../../../view-setters/set-points-to";
export const viewKeys = [
  "splitByResponse",
  "splitByWave",
  "splitByParty",
] as const;
export type ViewKeys = typeof viewKeys;
export type ObjectFromTuple<T extends readonly string[], K> = Record<
  T[number],
  K
>;
export type ViewState = ObjectFromTuple<ViewKeys, boolean>;
import circleConfig from "../../../config/circles.json";
import type { PointsMapUnMapped } from "../../../../build-data";

export function Imp({
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
  const getVizRefMap = () => {
    //initialize the map if the viz nodes have not been rendered
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (!vizRefs.current) {
      vizRefs.current = new Map();
    }
    //now return the map
    return vizRefs.current;
  };
  //state that tracks when the refs are populated.  This will be used to control
  //whether the controls on the viz are active
  //const [_vizReadyMap, setVizReadyMap] = useState<Map<string, boolean>>(
  //  new Map()
  //);
  //factory that creates functions for canvas nodes to use as their ref callbacks
  const vizRefCallBackFactory = useCallback((impVarName: string) => {
    return (node: HTMLCanvasElement) => {
      const vizRefMap = getVizRefMap();
      vizRefMap.set(impVarName, node);
      //update vizReadyMap
      //setVizReadyMap((prevVizReadyMap) => {
      //  const newVizReadyMap = new Map(prevVizReadyMap.entries());
      //  newVizReadyMap.set(impVarName, true);
      //  return newVizReadyMap;
      //});
      //cleanup when node is removed from dom
      return () => {
        vizRefMap.delete(impVarName);
      };
    };
  }, []);
  //set up an effect that fetches the coordinate data (and refetch when the layout changes)
  //note this effect depends on the layout, and layout is a state variable.
  //So this whole component and its children will re-render when the layout changes
  //(e.g. in response to a large change in screen width)
  const coordinates = useCoordinates(layout);
  //handler to alter views when user clicks on one of the buttons in the
  //controls component (child of this component)
  // function drawPlaceholder(newView: ViewState, canvas: HTMLCanvasElement) {
  //   const ctx = canvas.getContext("2d");
  //   if (ctx) {
  //     //clear the existing points
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);
  //     //placeholder draw
  //     ctx.font = "20px serif";
  //     ctx.fillText(
  //       `splitByResponse: ${newView.splitByResponse.toString()}`,
  //       10,
  //       24
  //     );
  //     ctx.fillText(`splitByWave: ${newView.splitByWave.toString()}`, 10, 48);
  //     ctx.fillText(`splitByParty: ${newView.splitByParty.toString()}`, 10, 72);
  //   }
  // }
  function handleViewChange(newView: ViewState) {
    console.log("someone called the handler to redraw the views!");
    if (vizRefs.current && coordinates && layout) {
      console.log(
        "the vizrefs, coordinates, and layout are all defined, so we can reset the views"
      );
      switch (newView.splitByResponse) {
        case false: //UNSPLIT  ###DONE###
          setAllunsplit(
            vizRefs.current,
            coordinates,
            `/img/${layout.breakPointKey}-none.png`
          );
          break;
        default: //ONE OF THE SPLITBYRESPONSEVIEWS
          switch (newView.splitByWave) {
            case false: //EITHER SPLITBYRESPONSE OR SPLITBYRESPONSEANDPARTY
              switch (newView.splitByParty) {
                case false: //SPLITBYRESPONSE ###DONE###
                  setAllByResponse(
                    vizRefs.current,
                    coordinates,
                    `/img/${layout.breakPointKey}-none.png`
                  );
                  break;
                default: //SPLITBYRESPONSEANDPARTY ####NOT WORKING####
                  const pgToImagePath = new Map(
                    (circleConfig.fillByPartyGroup as [string[], string][])
                      .map(
                        ([pg, _fill]) =>
                          [pg, pg.join("-")] as [string[], string]
                      )
                      .map(
                        ([pg, joinedPg]) =>
                          [
                            pg,
                            `/img/${layout.breakPointKey}-${joinedPg}.pg`,
                          ] as [string[], string]
                      )
                  );
                  setAllByResponseAndParty(
                    vizRefs.current,
                    coordinates,
                    pgToImagePath
                  );
                  break;
              }
              break;
            default: //EITHER SPLITBYRESPONSEANDWAVE OR SPLITBYRESPONSEANDWAVEANDPARTY
              switch (newView.splitByParty) {
                case false: //SPLITBYRESPONSEANDWAVE ###DONE###
                  setAllByResponseAndWave(
                    vizRefs.current,
                    coordinates,
                    `/img/${layout.breakPointKey}-none.png`
                  );
                  break;
                default: //SPLITBYRESPONSEANDWAVEANDPARTY
                  break;
              }
              break;
          }
          break;
      }
    }
    //if vizRefs.current is null, there are no canvases to redraw!
  }
  //create an array of question names, caching the result so it doesn't re-calculate on
  //every re-render

  const varToQuestions = useMemo(() => {
    if (coordinates) {
      return Object.entries(coordinates).map(([impVarName, c]) => [
        impVarName,
        c.questionText,
      ]);
    }
    return null;
  }, [coordinates]);
  //fallback if layout or coordinates are null
  //for instnace, coordinates will be null if/until the coordinates data successfully loads
  if (!layout || !varToQuestions) {
    return null;
  }
  return (
    <div className="imp-viz-root">
      <Controls viewChangeHandler={handleViewChange} />
      <div className="imp-viz-vizarray">
        {varToQuestions.map(([impVarName, question]) => (
          <ImpVarDisplay
            key={impVarName}
            impVarQuestionText={question}
            layout={layout}
            vizRefCallBack={vizRefCallBackFactory(impVarName)}
          />
        ))}
      </div>
    </div>
  );
}
