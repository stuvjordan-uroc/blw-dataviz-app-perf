import type { Layout, SegmentGroups, Point } from "./types.ts";
export default function makePoints(sampleSize: number, segmentGroups: SegmentGroups) {
  //for the principle we're building for,
  //we want sampleSize points for each wave-partyGroup at each wave where
  //that principle is included.


  //this is implied by the structure of segmentGroups.explanded.byResponseAndPartyAndWave
  segmentGroups.expanded.byResponseAndPartyAndWave.map(wave => {
    if (wave.length === 0) {
      return []
    }
    return wave.map(partyGroup => new Array(sampleSize).fill(  /* write code to make a new empty point here  */))
  })


}