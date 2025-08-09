//there is a lot of forEach loops in this file,
//and typescript doesn't handle checks for undefined in forEach well
//so we disable no-non-null assertions for the whole file.
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Config, Sample, ScreenSize } from "./types.ts";
import { segment } from "./segments.ts";

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
}