//there is a lot of forEach loops in this file,
//and typescript doesn't handle checks for undefined in forEach well
//so we disable no-non-null assertions for the whole file.
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Config, Sample, ScreenSize } from "./types.ts";
import { rowOfSegments, segment, rowOfRowsOfSegments, rowOfRowsOfSegments } from "./segments.ts";

export default class ImpCoordinates {
  //members
  config: Config;
  screenSize: ScreenSize;
  //constructor
  constructor(config: Config, screenSize: ScreenSize) {
    this.config = config;
    this.screenSize = screenSize;
  }
  //methods
  arrayOfSegmentWidths(arrayOfNumbersOfPoints: number[]) {
    //Every segment has a minimum width of 2*pointRadius.
    //Then to allocate the remaining space proportionally.
    //This means that if there are any zeros in arrayOfNumbersOfPoints, there will still be a positive width
    //for the segements corresponding to those zeros
    const totalPoints = arrayOfNumbersOfPoints.reduce((acc, curr) => acc + curr, 0)
    const totalWidthAfterDefault = this.config[this.screenSize].vizWidth - //start with the entire vizWidth
      this.config[this.screenSize].segmentGap * (arrayOfNumbersOfPoints.length - 1) -  //subtract the segment gaps
      2 * this.config[this.screenSize].pointRadius * (arrayOfNumbersOfPoints.length) //subtract the starting width of pointRadius for each segment
    return arrayOfNumbersOfPoints.map(num =>
      2 * this.config[this.screenSize].pointRadius //minimum segment width 
      + (num / totalPoints) * totalWidthAfterDefault //plus proportion of remaining space
    )
  }
  addUnsplit(sample: Sample) {
    Object.keys(sample).forEach(impVar => {  //loop through each impVar in the sample
      //compute the total number of points at this impVar
      const numPointsAtCurrentImpVar = Object.keys(sample[impVar]!) //returns an array of waveStrings
        .map(waveString => sample[impVar]![waveString]!.length) //map each waveString to the number of points in the array it points to
        .reduce((acc, curr) => acc + curr, 0) //sum those numbers
      const coordinates = segment(
        numPointsAtCurrentImpVar,
        this.config[this.screenSize].pointRadius,
        0,
        this.config[this.screenSize].labelHeightTop,
        this.config[this.screenSize].vizWidth,
        this.config[this.screenSize].vizWidth / this.config[this.screenSize].A
      ) //returns an array of coordinates, of length numPointsAtCurrentImpVar
      if (!coordinates) {
        console.log(`WARNING: Could not set coordinates for the unsplit view on ${impVar}, coordinates(...) returned undefined.  This means there is not enough space for the specified pointSize.`)
      } else {
        //loop through the coordinates at the current impVar, assigning them
        //the coordinates we just generated sequentially
        Object.keys(sample[impVar]!).forEach(waveString => { //loop through the wavesStirings
          sample[impVar]![waveString]!.forEach(point => {
            const nextCoordinate = coordinates.shift()
            if (!nextCoordinate) {
              console.log(`WARNING: Failed to generate enough coordinates to complete the unsplit view for ${impVar}`)
            } else {
              point.unsplit = nextCoordinate
            }
          })
        })
      }

    })
  }
  addByResponse(sample: Sample) {
    Object.keys(sample).forEach(impVar => {  //loop through each impVar in the sample
      ['expanded', 'collapsed'].forEach(viewType => {
        //make an array of numbers of points
        const responseArrays = viewType === 'expanded' ? this.config.responsesExpanded : this.config.responsesCollapsed
        const arrayOfNumbersOfPoints = responseArrays.map(responseArray =>
          Object.keys(sample[impVar]!) //returns an array of waveStrings
            .map(waveString => sample[impVar]![waveString]!.filter(point => responseArray.includes(point.response!)).length) //array of counts of responses included in the current responseArray
            .reduce((acc, curr) => acc + curr, 0) //sum them
        )
        //get the array of segment widths
        const arrayOfSegmentWidths = this.arrayOfSegmentWidths(arrayOfNumbersOfPoints)
        //get the array of arrays of coordinates.
        //this is an array of arrays.  Each inner array holds coordinates for points filling a segment 
        const arrayOfArraysOfCoordinates = rowOfSegments(
          arrayOfNumbersOfPoints,
          this.config[this.screenSize].pointRadius,
          0,
          this.config[this.screenSize].segmentGap,
          this.config[this.screenSize].labelHeightTop,
          arrayOfSegmentWidths,
          this.config[this.screenSize].vizWidth / this.config[this.screenSize].A
        )
        //rowOfSegments returns undefined if you give it an array of numbers of points with a length that
        //is not the same as the length of the array of segmentWidths you give it.
        //but you can see in the code above that arrayOfSegmentWidths is created by calling .map
        //on arrayOfNumbersOfPoints.
        //So we know that arrayOfArrayOfCoordanates is not undefined.
        //Each array in arrayOfArrayOfCoordinates are the coordinates for the points associated with one response.
        //So we need to loop through the expanded responses, and then assign those coordinates accordingly.
        responseArrays.forEach((responseArray, responseArrayIdx) => {
          const coordinatesForCurrentResponseArray = arrayOfArraysOfCoordinates![responseArrayIdx]
          if (!coordinatesForCurrentResponseArray) {
            console.log(`WARNING: Could not set coordinates for the byResponse ${viewType} view on ${impVar} for responses`, responseArray, `because coordinates(...) returned undefined.  This means there is not enough space for the specified pointSize.`)
          } else {
            Object.keys(sample[impVar]!).forEach(waveString => {//loop through the wavestrings
              //loop through the points at the current waveString
              sample[impVar]![waveString]!.forEach((point, pointIdx) => {
                if (responseArray.includes(point.response!)) {
                  const nextCoordinate = coordinatesForCurrentResponseArray.shift()
                  if (!nextCoordinate) {
                    console.log(`WARNING: Failed to generate enough coordinates to complete the byResponse ${viewType} view for ${impVar} at`, responseArray)
                  } else {
                    if (sample[impVar]![waveString]![pointIdx]!.byResponse) {
                      sample[impVar]![waveString]![pointIdx]!.byResponse = {
                        ...sample[impVar]![waveString]![pointIdx]!.byResponse,
                        [viewType]: nextCoordinate
                      }
                    } else {
                      sample[impVar]![waveString]![pointIdx] = {
                        ...sample[impVar]![waveString]![pointIdx],
                        byResponse: {
                          [viewType]: nextCoordinate
                        }
                      }
                    }
                  }
                }
              })
            })
          }
        })
      })
    })
  }
  addByResponseAndParty(sample: Sample) {
    Object.keys(sample).forEach(impVar => {  //loop through each impVar in the sample
      ['expanded', 'collapsed'].forEach(viewType => {
        const responseArrays = viewType === 'expanded' ? this.config.responsesExpanded : this.config.responsesCollapsed
        //make an array of arrays of numbers of points
        const arrayOfArraysOfNumbersOfPoints = this.config.partyGroups.map(partyGroup => {
          return responseArrays.map(responseArray =>
            Object.keys(sample[impVar]!) //returns an array of waveStrings
              .map(waveString =>
                sample[impVar]![waveString]!
                  .filter(point => (responseArray.includes(point.response!) && partyGroup.includes(point.pid3!)))
                  .length
              ) //array of counts of responses included in the current responseArray and current partyArray
              .reduce((acc, curr) => acc + curr, 0) //sum them
          )
        })
        //make the array of arrays of segment widths
        const arrayOfArraysOfSegmentWidths = arrayOfArraysOfNumbersOfPoints.map(arrayOfNumbersOfPoints =>
          this.arrayOfSegmentWidths(arrayOfNumbersOfPoints)
        )
        //get the row of rows of segments
        const arrayOfArraysOfArraysOfCoordinates = rowOfRowsOfSegments(
          arrayOfArraysOfNumbersOfPoints,
          this.config[this.screenSize].pointRadius,
          0,
          this.config[this.screenSize].rowGap,
          this.config[this.screenSize].segmentGap,
          this.config[this.screenSize].labelHeightTop,
          arrayOfArraysOfSegmentWidths,
          this.config[this.screenSize].vizWidth / this.config[this.screenSize].A
        )
        //rowOfRowsOfSegments returns undefined if arrayOfArraysOfNumbersOfPoints.length !==
        //arrayOfArraysOfSegmentWidths.length.  But we constructed these two variables
        //above so that they MUST have the same length.  So we know that
        //arrayOfArraysOfArraysOfCoordinates is not undefined.
        //If it does not return undefined, rowOfRowsOfSegments returns an array.
        //Each element of this array is a return value from rowOfSegments. (defined in segments.ts and imported at the top of this file)

        //given the construction of arrayOfArraysOfNumbersOfPoints and 
        //arrayOfArraysOfSegmentWidths rowOfSegments returns an array of arrays of coordinates
        //each top-level array is a segment for a single responseArray in responseArrays.

        //So we need to loop through the partyGroups.  Then for each partyGroup, we need to loop through
        //the responseArrays.  At each partyGroup-responseArray, we then access the array of coordinates
        //at arrayOfArraysOfArraysOfCoordinates, and assign those coordinates to the sample accordingly.
        this.config.partyGroups.forEach((partyGroup, partyGroupIdx) => {
          responseArrays.forEach((responseArray, responseArrayIdx) => {
            const coordinatesForCurrentPartyGroupAndResponseArray = arrayOfArraysOfArraysOfCoordinates![partyGroupIdx]![responseArrayIdx]
            if (!coordinatesForCurrentPartyGroupAndResponseArray) {
              console.log(`WARNING: Could not set coordinates for the byResponseAndParty ${viewType} view on ${impVar} for parties`, partyGroup, `and responses`, responseArray, `because coordinates(...) returned undefined.  This means there is not enough space for the specified pointSize.`)
            } else {
              Object.keys(sample[impVar]!).forEach(waveString => {//loop through the wavestrings
                //loop through the points at the current waveString
                sample[impVar]![waveString]!.forEach((point, pointIdx) => {
                  if (partyGroup.includes(point.pid3!) && responseArray.includes(point.response!)) {
                    const nextCoordinate = coordinatesForCurrentPartyGroupAndResponseArray.shift()
                    if (!nextCoordinate) {
                      console.log(`WARNING: Failed to generate enough coordinates to complete the byResponseAndParty ${viewType} view for ${impVar} at`, partyGroup, `and`, responseArray)
                    } else {
                      if (sample[impVar]![waveString]![pointIdx]!.byResponseParty) {
                        sample[impVar]![waveString]![pointIdx]!.byResponseParty = {
                          ...sample[impVar]![waveString]![pointIdx]!.byResponseParty,
                          [viewType]: nextCoordinate
                        }
                      } else {
                        sample[impVar]![waveString]![pointIdx] = {
                          ...sample[impVar]![waveString]![pointIdx]!,
                          byResponseParty: {
                            [viewType]: nextCoordinate
                          }
                        }
                      }
                    }
                  }
                })
              })
            }
          })
        })
      })
    })
  }
}