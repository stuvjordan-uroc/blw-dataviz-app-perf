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
  //function to draw the circles on the canvas
  //this will be called when the circle png for the relevant rg, wave, and pg has loaded
  function drawByResponseFactory(
    ctx: CanvasRenderingContext2D,
    nonPartyCircleImage: HTMLImageElement
  ) {
    return () => {
      ctx.drawImage(
        nonPartyCircleImage,
        Math.random() * layout.vizWidth,
        layout.labelHeight + Math.random() * layout.waveHeight
      );
    };
  }
  //effect to draw byResponse view on initial render
  useEffect(() => {
    const circleNonPartyImg = new Image();
    if (vizRefs.current?.has(impVarName)) {
      const canvas = vizRefs.current.get(impVarName);
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          //load the image for the non-party circle
          //(non-party because we only draw the byResponse view on first render)
          //set a listener on the "load" event for that circle
          //fire "drawByResponse" when that event fires
          circleNonPartyImg.addEventListener(
            "load",
            drawByResponseFactory(ctx, circleNonPartyImg)
          );
          circleNonPartyImg.src = `/img/${layout.breakPointKey}-none.png`;
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
