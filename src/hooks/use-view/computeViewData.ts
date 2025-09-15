import type { RequestedView, ViewData } from ".";
import type { SegmentViewsUnMapped, PointsViews } from "../../../build-data";

export default function computeViewData(
  requestedView: RequestedView,
  coordinateData: Map<string, {
    segments: SegmentViewsUnMapped;
    pointGroups: {
      rg: string[];
      wave: number;
      pg: string[];
      coordinates: PointsViews;
    }[];
  }>
): ViewData {
  return {
    noPartyOpacity: (requestedView[2] === "party") ? 0 : 1,
    partyOpacity: (requestedView[2] === "party") ? 1 : 0,
    coordinates: new Map(
      coordinateData.entries().map(([impVarName, { pointGroups }]) => {
        const viewKeyString = "byResponse" + (requestedView[1] === "wave" ? "AndWave" : "") + (requestedView[2] === "party" ? "AndParty" : "") as "byResponse" | "byResponseAndWave" | "byResponseAndParty" | "byResponseAndWaveAndParty"
        return ([
          impVarName,
          pointGroups.map(({ rg, wave, pg, coordinates }) => ({
            rg: rg,
            wave: wave,
            pg: pg,
            coordinates: requestedView[0] === null ? coordinates.unsplit : coordinates[requestedView[0] as "expanded" | "collapsed"][viewKeyString]
          }))
        ])
      })
    )
  }
}
