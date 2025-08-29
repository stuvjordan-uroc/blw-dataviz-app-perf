import makeData from "./functions-and-types/make-data.ts";
import type { Layouts, Layout, Viz } from "./functions-and-types/types.ts";
import { vizAtImp } from "./functions-and-types/viz-at-imp.ts";
import {
  unMapPAndC
} from "./functions-and-types/unmap.ts";
import proportionsAndCounts from "./functions-and-types/proportions-and-counts.ts";

//vizConfig is set here.
const vizConfig = {
  responseGroups: {
    collapsed: [
      ["Not relevant", "Beneficial"],
      ["Important", "Essential"],
    ],
    expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]],
  },
  partyGroups: [["Democrat"], ["Independent", "Other"], ["Republican"]],
  sampleSize: 100,
};

export function buildData(pathString: string, layouts: Layouts) {
  const data = makeData(pathString);
  if (!data) {
    //note that makeData logs all kinds of warnings to the console when
    //it returns undefined, so we don't need to log anything from here if
    //makeData has returned undefined
    return undefined;
  }
  return {
    vizConfig: vizConfig,
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
    ]))) as Viz
  }
}

