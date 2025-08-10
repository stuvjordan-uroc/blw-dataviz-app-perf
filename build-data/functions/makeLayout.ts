import Data from "./Data.ts";
import type { Config } from "./types.ts";

type Layout = Record<string, {
  byResponse: {
    expanded: {
      proportions: number[],
      segmentWidths: number[]
    },
    collapse: {
      proportions: number[],
      segmentWidths: number[]
    }
  },
}>


export default function makeLayout(dataInstance: Data, config: Config, screenSize: "small" | "medium" | "large" | "xLarge") {
  const layout = {} as Layout
  dataInstance.impCols.forEach(impCol => {
    //initialize this entry in the layout
    //make the byResponse layout
    ['expanded', 'collapsed'].forEach(viewType => {
      const responseArrays = viewType === 'expanded' ? config.responsesExpanded : config.responsesCollapsed
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const weightedTotal = dataInstance.data.reduce((totalSoFar, currentRow) => totalSoFar + (currentRow[dataInstance.utilityColumns.weight!] as number), 0)
      //compute the proportions
      const proportions = responseArrays.map(responseArray => {
        return dataInstance.data
          .filter(currentRow => responseArray.includes(currentRow[impCol.colIdx] as string))
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map(currentRow => currentRow[dataInstance.utilityColumns.weight!] as number)
          .reduce((acc, curr) => acc + curr, 0) / weightedTotal
      })
      //compute the segmentWidths
      //start by giving each segment the minimum width
      const segmentWidths = new Array(responseArrays.length).fill(2 * config[screenSize].pointRadius) as number[]
      //compute the total remaining width to allocate
      const remainingWidthToAllocate = config[screenSize].vizWidth
        - responseArrays.length * 2 * config[screenSize].pointRadius
        - (responseArrays.length - 1) * config[screenSize].segmentGap
      //add the proportional amounts to the segments
      segmentWidths.forEach((width, widthIndex) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        segmentWidths[widthIndex] = segmentWidths[widthIndex]! + proportions[widthIndex]! * remainingWidthToAllocate
      })
      if (layout.byResponse) {
        layout.byResponse = {
          ...layout.byResponse,
          [viewType]: {
            proportions: proportions,
            segmentWidths: segmentWidths
          }
        }
      }
    })
  })

}