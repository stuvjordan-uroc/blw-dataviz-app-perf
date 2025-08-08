export default function windows(numPoints: number, pointRadius: number, topLeftX: number, topLeftY: number, buildingWidth: number, buildingHeight: number) {
  /*
  We first need to set some number of rows (numRows) and columns (numColumns) of windows.

  It must be that numRows * numColumns >= numPoints...because we want to put each point into it's own window.

  It almost must be that (buildingWidth/numRows) >= 2*pointRadius
  and (buildingHeight/numColumns) >= 2*pointRadius, so that each point can fit in a window.

  put all these constraints together, and it must be that there are numbers numRows and numColumns s.t.

  numRows * numColumns >= numPoints
  numRows              <= buildingWidth/(2*pointRadius)
  numColumns           <= buildingHeight/(2*pointRadius)
  
  notice that this is possible if and only if
  
  buildingWidth*buildingHeight/(4*pointRadius**2) <= numPoints

  */

  if (!(numPoints >= buildingWidth * buildingHeight / (4 * pointRadius ** 2))) {
    return undefined
  }


  /*
  then we need to return an array of numPoints Coordinate types, with each cx and cy jittered inside its own unique window.
  */
}