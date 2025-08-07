/* eslint-disable @typescript-eslint/no-non-null-assertion */
import lodash from "lodash";

interface Grid {
  count: number;
  width: number;
  height: number;
  numColumns: number;
  numRows: number;
  colWidth: number;
  rowHeight: number;
}

function makeCoordinates(
  pointCount: number,
  topLeftX: number,
  topLeftY: number,
  grid: Grid,
  pointRadius: number
) {
  const coordinates = [] as { index: number; x: number; y: number }[];
  for (let row = 0; row < grid.numRows; row++) {
    for (let column = 0; column < grid.numColumns; column++) {
      const windowTopLeftX = topLeftX + row * grid.colWidth;
      const windowTopLeftY = topLeftY + column * grid.rowHeight;
      coordinates.push({
        index: row * (grid.numColumns - 1) + column,
        x:
          windowTopLeftX +
          pointRadius +
          Math.random() * (grid.colWidth - 2 * pointRadius),
        y:
          windowTopLeftY +
          pointRadius +
          Math.random() * (grid.rowHeight - 2 * pointRadius),
      });
    }
  }
  const emptyWindowIndices = lodash.sampleSize(
    coordinates.map((c) => c.index),
    coordinates.length - pointCount
  );
  return coordinates
    .filter((c) => emptyWindowIndices.includes(c.index))
    .map((c) => ({
      x: c.x,
      y: c.y,
    }));
}

export default function segmentsFixed(
  topLeftX: number,
  topLeftY: number,
  pointRadius: number,
  counts: number[],
  vizWidth: number,
  segmentGap: number
) {
  /*
  Return an array of arrays of coordinates at which circles will be placed to form a segment viz.

  */
  //if there's not enough space to give each segment a width of pointRadius, return undefined
  if (
    vizWidth -
      2 * pointRadius * count.length -
      segmentGap * (counts.length - 1) <
    0
  ) {
    return undefined;
  }
  //first compute the widths of the segments.
  //start by allocating enough space to each segment to accommodate exactly 1 column of points
  //note that we will allocate that space even to elements of the count are 0.
  const segmentWidths = new Array(counts.length).fill(
    2 * pointRadius
  ) as number[];
  //now allocate remaining space proportionally
  const totalCount = counts.reduce((acc, curr) => acc + curr, 0);
  counts
    .map((c) => c / totalCount) //get the proportion for each count
    .map(
      (p) =>
        p *
        (vizWidth -
          2 * pointRadius * count.length -
          segmentGap * (counts.length - 1))
    ) //proportionally allocate the space remaining after taking out the segment gaps and the already-allocated space
    .forEach((additionalWidth, idx) => {
      segmentWidths[idx] = segmentWidths[idx]! + additionalWidth;
    });
  //now compute the number of columns and rows of points for each segment, packing the points as tightly as possible.

  const grids = segmentWidths.map((width, idx) => ({
    count: counts[idx]!,
    width: width,
    height: 0,
    numColumns: Math.floor(width / (2 * pointRadius)),
    numRows: Math.ceil(counts[idx] / Math.floor(width / (2 * pointRadius))),
    colWidth: 0,
    rowHeight: 0,
  })) as Grid[];
  //compute the maximum number of rows across all the segments
  const maxRows = grids
    .map((g) => g.numRows)
    .reduce((acc, curr) => (curr > acc ? curr : acc));
  //and set a uniform segment height that allows the segment with the most rows and just accommodate all its points.
  const segmentHeight = maxRows * 2 * pointRadius;
  //now set the column widths and heights (windows!)
  grids.forEach((grid) => {
    grid.height = segmentHeight;
    grid.colWidth = grid.width / grid.numColumns;
    grid.rowHeight = segmentHeight / grid.numRows;
  });
  //now assign coordinates.
  return counts.map((count, countIdx) => {
    const segmentTopLeftX =
      topLeftX +
      counts
        .filter((c, i) => i < countIdx)
        .map((c, i) => grids[i]!.width)
        .reduce((acc, curr) => acc + curr, 0) +
      countIdx * segmentGap;
    return makeCoordinates(
      count,
      segmentTopLeftX,
      topLeftY,
      grids[countIdx]!,
      pointRadius
    );
  });
}
