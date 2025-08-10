import util from 'node:util'
import path from 'node:path'
import makeData from './make-data.ts';
import type { Data } from './types.ts';


const rawDataPathString = path.resolve(
  "build-data-fixed-layout",
  "raw-data/dem_characteristics_importance.gz"
);
const data = makeData(rawDataPathString)




function validateResponses(data: Data, expectedImpResponses: (string | null)[], expectedPerfResponses: (string | null)[], expectedPid3Responses: (string | null)[]) {
  const foundImpResponses = new Set(
    data.impCols
      .map(impCol => (
        data.data
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map(row => row.imp[impCol]!
          )))
      .flat(Infinity) as string[]
  )
  console.log(foundImpResponses)
  //const setOfexpectedImpResponses = new Set(expectedImpResponses)
  //console.log(setOfexpectedImpResponses.symmetricDifference(foundImpResponses))
  const foundPerfResponses = new Set(
    data.perfCols
      .map(perfCol => (
        data.data
          .map(row => row.perf[perfCol]!

          )
      ))
      .flat(Infinity) as string[]
  )
  console.log(foundPerfResponses)
  const foundPid3Responses = new Set(data.data.map(row => row.pid3))
  console.log(foundPid3Responses)
}

if (data) {
  validateResponses(
    data,
    ["Not relevant", "Beneficial", "Important", "Essential", null],
    ["Does not meet", "Partly meets", "Mostly meets", "Fully meets", null],
    ["Democrat", "Republican", "Independent", "Other", "Not sure", null])
}