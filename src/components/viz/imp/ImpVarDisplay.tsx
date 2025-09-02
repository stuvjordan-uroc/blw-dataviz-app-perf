import "./ImpVarDisplay.css";
import dataMeta from "../../../data/data-meta.json";
import vizConfig from "../../../config/viz-config.json";
import type {
  SegmentViewsUnMapped,
  PointsMapUnMapped,
} from "../../../../build-data";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { useEffect, type RefObject } from "react";
import { setPointsToByResponse } from "../../../view-setters/set-points-to";
export default function ImpVarDisplay({
  layout,
  impVarName,
  vizRefs,
  impVarCoordinates,
  vizRefCallBack,
}: {
  layout: { breakPointKey: BreakpointKey } & BreakpointConfig;
  impVarName: string;
  vizRefs: RefObject<null | Map<string, HTMLCanvasElement>>;
  impVarCoordinates: {
    questionText: string;
    shortText: string;
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  };
  vizRefCallBack: (node: HTMLCanvasElement) => () => void;
}) {
  //effect to run on render
  useEffect(() => {
    //set up the images we need to draw points on the canvas
    const imageByPartyGroup = Object.fromEntries(
      ["none", ...vizConfig.partyGroups.map((pg) => pg.join("-"))].map(
        (partyGroupString) => [partyGroupString, new Image()]
      )
    );
    //get the canvas
    if (vizRefs.current?.has(impVarName)) {
      const canvas = vizRefs.current.get(impVarName);
      if (canvas) {
        //add an event listener on imageByPartyGroup.none that calls
        // setPointsToByResponse on load
        imageByPartyGroup.none.addEventListener("load", () => {
          setPointsToByResponse(
            canvas,
            impVarCoordinates.points,
            "expanded",
            imageByPartyGroup.none
          );
        });
        //set the path for none image so that the load event will fire
        imageByPartyGroup.none.src = `/img/${layout.breakPointKey}-none.png`;
      }
    }
  });
  return (
    <div className="impvar-display-root">
      <div>{impVarCoordinates.questionText}</div>
      <div className="impvar-canvas-container">
        <canvas
          className="impvar-canvas"
          width={layout.vizWidth}
          height={
            layout.labelHeight +
            (layout.waveHeight + layout.labelHeight) * dataMeta.waves.length
          }
          ref={vizRefCallBack}
        ></canvas>
      </div>
    </div>
  );
}
