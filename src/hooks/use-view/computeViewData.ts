import type { RequestedView } from "./requested-view";
import { requestedViewToString } from "./requested-view";
import type { SegmentViewsUnMapped, PointsViews } from "../../../build-data";

export interface ViewData {
  noPartyOpacity: number,
  partyOpacity: number,
  coordinates: Map<
    string,
    {
      rg: string[],
      wave: number,
      pg: string[],
      coordinates: { x: number, y: number }[]
    }[]
  >
}

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
    noPartyOpacity: +(!requestedView.party),
    partyOpacity: +requestedView.party,
    coordinates: new Map(
      coordinateData.entries().map(([impVarName, { pointGroups }]) => {
        const viewKeyString = requestedViewToString(requestedView)
        return ([
          impVarName,
          pointGroups.map(({ rg, wave, pg, coordinates }) => ({
            rg: rg,
            wave: wave,
            pg: pg,
            coordinates: requestedView.response ? (coordinates.expanded)[viewKeyString as "byResponse" | "byResponseAndWave" | "byResponseAndParty" | "byResponseAndWaveAndParty"] : coordinates.unsplit
          }))
        ])
      })
    )
  }
}
