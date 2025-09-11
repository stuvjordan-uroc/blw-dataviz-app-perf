import type { PointsViews } from "../../build-data";
import type { RawCoordinates } from "../hooks/useCoordinates";
import type { SegmentViewsUnMapped } from "../../build-data";
interface PointsViewsAndImages {
  pointsViews: PointsViews,
  images: {
    noParty: HTMLImageElement | undefined,
    party: HTMLImageElement | undefined
  }
}
type Points = [
  string[],
  [
    number,
    null | [
      string,
      PointsViewsAndImages
    ][]
  ][]
][]

export type VizData = Map<string, {
  canvas: HTMLCanvasElement | undefined;
  stage: createjs.Stage | undefined;
  segments: SegmentViewsUnMapped;
  points: Points;
}>

export function makeVizData(
  rawCoodinates: RawCoordinates,
  imageMap: Map<string, HTMLImageElement>,
  canvasMap: Map<string, { node: HTMLCanvasElement, stage: createjs.Stage }>
): VizData {
  return new Map(Object.entries(rawCoodinates).map(([impVar, { segments, points }]) => ([
    impVar,
    {
      canvas: canvasMap.get(impVar)?.node,
      stage: canvasMap.get(impVar)?.stage,
      segments: segments,
      points: points.map(([rg, unMapAtRg]) => ([
        rg,
        unMapAtRg.map(([wave, unMapAtWave]) => ([
          wave,
          unMapAtWave === null ? null : unMapAtWave.map(([pg, pointsViews]) => ([
            pg.join("-"),
            {
              pointsViews: pointsViews,
              images: {
                noParty: imageMap.get("none"),
                party: imageMap.get(pg.join("-"))
              }
            }
          ]))
        ]))
      ]))
    }
  ])))
}