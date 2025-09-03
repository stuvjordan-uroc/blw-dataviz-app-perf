import { useEffect } from "react";
import type { RefObject } from "react";
import "./impVarCanvas.css";
import { setPointsToByResponse } from "../../../view-setters/set-points-to";
import type { PointsMapUnMapped } from "../../../../build-data";
export default function ImpVarCanvas({
  width,
  height,
  vizRefCallBack,
  vizRefs,
  impVarName,
  points,
  breakPointKey,
}: {
  width: number;
  height: number;
  vizRefCallBack: (node: HTMLCanvasElement) => () => void;
  vizRefs: RefObject<null | Map<string, HTMLCanvasElement>>;
  impVarName: string;
  points: PointsMapUnMapped;
  breakPointKey: string;
}) {
  //effect to run on render -- draws initial byResponse view
  useEffect(() => {
    //set up the image object that will render the points
    const noPartyCircleImg = new Image();
    //get the canvas
    if (vizRefs.current?.has(impVarName)) {
      const canvas = vizRefs.current.get(impVarName);
      if (canvas) {
        //add event listener to noPartyCircleImg that uses the image to draw the byResponse view when the image loads
        noPartyCircleImg.addEventListener("load", () => {
          setPointsToByResponse(canvas, points, "expanded", noPartyCircleImg);
        });
        //set the path for the image so that it will load
        noPartyCircleImg.src = `/img/${breakPointKey}-none.png`;
      }
    }
  });
  return (
    <canvas
      className="impvar-canvas"
      width={width}
      height={height}
      ref={vizRefCallBack}
    ></canvas>
  );
}
