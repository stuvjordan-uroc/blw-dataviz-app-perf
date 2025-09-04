import Controls from "./Controls";
import "./Imp.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { useCoordinates } from "../../../hooks/useCoordinates";
import { ImpVarDisplay } from "./ImpVarDisplay";
import {
  setAllByResponse,
  setAllByResponseAndParty,
  setAllByResponseAndWave,
  setAllByResponseAndWaveAndParty,
  setAllunsplit,
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
  //set up state that tracks whether the canvases are rendered and thus ready to receive
  //input from controls.
  //rendering of controls will be conditional on this state being true.
  const [canvasesReady, setCanvasesReady] = useState(false);
  //Any useEffect defined here will be called only after the canvases have been rendered.
  //So set canvasReady to true in a useEffect here.
  useEffect(() => {
    setCanvasesReady(true);
  }, []);
  //set up an effect that fetches the coordinate data (and refetch when the layout changes)
  //note this effect depends on the layout, and layout is a state variable.
  //So this whole component and its children will re-render when the layout changes
  //(e.g. in response to a large change in screen width)
  const coordinates = useCoordinates(layout);
  //populate initial unsplit view on render
  useEffect(() => {
    if (vizRefs.current && coordinates && layout) {
      const pathToNoPartyImage = `/img/${layout.breakPointKey}-none.png`;
      setAllunsplit(vizRefs.current, coordinates, pathToNoPartyImage);
    }
  });
  //handler to alter views when user clicks on one of the buttons in the
  //controls component (child of this component)
  function handleViewChange(newView: ViewState) {
    if (vizRefs.current && coordinates && layout) {
      const pathToNoPartyImage = `/img/${layout.breakPointKey}-none.png`;
      const pgToImagePath = new Map(
        (circleConfig.fillByPartyGroup as [string[], string][])
          .map(([pg, _fill]) => [pg, pg.join("-")] as [string[], string])
          .map(
            ([pg, joinedPg]) =>
              [pg, `/img/${layout.breakPointKey}-${joinedPg}.png`] as [
                string[],
                string,
              ]
          )
      );
      switch (newView.splitByResponse) {
        case false: //UNSPLIT  ###DONE###
          setAllunsplit(vizRefs.current, coordinates, pathToNoPartyImage);
          break;
        default: //ONE OF THE SPLITBYRESPONSEVIEWS
          switch (newView.splitByWave) {
            case false: //EITHER SPLITBYRESPONSE OR SPLITBYRESPONSEANDPARTY
              switch (newView.splitByParty) {
                case false: //SPLITBYRESPONSE ###DONE###
                  setAllByResponse(
                    vizRefs.current,
                    coordinates,
                    pathToNoPartyImage
                  );
                  break;
                default: //SPLITBYRESPONSEANDPARTY ####DONE####
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
                    pathToNoPartyImage
                  );
                  break;
                default: //SPLITBYRESPONSEANDWAVEANDPARTY
                  setAllByResponseAndWaveAndParty(
                    vizRefs.current,
                    coordinates,
                    pgToImagePath
                  );
                  break;
              }
              break;
          }
          break;
      }
    }
    //if vizRefs.current is null, there are no canvases to redraw!
  }
  //create an array of questions, caching the result so it doesn't re-calculate on
  //every re-render
  //these are used to populate the labels above each viz.
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
      {canvasesReady && <Controls viewChangeHandler={handleViewChange} />}
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
