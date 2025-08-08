import apartmentWindows from "./apartment-windows.ts";
import getProportions from "./proportions.ts";

function arrayOfApartmentWindows(
  responseGroups: string[][],
  arrayOfPoints: { response: string;[key: string]: string }[],
  proportionsMap: Map<string[], number>,
  totalSegmentWidthMinusGaps: number,
  segmentGap: number,
  rowTopLeftX: number,
  rowTopLeftY: number,
  rowHeight: number
) {
  return responseGroups.map((responseGroup, responseGroupIdx) => {
    //get the points that are in the current responseGroup
    const pointSubset = arrayOfPoints.filter((point) =>
      responseGroup.includes(point.response)
    );
    //set the Y coordinate of the top left of the segment for the current responseGroup
    const topLeftY = rowTopLeftY;
    //set the X coordinate of the top left of the segment for the current responseGroup
    const topLeftX =
      rowTopLeftX +
      responseGroups
        .slice(0, responseGroupIdx) //array of the response groups before the current responseGroup
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map(
          (prevResponseGroup) =>
            proportionsMap.get(prevResponseGroup)! *
            totalSegmentWidthMinusGaps +
            segmentGap
        ) //take each of these response groups.  Get the group proportion, multiply by the totalSegmentWidthMinusGaps, add one gap for the next segment.  The result is an array of widths -- each width is the width of the relevant segment, plus the width of the gap that comes after it.
        .reduce((acc, curr) => acc + curr, 0); //sum the resulting widths to get the total
    return apartmentWindows(
      topLeftX,
      topLeftY,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      proportionsMap.get(responseGroup)! * totalSegmentWidthMinusGaps,
      rowHeight,
      pointSubset.length
    );
  });
}

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export default class ImpCoordinates {
  //declare members
  responseGroupsExpanded = [
    ["Not relevant"],
    ["Beneficial"],
    ["Important"],
    ["Essential"],
  ];
  responseGroupsCollapsed = [
    ["Not relevant", "Beneficial"],
    ["Important", "Essential"],
  ];
  partyGroups = [["Democrat"], ["Independent", "Other"], ["Republican"]];
  segmentGap = 1;
  partyRowGap = 5;
  waveVizGap = 5;
  rowHeight = 30;
  vizWidth = 100;
  //constructor
  constructor(
    responseGroupsExpanded: string[][],
    responseGroupsCollapsed: string[][],
    partyGroups: string[][],
    segmentGap: number,
    partyRowGap: number,
    waveVizGap: number,
    rowHeight: number,
    vizWidth: number
  ) {
    this.responseGroupsExpanded = responseGroupsExpanded;
    this.responseGroupsCollapsed = responseGroupsCollapsed;
    this.partyGroups = partyGroups;
    this.segmentGap = segmentGap;
    this.partyRowGap = partyRowGap;
    this.waveVizGap = waveVizGap;
    this.rowHeight = rowHeight;
    this.vizWidth = vizWidth;
  }

  //methods
  //unsplit view
  addUnsplit(
    sample: Record<string, Record<string, Record<string, unknown>[]>>
  ) {
    Object.keys(sample).forEach((impVarName) => {
      //total residents at this impvar
      const totalResidents = Object.keys(sample[impVarName]!)
        .map((waveString) => sample[impVarName]![waveString]!.length)
        .reduce((acc, curr) => acc + curr, 0);
      //get the radius and coordinates for each resident
      const heads = apartmentWindows(
        0,
        0,
        this.vizWidth,
        this.rowHeight,
        totalResidents
      );
      //add the coordinates to the sample
      Object.keys(sample[impVarName]!).forEach((waveString) => {
        sample[impVarName]![waveString]!.forEach((el, idx) => {
          sample[impVarName]![waveString]![idx] = {
            ...sample[impVarName]![waveString]![idx],
            unsplit: heads.shift(),
          };
        });
      });
    });
  }
  addByResponse(
    sample: Record<string, Record<string, Record<string, unknown>[]>>
  ) {
    Object.keys(sample).forEach((impVar) => {
      //consolidate the sampled points across waves into a single array of points
      const singleArrayOfPoints = Object.values(sample[impVar]!).flat() as {
        response: string;
        pid3: string;
      }[];
      //make the proportions maps that return the proportion for each response group both expanded and collapsed
      const proportionsMapExpanded = getProportions(
        singleArrayOfPoints,
        this.responseGroupsExpanded,
        "response",
        undefined,
        undefined
      ) as Map<string[], number>;
      const proportionsMapCollapsed = getProportions(
        singleArrayOfPoints,
        this.responseGroupsCollapsed,
        "response",
        undefined,
        undefined
      ) as Map<string[], number>;
      //compute the total width of the segments, not including gaps between the segments, both expanded and collapsed
      const totalSegmentWidthMinusGapsExpanded =
        this.vizWidth -
        this.segmentGap * (this.responseGroupsExpanded.length - 1);
      const totalSegmentWidthMinusGapsCollapsed =
        this.vizWidth -
        this.segmentGap * (this.responseGroupsCollapsed.length - 1);
      //make an arrays of the same length as the arrays of response groups expanded/collapsed, in the same order as the arrays of response groups.
      //each entry in the array is the array of coordinates for the points in the relevant response group
      const arrayOfBuildingsExpanded = arrayOfApartmentWindows(
        this.responseGroupsExpanded,
        singleArrayOfPoints,
        proportionsMapExpanded,
        totalSegmentWidthMinusGapsExpanded,
        this.segmentGap,
        0,
        0,
        this.rowHeight
      );
      const arrayOfBuildingsCollapsed = arrayOfApartmentWindows(
        this.responseGroupsCollapsed,
        singleArrayOfPoints,
        proportionsMapCollapsed,
        totalSegmentWidthMinusGapsCollapsed,
        this.segmentGap,
        0,
        0,
        this.rowHeight
      );
      Object.keys(sample[impVar]!).forEach((waveString) => {
        sample[impVar]![waveString]!.forEach((el, idx) => {
          //get the building for the response of the current point
          const buildingIdxExpanded = this.responseGroupsExpanded.findIndex(
            (responseGroup) =>
              responseGroup.includes(
                sample[impVar]![waveString]![idx]!.response as string
              )
          );
          const buildingIdxCollapsed = this.responseGroupsCollapsed.findIndex(
            (responseGroup) =>
              responseGroup.includes(
                sample[impVar]![waveString]![idx]!.response as string
              )
          );
          sample[impVar]![waveString]![idx] = {
            ...sample[impVar]![waveString]![idx],
            byResponse: {
              expanded: arrayOfBuildingsExpanded[buildingIdxExpanded]!.shift(),
              collapsed:
                arrayOfBuildingsCollapsed[buildingIdxCollapsed]!.shift(),
            },
          };
        });
      });
    });
  }
  addByResponseAndParty(
    sample: Record<string, Record<string, Record<string, unknown>[]>>
  ) {
    Object.keys(sample).forEach((impVar) => {
      //consolidate the sampled points across waves into a single array of points
      const singleArrayOfPoints = Object.values(sample[impVar]!).flat() as {
        response: string;
        pid3: string;
      }[];
      //make the proportions maps that return the proportion for each response group both expanded and collapsed
      //note that these are 2-layer maps that return proportions by party AND response
      const proportionsMapExpanded = getProportions(
        singleArrayOfPoints,
        this.responseGroupsExpanded,
        "response",
        this.partyGroups,
        "pid3"
      ) as Map<string[], Map<string[], number>>;
      const proportionsMapCollapsed = getProportions(
        singleArrayOfPoints,
        this.responseGroupsCollapsed,
        "response",
        this.partyGroups,
        "pid3"
      ) as Map<string[], Map<string[], number>>;
      //compute the total width of each party's row of segments, not including the gaps between rows
      //this width is the same for all party groups
      const partyRowTotalWidth =
        (this.vizWidth - this.partyRowGap * (this.partyGroups.length - 1)) /
        this.partyGroups.length;
      //compute the total width of the segments within each party's row, not including gaps between the segments, both expanded and collapsed
      //since the segmentgap is set at the app level, this width is the same for all party groups
      const totalSegmentWidthMinusGapsExpanded =
        partyRowTotalWidth -
        this.segmentGap * (this.responseGroupsExpanded.length - 1);
      const totalSegmentWidthMinusGapsCollapsed =
        partyRowTotalWidth -
        this.segmentGap * (this.responseGroupsCollapsed.length - 1);
      //for each of the Expanded and Collapsed views, make an array of arrays of coordinates.
      //the outer array is for the party groups, inner arrays are for the response groups
      const rowsOfCoordinates = this.partyGroups.map(
        (partyGroup, partyGroupIdx) => {
          //now building the row of coordinates for points from the current impVar with pid3 in the current party group
          //get the subset of points in the current partyGroup
          const pointSubsetParty = singleArrayOfPoints.filter((point) =>
            partyGroup.includes(point.pid3)
          );
          //compute the Y coordinate of the top left of the row of points for the current party
          const topLeftYParty = 0;
          //compute the X coordinate of the top left of the row of points for the current party
          //This is the total width of party rows (constant across parties) plus row gaps for party groups (constant across parties) to the left of the current party group
          const topLeftXParty =
            0 + partyGroupIdx * (partyRowTotalWidth + this.partyRowGap);
          //now we can get the coordinates for the segments for the current party
          //coordinates for the expanded view
          const currentPartyArrayOfBuildingsExpanded = arrayOfApartmentWindows(
            this.responseGroupsExpanded,
            pointSubsetParty,
            proportionsMapExpanded.get(partyGroup)!,
            totalSegmentWidthMinusGapsExpanded,
            this.segmentGap,
            topLeftXParty,
            topLeftYParty,
            this.rowHeight
          );
          //coordinates for the collapsed view
          const currentPartyArrayOfBuildingsCollapsed = arrayOfApartmentWindows(
            this.responseGroupsCollapsed,
            pointSubsetParty,
            proportionsMapCollapsed.get(partyGroup)!,
            totalSegmentWidthMinusGapsCollapsed,
            this.segmentGap,
            topLeftXParty,
            topLeftYParty,
            this.rowHeight
          );
          //each of currentPartyArrayOfBuildings (Expanded/Collapse) is an array of arrays of coordinates
          //the outer array is of segments for  the current party
          //--one segment for each imp response --
          //each segment contains an array of point coordinates.
          //the number of elements in an inner array is equal
          //to the number of points in the sample at the given impvar with the
          //party id in the current partyGroup and response in the relevant segment.
          return {
            expanded: currentPartyArrayOfBuildingsExpanded,
            collapsed: currentPartyArrayOfBuildingsCollapsed,
          };
        }
      );
      //we now have rowsOfCoordinates.
      //rowsOfCoordinates is an array
      //There is one element in this array for each partyGroup in this.partyGroups, in that order.
      //Each elemeent is an object with properties expanded and collapsed.
      //each of these properties points to an array.
      //There is one element in each array for this.responseGroupsExpanded and this.responseGroupsCollapsed,
      //respectively.
      //Each of these elements is an array of coordinates.
      Object.keys(sample[impVar]!).forEach((waveString) => {
        sample[impVar]![waveString]!.forEach((point, pointIdx) => {
          //get the index in the partyGroups array that matches the pid3 of the current point
          const partyIdx = this.partyGroups.findIndex((partyGroup) =>
            partyGroup.includes(point.pid3 as string)
          );
          //get the index in the responseGroupsExpanded array that matches the response of the current point
          const responseExpandedIdx = this.responseGroupsExpanded.findIndex(
            (responseGroup) => responseGroup.includes(point.response as string)
          );
          //and same thing fro the responseGroupsCollapsed array...
          const responseCollapsedIdx = this.responseGroupsCollapsed.findIndex(
            (responseGroup) => responseGroup.includes(point.response as string)
          );
          sample[impVar]![waveString]![pointIdx] = {
            ...sample[impVar]![waveString]![pointIdx],
            byResponseParty: {
              expanded:
                rowsOfCoordinates[partyIdx]!.expanded[
                  responseExpandedIdx
                ]!.shift(),
              collapsed:
                rowsOfCoordinates[partyIdx]!.collapsed[
                  responseCollapsedIdx
                ]!.shift(),
            },
          };
        });
      });
    });
  }
  addByResponseAndWave(
    sample: Record<string, Record<string, Record<string, unknown>[]>>
  ) {
    Object.keys(sample).forEach((impVar) => {
      Object.keys(sample[impVar]!).forEach((waveString, waveStringIdx) => {
        const coordinatesExpanded = arrayOfApartmentWindows(
          this.responseGroupsExpanded,
          sample[impVar]![waveString]! as {
            [key: string]: string;
            response: string;
          }[],
          getProportions(
            sample[impVar]![waveString]! as Record<string, string>[],
            this.responseGroupsExpanded,
            "response",
            undefined,
            undefined
          ) as Map<string[], number>,
          this.vizWidth -
          this.segmentGap * (this.responseGroupsExpanded.length - 1),
          this.segmentGap,
          0,
          0 + (this.rowHeight + this.waveVizGap) * waveStringIdx,
          this.rowHeight
        );
        const coordinatesCollapsed = arrayOfApartmentWindows(
          this.responseGroupsCollapsed,
          sample[impVar]![waveString]! as {
            [key: string]: string;
            response: string;
          }[],
          getProportions(
            sample[impVar]![waveString]! as Record<string, string>[],
            this.responseGroupsCollapsed,
            "response",
            undefined,
            undefined
          ) as Map<string[], number>,
          this.vizWidth -
          this.segmentGap * (this.responseGroupsCollapsed.length - 1),
          this.segmentGap,
          0,
          0 + (this.rowHeight + this.waveVizGap) * waveStringIdx,
          this.rowHeight
        );
        sample[impVar]![waveString]!.forEach((point, pointIdx) => {
          const expandedResponseGroupIdx =
            this.responseGroupsExpanded.findIndex((rg) =>
              rg.includes(point.response as string)
            );
          const collapsedResponseGroupIdx =
            this.responseGroupsCollapsed.findIndex((rg) =>
              rg.includes(point.response as string)
            );
          sample[impVar]![waveString]![pointIdx] = {
            ...sample[impVar]![waveString]![pointIdx]!,
            byResponseWave: {
              expanded: coordinatesExpanded[expandedResponseGroupIdx]!.shift(),
              collapsed:
                coordinatesCollapsed[collapsedResponseGroupIdx]!.shift(),
            },
          };
        });
      });
    });
  }
  addByResponseAndWaveAndParty(
    sample: Record<string, Record<string, Record<string, unknown>[]>>
  ) {
    Object.keys(sample).forEach((impVar) => {
      Object.keys(sample[impVar]!).forEach((waveString, waveStringIdx) => {
        this.partyGroups.forEach((partyGroup, partyGroupIdx) => {
          const coordinatesExpanded = arrayOfApartmentWindows(
            this.responseGroupsExpanded,
            sample[impVar]![waveString]!.filter((point) =>
              partyGroup.includes(point.pid3 as string)
            ) as { [key: string]: string; response: string }[],
            getProportions(
              sample[impVar]![waveString]!.filter((point) =>
                partyGroup.includes(point.pid3 as string)
              ) as Record<string, string>[],
              this.responseGroupsExpanded,
              "response",
              undefined,
              undefined
            ) as Map<string[], number>,
            (this.vizWidth - this.partyRowGap * (this.partyGroups.length - 1)) /
            3 -
            this.segmentGap * (this.responseGroupsExpanded.length - 1),
            this.segmentGap,
            0 +
            partyGroupIdx *
            ((this.vizWidth -
              this.partyRowGap * (this.partyGroups.length - 1)) /
              3 +
              this.partyRowGap),
            0 + waveStringIdx * (this.rowHeight + this.waveVizGap),
            this.rowHeight
          );
          const coordinatesCollapsed = arrayOfApartmentWindows(
            this.responseGroupsCollapsed,
            sample[impVar]![waveString]!.filter((point) =>
              partyGroup.includes(point.pid3 as string)
            ) as { [key: string]: string; response: string }[],
            getProportions(
              sample[impVar]![waveString]!.filter((point) =>
                partyGroup.includes(point.pid3 as string)
              ) as Record<string, string>[],
              this.responseGroupsCollapsed,
              "response",
              undefined,
              undefined
            ) as Map<string[], number>,
            (this.vizWidth - this.partyRowGap * (this.partyGroups.length - 1)) /
            3 -
            this.segmentGap * (this.responseGroupsCollapsed.length - 1),
            this.segmentGap,
            0 +
            partyGroupIdx *
            ((this.vizWidth -
              this.partyRowGap * (this.partyGroups.length - 1)) /
              3 +
              this.partyRowGap),
            0 + waveStringIdx * (this.rowHeight + this.waveVizGap),
            this.rowHeight
          );
          sample[impVar]![waveString]!.forEach((point, pointIdx) => {
            if (partyGroup.includes(point.pid3 as string)) {
              const expandedResponseGroupIdx =
                this.responseGroupsExpanded.findIndex((rg) =>
                  rg.includes(point.response as string)
                );
              const collapsedResponseGroupIdx =
                this.responseGroupsCollapsed.findIndex((rg) =>
                  rg.includes(point.response as string)
                );
              sample[impVar]![waveString]![pointIdx] = {
                ...sample[impVar]![waveString]![pointIdx]!,
                byResponseWaveParty: {
                  expanded:
                    coordinatesExpanded[expandedResponseGroupIdx]!.shift(),
                  collapsed:
                    coordinatesCollapsed[collapsedResponseGroupIdx]!.shift(),
                },
              };
            }
          });
        });
      });
    });
  }
}
