import { useState, useEffect } from "react";
import type { SegmentViewsUnMapped, PointsMapUnMapped, PointsViews } from "../../build-data";
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
      segments: SegmentViewsUnMapped;
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
        .filter(([wave, _valAtWave]) => wave !== null)
        .map(([wave, valAtWave]) => valAtWave!
          .map(([pg, pointsViews]) => ({
            rg: rg,
            wave: wave,
            pg: pg,
            coordinates: pointsViews
          }))
        )
      ).flat(2)
    return ([
      impVar,
      {
        segments: segments,
        pointGroups: pointGroups
      }
    ] as [string, {
      segments: SegmentViewsUnMapped, pointGroups: {
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
