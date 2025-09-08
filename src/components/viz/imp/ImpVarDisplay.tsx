import "./ImpVarDisplay.css";
import dataMeta from "../../../data/data-meta.json";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { memo } from "react";
import ImpVarCanvas from "./ImpVarCanvas";
export const ImpVarDisplay = memo(
  ({
    layout,
    //impVarName,
    //vizRefs,
    impVarQuestionText,
    vizRefCallBack,
  }: {
    layout: { breakPointKey: BreakpointKey } & BreakpointConfig;
    //impVarName: string;
    //vizRefs: RefObject<null | Map<string, HTMLCanvasElement>>;
    impVarQuestionText: string | undefined;
    vizRefCallBack: (node: HTMLCanvasElement) => () => void;
  }) => {
    return (
      <div className="impvar-display-root">
        <div>{impVarQuestionText}</div>
        <div className="impvar-canvas-container">
          <ImpVarCanvas
            width={layout.vizWidth}
            height={
              layout.labelHeight +
              (layout.waveHeight + layout.labelHeight) * dataMeta.waves.length
            }
            vizRefCallBack={vizRefCallBack}
            //vizRefs={vizRefs}
            //impVarName={impVarName}
            //points={impVarCoordinates.points}
            //breakPointKey={layout.breakPointKey}
          />
        </div>
      </div>
    );
  }
);
