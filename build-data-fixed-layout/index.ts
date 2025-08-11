import path from 'node:path'
import makeData from './functions-and-types/make-data.ts';
import { makeImpProportions } from './functions-and-types/make-proportions.ts';
import util from 'node:util'


const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);
const data = makeData(rawDataPathString)
if (data) {
  console.log(
    util.inspect(
      makeImpProportions(
        "misconduct",
        data,
        {
          expanded: [["Not relevant"], ["Beneficial"], ["Important"], ["Essential"]],
          collapsed: [["Not relevant", "Beneficial"], ["Important", "Essential"]]
        },
        data.waves.imp,
        [["Democrat"], ["Independent", "Other"], ["Republican"]]
      ),
      false, null, true
    )
  )
}

interface Layout {
  screenWidthRange: number[];
  vizWidth: number;
  A: number;
  pointRadius: number;
  segmentGap: number;
  rowGap: number;
  labelHeightTop: number;
  labelHeightBottom: number;
}



interface Coordinates {
  proportions: ProportionGroups
  small: {
    layout: Layout
  },
  medium: {
    layout: Layout
  },
  large: {
    layout: Layout
  },
  xLarge: {
    layout: Layout
  }
}


// if (data) {
//   const principleNames = [...data.allPrinciples] as const;  //as const causes typescript to interpret the type of principle names in the narrowest possible sense
//   type PrincipleKey = typeof principleNames[number]; //now PrincipleKey is the union of the strings in data.allPrinciples
//   interface Proportions {
//     [key in PrincipleKey]: ProportionGroups | null
//   }
// }

