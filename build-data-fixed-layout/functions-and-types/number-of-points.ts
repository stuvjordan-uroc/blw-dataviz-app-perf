import type { Data, Layout } from "./types.ts";

export default function numberOfPoints(principle: string, questionType: "imp" | "perf", sampleSize: number, partyGroups: string[][], data: Data) {
  /* get the number of waves in which the principle is included  */
  //get all the waves for the given question type
  const allWaves = data.waves[questionType]
  //get the waves that have at least one non-empty response on the principle-questionType
  const wavesWherePrincipleIncluded = allWaves.filter(wave => {
    const numNonEmptyRows = data.data
      .filter(row => row.wave === wave)
      .filter(row => row[questionType][principle] !== null)
      .length
    return numNonEmptyRows > 0
  })
  return wavesWherePrincipleIncluded.length * partyGroups.length * sampleSize
}