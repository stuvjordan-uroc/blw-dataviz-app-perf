import { useState, useEffect } from "react";
import type { SegmentViewsUnMapped, PointsMapUnMapped, PointsViews } from "../../build-data";
import type { RequestedView } from "./use-view";
import type { SegmentCoordinates } from "../../build-data";
export type RawCoordinates = Record<
  string,
  {
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  }
>;
export type CoordinatesState =
  | {
    data: null;
    isLoading: true;
    didError: false;
  }
  | {
    data: null;
    isLoading: false;
    didError: true;
  }
  | {
    data: Map<string, {
      segments: {
        view: RequestedView,
        groups?: {
          response: string[],
          wave?: number,
          party?: string[]
        },
        coordinates: SegmentCoordinates
      }[];
      pointGroups: {
        rg: string[];
        wave: number;
        pg: string[];
        coordinates: PointsViews;
      }[];
    }>;
    isLoading: false;
    didError: false;
  };

function rawCoordinatesToPointGroups(rawCoordinates: RawCoordinates) {
  return new Map(Object.entries(rawCoordinates).map(([impVar, { segments, points }]) => {
    const pointGroups = points
      .map(([rg, valAtRg]) => valAtRg
        .filter(([_wave, valAtWave]) => valAtWave !== null)
        .map(([wave, valAtWave]) => valAtWave!
          .map(([pg, pointsViews]) => ({
            rg: rg,
            wave: wave,
            pg: pg,
            coordinates: pointsViews
          }))
        )
      ).flat(2)
    const flattenedSegments = [] as {
      view: RequestedView,
      groups?: {
        response: string[],
        wave?: number,
        party?: string[]
      },
      coordinates: SegmentCoordinates
    }[]
    //push the unsplit segment
    flattenedSegments.push(
      {
        view: {
          response: false,
          wave: false,
          party: false
        },
        coordinates: segments.unsplit.segmentCoordinates
      }
    )
    //push the byResponse segments
    segments.expanded.byResponse.forEach(([responseGroup, segment]) => {
      flattenedSegments.push({
        view: {
          response: true,
          wave: false,
          party: false
        },
        groups: {
          response: responseGroup,
        },
        coordinates: segment.segmentCoordinates
      })
    })
    //push the byResponseAndWave segments
    segments.expanded.byResponseAndWave.forEach(([responseGroup, unMapAtRG]) => {
      unMapAtRG.forEach(([wave, segment]) => {
        if (segment) {
          flattenedSegments.push({
            view: {
              response: true,
              wave: true,
              party: false
            },
            groups: {
              response: responseGroup,
              wave: wave
            },
            coordinates: segment.segmentCoordinates
          })
        }
      })
    })
    //push the byResponseAndParty segments
    segments.expanded.byResponseAndParty.forEach(([responseGroup, unMapAtRG]) => {
      unMapAtRG.forEach(([pg, segment]) => {
        flattenedSegments.push({
          view: {
            response: true,
            wave: false,
            party: true
          },
          groups: {
            response: responseGroup,
            party: pg
          },
          coordinates: segment.segmentCoordinates
        })
      })
    })
    //push the byResponseAndPartyAndWave segments
    segments.expanded.byResponseAndWaveAndParty.forEach(([responseGroup, unMapAtRG]) => {
      unMapAtRG.forEach(([wave, unMapAtWave]) => {
        if (unMapAtWave) {
          unMapAtWave.forEach(([pg, segment]) => {
            flattenedSegments.push({
              view: {
                response: true,
                wave: true,
                party: true
              },
              groups: {
                response: responseGroup,
                wave: wave,
                party: pg
              },
              coordinates: segment.segmentCoordinates
            })
          })
        }
      })
    })
    return ([
      impVar,
      {
        segments: flattenedSegments,
        pointGroups: pointGroups
      }
    ] as [string, {
      segments: {
        view: RequestedView,
        groups?: {
          response: string[],
          wave?: number,
          party?: string[]
        },
        coordinates: SegmentCoordinates
      }[],
      pointGroups: {
        rg: string[];
        wave: number;
        pg: string[];
        coordinates: PointsViews;
      }[]
    }])
  }))
}

export function useCoordinates(pathToCoordinates: string) {
  const [coordinates, setCoordinates] = useState<CoordinatesState>({
    data: null,
    isLoading: true,
    didError: false,
  });
  //effect to fetch coordinates on initial mount and on re-mount whenever the breakpoint has changed
  useEffect(() => {
    //flag to ignore data returned from data that comes in from a fetch that is no longer current
    let ignore = false;
    fetch(pathToCoordinates)
      .then((response) => {
        response
          .json()
          .then((data: RawCoordinates) => {
            if (!ignore) {
              setCoordinates({
                data: rawCoordinatesToPointGroups(data),
                isLoading: false,
                didError: false,
              });
            }
          })
          .catch(() => {
            setCoordinates({
              data: null,
              isLoading: false,
              didError: true,
            });
          });
      })
      .catch(() => {
        setCoordinates({
          data: null,
          isLoading: false,
          didError: true,
        });
      });
    //clean up by setting ignore to true so that stale fetches will be ignored
    return () => {
      ignore = true;
    };
  }, [pathToCoordinates]);
  return coordinates;
}
