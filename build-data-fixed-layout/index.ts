import path from "node:path";
import makeData from "./functions-and-types/make-data.ts";
import { makeImpProportions } from "./functions-and-types/make-proportions.ts";
import util from "node:util";
import makeSegments from "./functions-and-types/make-segments.ts";
import type { Layout, VizData } from "./functions-and-types/types.ts";
import makeImpSample from "./functions-and-types/make-sample.ts";
import makePoints from "./functions-and-types/make-points.ts";

/* 
CONFIGURATION
*/

//path to raw data
const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);

//how to chop up responses in the expanded and collapsed views
const responseGroups = {
  expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]],
  collapsed: [
    ["Not relevant", "Beneficial"],
    ["Important", "Essential"],
  ],
};
//which parties to show and how to organize them
const partyGroups = [["Democrat"], ["Independent", "Other"], ["Republican"]];

//sample size (per princinciple-wave-partyGroup)
const sampleSize = 100;

//layouts
const layoutSmall: Layout = {
  screenWidthRange: [0, 768],
  vizWidth: 360,
  A: 16 / 9,
  labelHeightBottom: 30,
  labelHeightTop: 30,
  pointRadius: 3,
  rowGap: (9 * 2 * 3) / 4,
  sampleSize: 100,
  segmentGap: (3 * 2 * 3) / 2,
};

/*  
EXPORTED FUNCTION
*/

export default function makeVizDataImp() {
  const data = makeData(rawDataPathString);
  if (data) {
    const impVizData: VizData = {
      waves: data.waves.imp,
      partyGroups: partyGroups,
      responseGroups: responseGroups,
      principles: Object.fromEntries(
        data.impCols.map((impCol) => [
          impCol,
          {
            proportions: makeImpProportions(
              impCol,
              data,
              responseGroups,
              data.waves.imp,
              partyGroups
            ),
            sampledResponses: makeImpSample(
              impCol,
              data,
              data.waves.imp,
              partyGroups,
              sampleSize
            ),
          },
        ])
      ),
    };
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const misconSegments = makeSegments(
      layoutSmall,
      impVizData.principles["misconduct"]!.proportions
    );
    const points = makePoints(
      "misconduct",
      impVizData,
      misconSegments,
      layoutSmall
    );
    return {
      vizData: impVizData,
      coordinates: {
        small: {
          layout: layoutSmall,
          principles: {
            misconduct: {
              points: points,
              segments: misconSegments,
            },
          },
        },
      },
    };
  }
  return undefined;
}
