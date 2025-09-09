import { useState, useEffect } from "react";
import type { SegmentViewsUnMapped, PointsMapUnMapped } from "../../build-data";
type RawCoordinates = Record<
  string,
  {
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  }
>;
type CoordinatesState =
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
      data: RawCoordinates;
      isLoading: false;
      didError: false;
    };

export default function useCoordinates(pathToCoordinates: string) {
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
                data: data,
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
