import "./ImpVarDisplay.css";
import dataMeta from "../../../data/data-meta.json";
import type { BreakpointConfig } from "../../../config/layouts-types";
import { memo } from "react";
import ImpVarCanvas from "./ImpVarCanvas";
export const ImpVarDisplay = memo(
  ({
    layout,
    impVarQuestionText,
    vizRefCallBack,
  }: {
    layout: BreakpointConfig;
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
          />
        </div>
      </div>
    );
  }
);
