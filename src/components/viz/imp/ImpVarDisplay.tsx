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
import { useEffect, type RefObject } from "react";
import { isContext } from "vm";
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
  //effect to draw byResponse view on initial render
  useEffect(() => {
    if (vizRefs.current?.has(impVarName)) {
      const canvas = vizRefs.current.get(impVarName);
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "blue";
          ctx.fillRect(0, 0, 0.25 * layout.vizWidth, 0.75 * layout.waveHeight);
        }
      }
    }
  });
  return (
    <div>
      <div>{impVarCoordinates.questionText}</div>
      <div>
        <canvas
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
