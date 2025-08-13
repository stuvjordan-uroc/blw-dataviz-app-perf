//get the pathstring for the data
import path from "node:path";
import makeData from "./functions-and-types/make-data.ts";
import makeImpProportionsMap from "./make-proportions-map.ts";

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
    )
  ])))
  //make the number of points map
}