/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type {
  Layout,
  PointCoordinates,
  SegmentGroups,
  VizData,
  Point,
  SegmentCoordinates,
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

function emptyCoordinate() {
  return Object.create({
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
  }) as PointCoordinates;
}
function rowOfBuildings(
  arrayOfSegmentCoordinates: SegmentCoordinates[],
  arrayOfNumbersOfResidents: number[],
  pointRadius: number
) {
  if (arrayOfSegmentCoordinates.length !== arrayOfNumbersOfResidents.length) {
    return undefined;
  }
  return arrayOfSegmentCoordinates.map(
    (segmentCoordinates, segmentCoordinatesIdx) =>
      apartmentWindows(
        segmentCoordinates.topLeftX,
        segmentCoordinates.topLeftY,
        segmentCoordinates.width,
        segmentCoordinates.height,
        arrayOfNumbersOfResidents[segmentCoordinatesIdx]!,
        pointRadius
      )
  );
}

function rowOfRowOfBuildings(
  arrayOfArraysOfSegmentCoordinates: SegmentCoordinates[][],
  arrayOfArraysOfNumbersOfPoints: number[][],
  pointRadius: number
) {
  if (
    arrayOfArraysOfNumbersOfPoints.length !==
    arrayOfArraysOfSegmentCoordinates.length
  ) {
    return undefined;
  }
  return arrayOfArraysOfSegmentCoordinates.map(
    (arrayOfSegmentCoordinates, arrayOfArraysOfSegmentCoordinatesIdx) =>
      rowOfBuildings(
        arrayOfSegmentCoordinates,
        arrayOfArraysOfNumbersOfPoints[arrayOfArraysOfSegmentCoordinatesIdx]!,
        pointRadius
      )
  );
}

function columnOfRowsOfRowsOfBuildings(
  arrayOfArraysOfArraysOfSegments: SegmentCoordinates[][][],
  arrayOfArraysOfArraysOfCounts: number[][][],
  pointRadius: number
) {
  if (
    arrayOfArraysOfArraysOfSegments.length !==
    arrayOfArraysOfArraysOfCounts.length
  ) {
    return undefined;
  }
  return arrayOfArraysOfArraysOfSegments.map(
    (arraysOfArraysOfSegments, arraysOfArraysOfSegmentsIdx) =>
      rowOfRowOfBuildings(
        arraysOfArraysOfSegments,
        arrayOfArraysOfArraysOfCounts[arraysOfArraysOfSegmentsIdx]!,
        pointRadius
      )
  );
}

export default function makePoints(
  principle: string,
  vizData: VizData,
  segmentGroups: SegmentGroups,
  layout: Layout
) {
  if (!vizData.principles[principle]) {
    console.log(
      "WARNING: You ran makePoints on principle",
      principle,
      "but there is no item",
      "imp_" + principle,
      "in the data"
    );
    return undefined;
  }
  //empty return object
  const outPoints = vizData.principles[principle].sampledResponses.map(
    (r) =>
      ({
        pid3: r.pid3,
        response: r.response,
        wave: r.wave,
        collapsed: {
          byResponse: emptyCoordinate(),
          byResponseAndParty: emptyCoordinate(),
          byResponseAndWave: emptyCoordinate(),
          byResponseAndPartyAndWave: emptyCoordinate(),
        },
        expanded: {
          byResponse: emptyCoordinate(),
          byResponseAndParty: emptyCoordinate(),
          byResponseAndWave: emptyCoordinate(),
          byResponseAndPartyAndWave: emptyCoordinate(),
        },
        unsplit: emptyCoordinate(),
      }) as Point
  );
  //first assign coordinates for the unsplit view
  const unsplitTopLeftX = 0;
  const unsplitTopLeftY = layout.labelHeightTop;
  const unsplitWidth = layout.vizWidth;
  const unsplitHeight = layout.vizWidth / layout.A;
  const unSplitCoordinates = apartmentWindows(
    unsplitTopLeftX,
    unsplitTopLeftY,
    unsplitWidth,
    unsplitHeight,
    outPoints.length,
    layout.pointRadius
  );
  outPoints.forEach((point) => {
    const c = unSplitCoordinates.shift();
    if (c) {
      point.unsplit = c;
    }
  });
  //now assign coordinates for each of the views that can be collapsed/expanded
  Object.keys(vizData.responseGroups).forEach((viewType) => {
    const typedViewType = viewType as keyof VizData["responseGroups"];
    //byResponse view
    const arrayOfSegmentCoordinates = segmentGroups[typedViewType].byResponse;
    const arrayOfCounts = vizData.responseGroups[typedViewType].map(
      (responseGroup) =>
        outPoints.filter((r) => responseGroup.includes(r.response)).length
    );
    const coordinatesByResponseGroup = rowOfBuildings(
      arrayOfSegmentCoordinates,
      arrayOfCounts,
      layout.pointRadius
    );
    if (!coordinatesByResponseGroup) {
      console.log(
        "WARNING: You tried to compute coordinates for principle",
        principle,
        "But the lengths of your segment arrays do not match the lengths of your response arrays.  So the coordinates generated are meaningless garbage."
      );
    } else {
      //if we reach here, we know that the indices of responseGroups[typedViewType] and segmentGroups[typedViewType] line up
      //so now we can assign coordinates.
      vizData.responseGroups[typedViewType].forEach(
        (responseGroup, responseGroupIdx) => {
          outPoints.forEach((point) => {
            if (responseGroup.includes(point.response)) {
              const nextCoordinateForGroupOfPoint =
                coordinatesByResponseGroup[responseGroupIdx]!.shift();
              if (!nextCoordinateForGroupOfPoint) {
                console.log(
                  "WARNING: The cardinality of your sample points does not line up with the responseGroups and/or segments.  Coordinates produced are meaningless garbage."
                );
                //if this happens, leave the coordinate as zero
              } else {
                point[typedViewType].byResponse = nextCoordinateForGroupOfPoint;
              }
            }
          });
        }
      );
    }
    //byResponseAndParty view
    const segmentCoordinatesByPartyAndResponse =
      segmentGroups[typedViewType].byResponseAndParty;
    const countsByPartyAndResponse = vizData.partyGroups.map((partyGroup) =>
      vizData.responseGroups[typedViewType].map(
        (responseGroup) =>
          outPoints.filter(
            (point) =>
              partyGroup.includes(point.pid3) &&
              responseGroup.includes(point.response)
          ).length
      )
    );
    const coordinatesByPartyAndResponseGroup = rowOfRowOfBuildings(
      segmentCoordinatesByPartyAndResponse,
      countsByPartyAndResponse,
      layout.pointRadius
    );
    if (!coordinatesByPartyAndResponseGroup) {
      console.log(
        "WARNING: Something does not line up in what you fed to makePoints.  Your coordinates are meaningless garbage"
      );
    } else if (
      coordinatesByPartyAndResponseGroup.filter(
        (partyGroup) => partyGroup === undefined
      ).length > 0
    ) {
      console.log(
        "WARNING: Something does not line up in what you fed to makePoints.  Your coordinates are meaningless garbage"
      );
    } else {
      //if we get here, we can safely assign the corrdinates
      vizData.partyGroups.forEach((partyGroup, partyGroupIdx) => {
        vizData.responseGroups[typedViewType].forEach(
          (responseGroup, responseGroupIdx) => {
            outPoints.forEach((point) => {
              if (
                partyGroup.includes(point.pid3) &&
                responseGroup.includes(point.response)
              ) {
                const nextCoordinate =
                  coordinatesByPartyAndResponseGroup[partyGroupIdx]![
                    responseGroupIdx
                  ]!.shift();
                if (!nextCoordinate) {
                  console.log(
                    "WARNING: Your coordinates are meaningless garbage."
                  );
                } else {
                  point[typedViewType].byResponseAndParty = nextCoordinate;
                }
              }
            });
          }
        );
      });
    }
    //byResponseAndWave
    const segmentsByWaveAndResponse =
      segmentGroups[typedViewType].byResponseAndParty;
    const countsByWaveAndResponse = vizData.waves.map((wave) =>
      vizData.responseGroups[typedViewType].map(
        (responseGroup) =>
          outPoints.filter(
            (point) =>
              point.wave === wave && responseGroup.includes(point.response)
          ).length
      )
    );
    const coordinatesByWaveAndResponse = rowOfRowOfBuildings(
      segmentsByWaveAndResponse,
      countsByWaveAndResponse,
      layout.pointRadius
    );
    if (!coordinatesByWaveAndResponse) {
      console.log(
        "WARNING: belly up on byResponseWaveView.  Your coordinates are meaningless garbage."
      );
    } else if (
      coordinatesByWaveAndResponse.filter(
        (waveGroup) => waveGroup === undefined
      ).length > 0
    ) {
      console.log(
        "WARNING. Bad things on byResponseAndWave.  Your coordinates are meaningless garbage."
      );
    } else {
      //safe to assign coordinates
      vizData.waves.forEach((wave, waveIdx) => {
        vizData.responseGroups[typedViewType].forEach(
          (responseGroup, responseGroupIdx) => {
            outPoints.forEach((point) => {
              if (
                point.wave === wave &&
                responseGroup.includes(point.response)
              ) {
                const nextCoordinate =
                  coordinatesByWaveAndResponse[waveIdx]![
                    responseGroupIdx
                  ]!.shift();
                if (!nextCoordinate) {
                  console.log("WARNINING: Coordinates are meaningless garbage");
                } else {
                  point[typedViewType].byResponseAndWave = nextCoordinate;
                }
              }
            });
          }
        );
      });
    }
    //byResponseAndPartyAndWave
    const segementsByRandPandW =
      segmentGroups[typedViewType].byResponseAndPartyAndWave;
    const countsByRandPandW = vizData.waves.map((w) =>
      vizData.partyGroups.map((p) =>
        vizData.responseGroups[typedViewType].map(
          (r) =>
            outPoints.filter(
              (point) =>
                point.wave === w &&
                p.includes(point.pid3) &&
                r.includes(point.response)
            ).length
        )
      )
    );
    const coordinatesByRandPandW = columnOfRowsOfRowsOfBuildings(
      segementsByRandPandW,
      countsByRandPandW,
      layout.pointRadius
    );
    if (!coordinatesByRandPandW) {
      console.log(
        "WARNING: belly up on byResponseWaveView.  Your coordinates are meaningless garbage."
      );
    } else if (coordinatesByRandPandW.flat(Infinity).includes(undefined)) {
      console.log(
        "WARNING: belly up on byResponseWaveView.  Your coordinates are meaningless garbage."
      );
    } else {
      //safe to assign coordinates
      vizData.waves.forEach((wave, waveIdx) => {
        vizData.partyGroups.forEach((partyGroup, partyGroupIdx) => {
          vizData.responseGroups[typedViewType].forEach(
            (responseGroup, responseGroupIdx) => {
              outPoints.forEach((point) => {
                if (
                  point.wave === wave &&
                  partyGroup.includes(point.pid3) &&
                  responseGroup.includes(point.response)
                ) {
                  const nextCoordinate =
                    coordinatesByRandPandW[waveIdx]![partyGroupIdx]![
                      responseGroupIdx
                    ]!.shift();
                  if (!nextCoordinate) {
                    console.log(
                      "WARNINING: Coordinates are meaningless garbage"
                    );
                  } else {
                    point[typedViewType].byResponseAndPartyAndWave =
                      nextCoordinate;
                  }
                }
              });
            }
          );
        });
      });
    }
  });
  return outPoints;
}
