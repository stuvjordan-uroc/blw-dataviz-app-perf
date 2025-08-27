import type { Point } from "../types.ts"
export default function emptyPointsView() {
  return ({
    byResponse: [] as Point[],
    byResponseAndParty: [] as Point[],
    byResponseAndWave: [] as Point[],
    byResponseAndWaveAndParty: [] as Point[]
  })
}

