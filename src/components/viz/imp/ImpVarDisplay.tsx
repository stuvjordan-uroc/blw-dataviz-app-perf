import "./ImpVarDisplay.css";
import dataMeta from "../../../data/data-meta.json";
import type {
  SegmentViewsUnMapped,
  PointsMapUnMapped,
} from "../../../../build-data";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { type RefObject } from "react";
import ImpVarCanvas from "./ImpVarCanvas";
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
  //useEffect(() => {
  //  const imageByPartyGroup = Object.fromEntries(
  //    ["none", ...vizConfig.partyGroups.map((pg) => pg.join("-"))].map(
  //      (partyGroupString) => [partyGroupString, new Image()]
  //    )
  //  );
  //  //get the canvas
  //  if (vizRefs.current?.has(impVarName)) {
  //    const canvas = vizRefs.current.get(impVarName);
  //    if (canvas) {
  //      //add an event listener on imageByPartyGroup.none that calls
  //      // setPointsToByResponse on load
  //      imageByPartyGroup.none.addEventListener("load", () => {
  //        setPointsToByResponse(
  //          canvas,
  //          impVarCoordinates.points,
  //          "expanded",
  //          imageByPartyGroup.none
  //        );
  //      });
  //      //set the path for none image so that the load event will fire
  //      imageByPartyGroup.none.src = `/img/${layout.breakPointKey}-none.png`;
  //    }
  //  }
  //});
  return (
    <div className="impvar-display-root">
      <div>{impVarCoordinates.questionText}</div>
      <div className="impvar-canvas-container">
        <ImpVarCanvas
          width={layout.vizWidth}
          height={
            layout.labelHeight +
            (layout.waveHeight + layout.labelHeight) * dataMeta.waves.length
          }
          vizRefCallBack={vizRefCallBack}
          vizRefs={vizRefs}
          impVarName={impVarName}
          points={impVarCoordinates.points}
          breakPointKey={layout.breakPointKey}
        />
      </div>
    </div>
  );
}
