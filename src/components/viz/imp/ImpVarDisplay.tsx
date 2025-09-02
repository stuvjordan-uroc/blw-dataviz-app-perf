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
export default function ImpVarDisplay({
  layout,
  impVarCoordinates,
  vizRefCallBack,
}: {
  layout: { breakPointKey: BreakpointKey } & BreakpointConfig;
  impVarCoordinates: {
    questionText: string;
    shortText: string;
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  };
  vizRefCallBack: (node: HTMLCanvasElement) => () => void;
}) {
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
