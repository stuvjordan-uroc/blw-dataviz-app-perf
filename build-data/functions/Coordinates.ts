import { pre } from "motion/react-client";
import apartmentWindows from "./apartment-windows.ts";
import getProportions from "./proportions.ts";

/* eslint-disable @typescript-eslint/no-non-null-assertion */
export default class ImpCoordinates {
  //declare members
  responseGroupsExpanded = [['Not relevant'], ['Beneficial'], ['Important'], ['Essential']];
  responseGroupsCollapsed = [['Not relevant', 'Beneficial'], ['Important', 'Essential']]
  segmentGap = 10;
  rowHeight = 30;
  vizWidth = 100;
  //constructor
  constructor(responseGroupsExpanded: string[][], responseGroupsCollapsed: string[][], segmentGap: number, rowHeight: number, vizWidth: number) {
    this.responseGroupsExpanded = responseGroupsExpanded;
    this.responseGroupsCollapsed = responseGroupsCollapsed;
    this.segmentGap = segmentGap;
    this.rowHeight = rowHeight;
    this.vizWidth = vizWidth;
  }

  //methods
  //unsplit view
  addUnsplit(sample: Record<string, Record<string, Record<string, unknown>[]>>) {
    Object.keys(sample).forEach(impVarName => {
      //total residents at this impvar
      const totalResidents = Object.keys(sample[impVarName]!)
        .map(waveString => sample[impVarName]![waveString]!.length)
        .reduce((acc, curr) => acc + curr, 0)
      //get the radius and coordinates for each resident
      const heads = apartmentWindows(0, 0, this.vizWidth, this.rowHeight, totalResidents)
      //add the coordinates to the sample
      Object.keys(sample[impVarName]!).forEach(waveString => {
        sample[impVarName]![waveString]!.forEach((el, idx) => {
          sample[impVarName]![waveString]![idx] = {
            ...sample[impVarName]![waveString]![idx],
            unsplit: heads.shift()
          }
        })
      })
    })
  }
  addByResponse(sample: Record<string, Record<string, Record<string, unknown>[]>>) {
    Object.keys(sample).forEach(impVar => {
      //consolidate the sampled points across waves into a single array of points
      const singleArrayOfPoints = Object.values(sample[impVar]!).flat() as { response: string, pid3: string }[]
      //make the proportions maps that return the proportion for each response group both expanded and collapsed
      const proportionsMapExpanded = getProportions(singleArrayOfPoints, this.responseGroupsExpanded, "response", undefined, undefined) as Map<string[], number>
      const proportionsMapCollapsed = getProportions(singleArrayOfPoints, this.responseGroupsCollapsed, "response", undefined, undefined) as Map<string[], number>
      //compute the total width of the segments, not including gaps between the segments, both expanded and collapsed
      const totalSegmentWidthMinusGapsExpanded = this.vizWidth - this.segmentGap * (this.responseGroupsExpanded.length - 1)
      const totalSegmentWidthMinusGapsCollapsed = this.vizWidth - this.segmentGap * (this.responseGroupsCollapsed.length - 1)
      //make an arrays of the same length as the arrays of response groups expanded/collapsed, in the same order as the arrays of response groups.
      //each entry in the array is the array of coordinates for the points in the relevant response group
      const arrayOfBuildingsExpanded = this.responseGroupsExpanded.map((responseGroup, responseGroupIdx) => {
        const pointSubset = singleArrayOfPoints.filter(point => responseGroup.includes(point.response))
        const topLeftY = 0;
        const topLeftX = 0 + this.responseGroupsExpanded
          .slice(0, responseGroupIdx)  //array of the response groups before the current responseGroup
          .map(prevResponseGroup => proportionsMapExpanded.get(prevResponseGroup)! * totalSegmentWidthMinusGapsExpanded + this.segmentGap) //take each of these response groups.  Get the group proportion, multiply by the totalSegmentWidthMinusGaps, add one gap for the next segment.  The result is an array of widths -- each width is the width of the relevant segment, plus the width of the gap that comes after it.
          .reduce((acc, curr) => acc + curr, 0) //sum the resulting widths to get the total
        return apartmentWindows(
          topLeftX,
          topLeftY,
          proportionsMapExpanded.get(responseGroup)! * totalSegmentWidthMinusGapsExpanded,
          this.rowHeight,
          pointSubset.length
        )
      })
      const arrayOfBuildingsCollapsed = this.responseGroupsCollapsed.map((responseGroup, responseGroupIdx) => {
        const pointSubset = singleArrayOfPoints.filter(point => responseGroup.includes(point.response))
        const topLeftY = 0;
        const topLeftX = 0 + this.responseGroupsCollapsed
          .slice(0, responseGroupIdx)  //array of the response groups before the current responseGroup
          .map(prevResponseGroup => proportionsMapCollapsed.get(prevResponseGroup)! * totalSegmentWidthMinusGapsCollapsed + this.segmentGap) //take each of these response groups.  Get the group proportion, multiply by the totalSegmentWidthMinusGaps, add one gap for the next segment.  The result is an array of widths -- each width is the width of the relevant segment, plus the width of the gap that comes after it.
          .reduce((acc, curr) => acc + curr, 0) //sum the resulting widths to get the total
        return apartmentWindows(
          topLeftX,
          topLeftY,
          proportionsMapCollapsed.get(responseGroup)! * totalSegmentWidthMinusGapsCollapsed,
          this.rowHeight,
          pointSubset.length
        )
      })
      //now add those coordinates to the points in the sample at the current impVar in this loop
      Object.keys(sample[impVar]!).forEach(waveString => {
        sample[impVar]![waveString]!.forEach((el, idx) => {
          //get the building for the response of the current point
          const buildingIdxExpanded = this.responseGroupsExpanded.findIndex(responseGroup => responseGroup.includes(sample[impVar]![waveString]![idx]!.response as string))
          const buildingIdxCollapsed = this.responseGroupsCollapsed.findIndex(responseGroup => responseGroup.includes(sample[impVar]![waveString]![idx]!.response as string))
          sample[impVar]![waveString]![idx] = {
            ...sample[impVar]![waveString]![idx],
            byResponse: {
              expanded: arrayOfBuildingsExpanded[buildingIdxExpanded]!.shift(),
              collapsed: arrayOfBuildingsCollapsed[buildingIdxCollapsed]!.shift()
            }
          }
        })
      })
    })
  }

}