import path from 'node:path'
import makeData from './functions-and-types/make-data.ts';
import { makeImpProportions } from './functions-and-types/make-proportions.ts';
import util from 'node:util'
import makeSegments from './functions-and-types/make-segments.ts';
import type { Layout } from './functions-and-types/types.ts';

const layoutSmall: Layout = {
  screenWidthRange: [0, 768],
  vizWidth: 360,
  A: 16 / 9,
  labelHeightBottom: 30,
  labelHeightTop: 30,
  pointRadius: 3,
  rowGap: 9 * 2 * 3 / 4,
  sampleSize: 100,
  segmentGap: 3 * 2 * 3 / 2
}

const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);
const data = makeData(rawDataPathString)
if (data) {
  const pForGovStats = makeImpProportions(
    "gov_stats",
    data,
    {
      expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]],
      collapsed: [["Not relevant", "Beneficial"], ["Important", "Essential"]]
    },
    data.waves.imp,
    [["Democrat"], ["Independent", "Other"], ["Republican"]]
  )
  if (pForGovStats) {
    console.log(
      util.inspect(
        makeSegments(layoutSmall, pForGovStats),
        false, null, true
      )
    )
  }

}






