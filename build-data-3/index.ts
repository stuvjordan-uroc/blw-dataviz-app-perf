import path from 'node:path'
import makeData from './functions-and-types/make-data.ts';
import type { Out, Viz } from './functions-and-types/types.ts';
import makeImpProportionsMap from './functions-and-types/make-proportions-map.ts';
import makeCountsMap from './functions-and-types/make-counts-map.ts';
//path to raw data
const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);
//load the data
const data = makeData(rawDataPathString);
if (data) {
  const out = {} as Out;
  out.vizConfig = {
    responseGroups: {
      collapsed: [["Not relevant", "Beneficial"], ["Important", "Essential"]],
      expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]]
    },
    partyGroups: [["Democrat"], ["Independent", "Other"], ["Republican"]],
    sampleSize: 100
  }
  out.layouts = {
    small: {
      screenWidthRange: [0, 768],
      vizWidth: 360,
      waveHeight: 90,
      labelHeight: 30,
      pointRadius: 3,
      partyGap: 3 * 3,
      responseGap: 2 * 3,
    }
  }
  out.viz = Object.fromEntries(data.impCols.map(impVar => ([
    impVar,
    {} as Viz
  ])))
  for (const impVar in out.viz) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    out.viz[impVar]!.proportions = makeImpProportionsMap(impVar, data, out.vizConfig)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    out.viz[impVar]!.counts = makeCountsMap(data, out.vizConfig, out.viz[impVar]!.proportions)
  }
}