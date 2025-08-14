//get the pathstring for the data
import path from "node:path";
import util from "node:util";
import makeData from "../functions-and-types/make-data.ts";
import makeImpProportionsMap from "../functions-and-types/make-proportions-map.ts";
import addNumPointsToProportionsMap from "../functions-and-types/make-num-points-map.ts";
import addUnsplitCoordinates from "../functions-and-types/add-unsplit-coordinates.ts";
import type { ProportionsMap } from "../functions-and-types/types-new.ts";

//path to raw data
const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);
//load the data
const data = makeData(rawDataPathString);

if (data) {
  //set the VizConfig
  const vizConfig = {
    responseGroups: {
      collapsed: [["Not relevant", "Beneficial"], ["Important", "Essential"]],
      expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]]
    },
    partyGroups: [["Democrat"], ["Independent", "Other"], ["Republican"]],
    sampleSize: 100
  }

  //make the proportionsMaps
  const proportionsMaps = Object.fromEntries(data.impCols.map(impCol => ([
    impCol,
    makeImpProportionsMap(
      impCol,
      data,
      vizConfig
    ) as ProportionsMap
  ])))
  //make the number of points map
  const numAndPropssMaps = Object.fromEntries(Object.entries(proportionsMaps).map(([impVar, pMap]) => ([
    impVar,
    addNumPointsToProportionsMap(data, vizConfig, pMap)
  ])))
  //add unsplit segment coordinates at each wave and partyGroup
  const layoutSmall = {
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
  const unsplitAndNumAndPropsMap = Object.fromEntries(Object.entries(numAndPropssMaps).map(([impVar, nAndPMap]) => ([
    impVar,
    addUnsplitCoordinates(layoutSmall, nAndPMap, data, vizConfig)
  ])))
  console.log("progress so far at =gov_stats=")
  console.log(util.inspect(unsplitAndNumAndPropsMap.gov_stats?.get(23)?.get(vizConfig.partyGroups[2]), true, 1, true))
}