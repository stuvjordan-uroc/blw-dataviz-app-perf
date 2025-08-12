import type {
  Layout,
  PointCoordinates,
  SampledResponse,
  SegmentGroups,
} from "./types.ts";
import lodash from "lodash";

function apartmentWindows(
  topLeftX: number,
  topLeftY: number,
  buildingWidth: number,
  buildingHeight: number,
  numResidents: number,
  pointRadius: number
) {
  /* 
  Divide a rectangle of width buildingWidth and height buildingHeight, into windows, each large enough to fit a circle of radius pointRadius, subject to their being enough windows to fit numResidents.

  Then assign coordinates to the circles so that each one is randomly jittered within it's own apartment window.
  */

  /*
  first construct the apartment windows.

  Let R be the number of rows of windows and C be the number of columns.

  For the windows to be big enough for the points, we must have

  R <= buildingHeight/(2*pointRadius)

  and

  C <= buildingWidth/(2*pointRadius)

  Further, for there to be enough windows, we must have

  numResidents <= R * C
  */

  //first set R and C to their maximum values, so that the windows are at their smallest
  let R = Math.floor(buildingHeight / (2 * pointRadius));
  let C = Math.floor(buildingWidth / (2 * pointRadius));
  //if this maximum number of windows isn't enought to fit all the points, use the fallback
  if (R * C < numResidents) {
    /* 
    What we're going to do here is "widen" the building just enough to fit the points with the 
    windows set to their smallest dimensions.
    */
    C = Math.ceil(numResidents / R);
    const newBuildingWidth = C * 2 * pointRadius;
    //offset the new building so that its center lines up with the center of the actual building.
    const newTopLeftX = topLeftX - (newBuildingWidth - buildingWidth) / 2;
    return apartmentWindows(
      newTopLeftX,
      topLeftY,
      newBuildingWidth,
      buildingHeight,
      numResidents,
      pointRadius
    );
  }
  //if we get to here, then we can increase the window sizes and still fit all the points.  So let's do that
  let stepIsOdd = true;
  while ((R - 1) * C >= numResidents || R * (C - 1) >= numResidents) {
    if (!((R - 1) * C >= numResidents)) {
      //we can decrement C but not R
      C = C - 1;
    } else if (!(R * (C - 1) >= numResidents)) {
      //we can decrement R but not C
      R = R - 1;
    } else {
      //we can decrement either
      if (stepIsOdd) {
        C = C - 1;
      } else {
        R = R - 1;
      }
      stepIsOdd = !stepIsOdd;
    }
  }
  //We now have C and R set to their minium possible values that can still fit all the points.  This means the minimum number of windows of the maximum possible size.
  //now generate a random position within each window
  const windowWidth = buildingWidth / C;
  const windowHeight = buildingHeight / R;
  const allWindows = [] as PointCoordinates[];
  for (let r = 1; r <= R; r++) {
    for (let c = 1; c <= C; c++) {
      const cx =
        topLeftX +
        (c - 1) * windowWidth +
        pointRadius +
        Math.random() * (windowWidth - 2 * pointRadius);
      const cy =
        topLeftY +
        (r - 1) * windowHeight +
        pointRadius +
        Math.random() * (windowHeight - 2 * pointRadius);
      allWindows.push({
        x: cx - pointRadius,
        y: cy - pointRadius,
        cx: cx,
        cy: cy,
      });
    }
  }
  //now select the indices of windows that will be empty at random
  const emptyIndices = lodash.sampleSize(
    allWindows.map((el, idx) => idx),
    numResidents - R * C
  );
  return allWindows.filter((w, wIdx) => !emptyIndices.includes(wIdx));
}

export default function makePoints(
  sample: SampledResponse[],
  segmentGroups: SegmentGroups,
  layout: Layout
) {
  //first assign coordinates for the unsplit view
  const unsplitTopLeftX = 0;
  const unsplitTopLeftY = layout.labelHeightTop;
  const unsplitWidth = layout.vizWidth;
  const unsplitHeight = layout.vizWidth / layout.A;

  //now assign coordinates for each by*** view
  // (Object.keys(segmentGroups) as (keyof SegmentGroups)[]).forEach(viewType => {
  //   segmentGroups[viewType].byResponse
  // })
}
