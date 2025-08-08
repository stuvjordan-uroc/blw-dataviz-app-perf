import type { Config, Sample, ScreenSize } from "./types.ts";

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

  }
}