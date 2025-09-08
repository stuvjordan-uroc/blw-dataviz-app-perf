import { useState, useEffect } from "react";
import type { BreakpointKey } from "../config/layouts-types";
import type { SegmentViewsUnMapped, PointsMapUnMapped } from "../../build-data";
type RawCoordinates = Record<
  string,
  {
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  }
>;

export default function useCoordinates(breakPoint: BreakpointKey) {
  const [coordinates, setCoordinates] = useState<RawCoordinates | null>(null);
  const [coordinatesAreLoading, setCoordinatesAreLoading] = useState<boolean>(false);
  const [coordinatesDidError, setCoordinatesDidError] = useState<boolean>(false);
  //effect to fetch coordinates on initial mount and on re-mount whenever the breakpoint has changed
  useEffect(() => {
    //flag to ignore data returned from data that comes in from a fetch that is no longer current
    let ignore = false;
    setCoordinatesAreLoading(true);
    setCoordinatesDidError(false);
    fetch("/coordinates/viz-" + breakPoint + ".json")
      .then((response) => {
        response
          .json()
          .then((data: RawCoordinates) => {
            if (!ignore) {
              setCoordinates(data);
            }
          })
          .catch(() => {
            setCoordinatesDidError(true);
          });
      })
      .catch(() => {
        setCoordinatesDidError(true);
      })
      .finally(() => {
        setCoordinatesAreLoading(false);
      });
    //clean up by setting ignore to true so that stale fetches will be ignored
    return () => {
      ignore = true;
    };
  }, [breakPoint]);
  return [coordinates, coordinatesAreLoading, coordinatesDidError] as [null | RawCoordinates, boolean, boolean]
}