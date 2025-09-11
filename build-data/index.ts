import makeData from "./functions-and-types/make-data.ts";
import type { Point, Layouts, Layout, Viz, VizConfig, SegmentViewsUnMapped, PointsMapUnMapped, PointsViews } from "./functions-and-types/types.ts";
import { vizAtImp } from "./functions-and-types/viz-at-imp.ts";
import {
  unMapPAndC
} from "./functions-and-types/unmap.ts";
import proportionsAndCounts from "./functions-and-types/proportions-and-counts.ts";


export function buildData(pathString: string, layouts: Layouts, vizConfig: VizConfig) {
  const data = makeData(pathString);
  if (!data) {
    //note that makeData logs all kinds of warnings to the console when
    //it returns undefined, so we don't need to log anything from here if
    //makeData has returned undefined
    return undefined;
  }
  return {
    pAndC: Object.fromEntries(data.impCols.map((impCol) => ([
      impCol,
      unMapPAndC(proportionsAndCounts(impCol, data, vizConfig))
    ]))),
    viz: Object.fromEntries(Object.entries(layouts).map(([screenSize, layout]) => ([
      screenSize as keyof Layouts,
      Object.fromEntries(data.impCols.map((impCol) => ([
        impCol,
        vizAtImp(impCol, data, vizConfig, layout as Layout)
      ])))
    ]))) as Viz,
    dataMeta: {
      waves: data.waves.imp,
      impResponses: [...data.impResponses]
    }
  }
}

export type VizByImpVar = Record<string, {
  segments: SegmentViewsUnMapped;
  points: PointsMapUnMapped;
}>
export type { PointsMapUnMapped };
export type { SegmentViewsUnMapped };
export type { PointsViews };
export type { Point };
