import type { Data } from "./types.ts";

interface Response {
  response: string;
  pid3: string;
  wave: number;
}

function sampleResponsesAtWaveAndPartyGroup(principle: string, wave: number, partyGroup: string[], sampleSize: number, data: Data) {
  /*
  returns a synthetic sample of sampleSize responses to the imp question on `principle`
  from among persons in the given `partyGroup` and the given `wave`.

  each response returned is an object like this: {response: string, pid3: string, wave: number}
  */

  //must be an imp principle
  if (!data.impCols.includes(principle)) {
    console.log("you passed principle", principle, "to makeImpResponses.")
    console.log("here are the impCols:", data.impCols)
    return undefined
  }

  //subset the data to rows that are nonempty on the given principle, non-empty on pid3
  //in the given partyGroup, and at the given wave
  const subset = data.data.filter(row => (
    (row.weight !== null) &&
    (row.imp[principle] !== null) &&
    (row.pid3 !== null) &&
    (partyGroup.includes(row.pid3)) &&
    (row.wave === wave)
  ))

  //return an empty array if there are no rows in the subset
  if (subset.length === 0) {
    return [] as Response[]
  }

  //create the cumulative weights so we can do a weighted sample
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const cumWeights = subset.map(row => row.weight!).map((w, wIdx, weightsArray) =>
    weightsArray.slice(0, wIdx).reduce((acc, curr) => acc + curr, 0) + w
  )
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const totalWeight = cumWeights[cumWeights.length - 1]!
  //construct the sample
  const outSample = [];
  for (let s = 1; s <= sampleSize; s++) {
    const r = Math.random() * totalWeight
    const sampledIndex = cumWeights.findIndex(cw => cw >= r)
    outSample.push({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      response: subset[sampledIndex]!.imp[principle],
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      pid3: subset[sampledIndex]!.pid3,
      wave: wave
    })
  }
  return outSample as Response[]
}