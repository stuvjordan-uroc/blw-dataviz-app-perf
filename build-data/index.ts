import makeData from "./functions-and-types/make-data.ts";
import type {
  PAndCUnMapped,
  Point,
  Layouts,
  Layout,
  Viz,
  VizConfig,
  SegmentViewsUnMapped,
  PointsMapUnMapped,
  PointsViews,
  SegmentCoordinates,
} from "./functions-and-types/types.ts";
import { vizAtImp } from "./functions-and-types/viz-at-imp.ts";
import { unMapPAndC } from "./functions-and-types/unmap.ts";
import proportionsAndCounts from "./functions-and-types/proportions-and-counts.ts";

export function buildData(
  pathString: string,
  layouts: Layouts,
  vizConfig: VizConfig,
  dataSet: "imp" | "perf"
) {
  //makeData should work for both the perf and the imp raw datafiles.
  const data = makeData(pathString);
  if (!data) {
    //note that makeData logs all kinds of warnings to the console when
    //it returns undefined, so we don't need to log anything from here if
    //makeData has returned undefined
    return undefined;
  }
  return {
    pAndC:
      dataSet === "imp"
        ? Object.fromEntries(
            data.impCols.map((char) => [
              char,
              unMapPAndC(proportionsAndCounts(char, "imp", data, vizConfig)),
            ])
          )
        : Object.fromEntries(
            data.perfCols.map((char) => [
              char,
              unMapPAndC(proportionsAndCounts(char, "perf", data, vizConfig)),
            ])
          ),
    viz:
      dataSet === "imp"
        ? (Object.fromEntries(
            Object.entries(layouts).map(([screenSize, layout]) => [
              screenSize as keyof Layouts,
              Object.fromEntries(
                data.impCols.map((char) => [
                  char,
                  vizAtImp(char, "imp", data, vizConfig, layout as Layout),
                ])
              ),
            ])
          ) as Viz)
        : (Object.fromEntries(
            Object.entries(layouts).map(([screenSize, layout]) => [
              screenSize as keyof Layouts,
              Object.fromEntries(
                data.perfCols.map((char) => [
                  char,
                  vizAtImp(char, "perf", data, vizConfig, layout as Layout),
                ])
              ),
            ])
          ) as Viz),
    dataMeta:
      dataSet === "imp"
        ? {
            waves: data.waves.imp,
            impResponses: [...data.impResponses],
          }
        : {
            wave: data.waves.perf,
            perfResponses: [...data.perfResponses],
          },
  };
}

export type VizByImpVar = Record<
  string,
  {
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  }
>;
export type { PointsMapUnMapped };
export type { SegmentViewsUnMapped };
export type { SegmentCoordinates };
export type { PointsViews };
export type { Point };
export type { PAndCUnMapped };
