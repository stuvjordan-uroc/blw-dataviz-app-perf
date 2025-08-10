import lodash from "lodash";

export function segment(
  numPoints: number,
  pointRadius: number,
  topLeftX: number,
  topLeftY: number,
  segmentWidth: number,
  segmentHeight: number
) {
  //If we're asked to give a segment with zero points, return an empty array of points.
  if (numPoints === 0) {
    return [] as { x: number, y: number, cx: number, cy: number }[]
  }
  /*
  We first need to set some number of rows (numRows) and columns (numColumns) of windows.
  
  It must be that all of the following are true...

  numRows * numColumns >= numPoints                       (so that there are enough windows to fit all the points)
  numRows              <= segmentWidth/(2*pointRadius)   (so that the windows are wide enough to fit the points)
  numColumns           <= segmentHeight/(2*pointRadius)  (so that the windows are tall enough to fit the points)

  The simplest solution (although possibly not the best in terms of aesthetics) is to set

  numRows = floor(segmentWidth/(2*pointRadius))
  numColumn = floor(segmentHeight/(2*pointRadius))

  This works, so long as floor(segmentWidth/(2*pointRadius))*floor(segmentHeight/(2*pointRadius)) >= numPoints.

  But it may not be great.  If this last constraint is far from binding, the points will be sparsely and irregularly
  distributed in the segment -- potentially leaving a lot of blank space between any point and some or all of the outer
  edges of the segment.

  So we're going to use a strategy of searching for lower integer values for numRows and numColumns that still leave enough windows for all the points.
  */

  //first set numRows and numColums to their maximum possible values
  let numRows = Math.floor(segmentHeight / (2 * pointRadius))
  let numColumns = Math.floor(segmentWidth / (2 * pointRadius))
  //if this doesn't give us enough points numRows and numColums at these maxima, return undefined
  if (numColumns * numRows < numPoints) {
    return undefined
  }

  //now let's decrement numRows and numColumns one step at a time, so long as we can fit all points.
  let stepIsOdd = true;
  while ((numRows - 1) * numColumns >= numPoints || numRows * (numColumns - 1) >= numPoints) {  //if we can decrement either one and still fit the points...
    if ((numRows - 1) * numColumns >= numPoints && numRows * (numColumns - 1) >= numPoints) {  //if we can decrement BOTH and still fit the points
      if (stepIsOdd) { //if we're on an "odd" step, decrement numRows
        numRows = numRows - 1;
      } else {         //if we're on an "even" step, decrement numColumns
        numColumns = numColumns - 1;
      }
      stepIsOdd = !stepIsOdd //switch to the next step.
    } else if ((numRows - 1) * numColumns >= numPoints) {  //if we can decrement numRows but we can't decrement numColumns, decrement numRows
      numRows = numRows - 1;
    } else {                                               //if we can decrement numColumns but we can't decrement numRows, decrement numColumns
      numColumns = numColumns - 1;
    }
  }

  //we now have numRows and numColumns set to the minimum integer values that can fit numPoints, and that have window sizes large enough to fit the points.

  //create an array of all the windows, with each element giving the x, y, cx and cy coordinate where a point would be placed within the window.
  const windowWidth = segmentWidth / numColumns;
  const windowHeight = segmentHeight / numRows;
  const arrayOfWindows = [] as { x: number, y: number, cx: number, cy: number }[];
  for (let row = 1; row <= numRows; row++) {
    for (let col = 1; col <= numColumns; col++) {
      const windowTopLeftX = topLeftX + windowWidth * (col - 1);
      const windowTopLeftY = topLeftY + windowHeight * (row - 1);
      const cX = windowTopLeftX + pointRadius + Math.random() * (windowWidth - 2 * pointRadius);
      const cY = windowTopLeftY + pointRadius + Math.random() * (windowHeight - 2 * pointRadius);
      arrayOfWindows.push({
        x: cX - pointRadius,
        y: cY - pointRadius,
        cx: cX,
        cy: cY,
      })
    }
  }
  //randomly choose the indices of the windows that will be empty
  const emptyIndices = lodash.sampleSize(arrayOfWindows.map((w, wIdx) => wIdx), numColumns * numRows - numPoints)
  //return the coordinates for the non-empty windows
  return arrayOfWindows.filter((w, wIdx) => !emptyIndices.includes(wIdx))

}

export function rowOfSegments(
  arrayOfNumPoints: number[],
  pointRadius: number,
  topLeftX: number,
  segmentGap: number,
  topLeftY: number,
  arrayOfSegmentWidths: number[],
  rowHeight: number
) {
  //this gives an array of array of coordinates for points in a row of segments.
  if (arrayOfNumPoints.length !== arrayOfSegmentWidths.length) {
    return undefined
  }
  return arrayOfNumPoints.map((seg, segIdx) =>
    segment(
      seg,
      pointRadius,
      topLeftX + segIdx * segmentGap,
      topLeftY,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      arrayOfSegmentWidths[segIdx]!,
      rowHeight
    )
  )
}


export function rowOfRowsOfSegments(
  arrayOfArraysOfNumPoints: number[][],
  pointRadius: number,
  topLeftX: number,
  rowGap: number,
  segmentGap: number,
  topLeftY: number,
  arrayOfArraysOfSegmentWidths: number[][],
  rowHeight: number
) {
  if (arrayOfArraysOfNumPoints.length !== arrayOfArraysOfSegmentWidths.length) {
    return undefined
  }
  return arrayOfArraysOfNumPoints.map((arrayOfNumPoints, aIdx) => {
    const totalWidthOfPreviousRows = aIdx === 0 ?
      0 :
      arrayOfArraysOfSegmentWidths
        .slice(0, aIdx)
        .map(arrayOfSegmentWidths =>
          arrayOfSegmentWidths.reduce((acc, curr) => acc + curr, 0) + segmentGap * (arrayOfArraysOfSegmentWidths.length - 1)
        )
        .reduce((acc, curr) => acc + curr, 0)
      + rowGap * (arrayOfArraysOfSegmentWidths.slice(0, aIdx).length - 1)
    const currentRowTopLeftX = aIdx === 0 ? topLeftX : topLeftX + totalWidthOfPreviousRows + rowGap
    //disable no-non-null assertion on next line because typescript can't tell that arrayOfArraysOfSegmentWidths[aIdx] is not undefined.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return rowOfSegments(arrayOfNumPoints, pointRadius, currentRowTopLeftX, segmentGap, topLeftY, arrayOfArraysOfSegmentWidths[aIdx]!, rowHeight)
  })
}