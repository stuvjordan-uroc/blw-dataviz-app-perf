import proportionsAndCounts from "../functions-and-types/proportions-and-counts.ts";
import type { Data, DataRow, Layout, VizConfig } from "../functions-and-types/types.ts";

const fakeVizConfig: VizConfig = {
  responseGroups: {
    collapsed: [["impResponse1"], ["impResponse2"]],
    expanded: [["impResponse1"], ["impResponse2"]]
  },
  partyGroups: [["pg1"], ["pg2"]],
  sampleSize: 100
}

const fakeData: Data = {
  impCols: ['principle1', 'principle2'],
  perfCols: ['perfCol1', 'perfCol2'],
  waves: {
    imp: [1, 2, 3],
    perf: [1, 2, 3]
  },
  impResponses: new Set(['impResponse1', 'impResponse2']),
  perfResponses: new Set(['perfResponse1', 'perfResponse2']),
  allPrinciples: new Set(['principle1', 'principle2']),
  data: [] as DataRow[]
}

const fakeLayout: Layout = {
  screenWidthRange: [0, 768],
  vizWidth: 360,
  waveHeight: 90,
  pointRadius: 3,
  responseGap: 3 * 3 / 2,
  partyGap: 3 * 3 / 2 * 3 / 2,
  labelHeight: 30
}


//in wave 1, 
//100 from each of pg1 and pg2, 
//50-50 responses from pg1, 
//30-70 from pg2, 
//weights 0.1 for pg1
//weights 0.5 for pg2
for (let i = 1; i <= 100; i++) {
  //pg1
  fakeData.data.push({
    weight: 0.1,
    pid3: 'pg1',
    wave: 1,
    imp: {
      "principle1": i <= 50 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 50 ? 'impResponse1' : 'impResponse2'
    },
    perf: {
      "principle1": i <= 50 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 50 ? 'impResponse1' : 'impResponse2'
    }
  } as DataRow)
  //pg2
  fakeData.data.push({
    weight: 0.5,
    pid3: 'pg2',
    wave: 1,
    imp: {
      "principle1": i <= 30 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 30 ? 'impResponse1' : 'impResponse2'
    },
    perf: {
      "principle1": i <= 30 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 30 ? 'impResponse1' : 'impResponse2'
    }
  } as DataRow)
}
//wave 2, both principles not included
//in wave 3, 
//100 from each of pg1 and pg2, 
//30-70 responses from pg1, 
//50-50 from pg2, 
//weights 0.5 for pg1
//weights 0.1 for pg2
for (let i = 1; i <= 100; i++) {
  //pg2
  fakeData.data.push({
    weight: 0.1,
    pid3: 'pg2',
    wave: 3,
    imp: {
      "principle1": i <= 50 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 50 ? 'impResponse1' : 'impResponse2'
    },
    perf: {
      "principle1": i <= 50 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 50 ? 'impResponse1' : 'impResponse2'
    }
  } as DataRow)
  //pg1
  fakeData.data.push({
    weight: 0.1,
    pid3: 'pg1',
    wave: 3,
    imp: {
      "principle1": i <= 30 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 30 ? 'impResponse1' : 'impResponse2'
    },
    perf: {
      "principle1": i <= 30 ? 'impResponse1' : 'impResponse2',
      "principle2": i <= 30 ? 'impResponse1' : 'impResponse2'
    }
  } as DataRow)
}

export default {
  data: fakeData,
  vizConfig: fakeVizConfig,
  pAndC: {
    "principle1": proportionsAndCounts("principle1", fakeData, fakeVizConfig),
    "printiple2": proportionsAndCounts("principle2", fakeData, fakeVizConfig)
  },
  layout: fakeLayout
}