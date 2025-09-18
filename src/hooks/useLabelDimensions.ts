//types
import type { RequestedView } from "./use-view";
import type { SegmentCoordinates } from "../../build-data";
//hooks
import { useState, useRef, useLayoutEffect } from "react";

export function useWaveLabelDimensions() {
  //state to track label dimensions so we can center the label on an absolute position
  const [labelDimensions, setLabelDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  //ref for the label node so we can get dimensions
  const labelRef = useRef<null | HTMLDivElement>(null);
  //useLayoutEffect to get dimensions and set labelDimensions state
  useLayoutEffect(() => {
    if (labelRef.current) {
      const rect = labelRef.current.getBoundingClientRect();
      setLabelDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);
  return ([labelDimensions, labelRef] as [
    {
      width: number;
      height: number;
    },
    React.RefObject<HTMLDivElement | null>
  ])
}

export function useSegmentLabelDimensions(segment: undefined | {
  view: RequestedView;
  groups?: {
    response: string[];
    wave?: number;
    party?: string[];
  };
  coordinates: SegmentCoordinates;
}) {
  //state to track label dimensions so we can center the label on an absolute position
  const [labelDimensions, setLabelDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  //ref for the label node so we can get dimensions
  const labelRef = useRef<null | HTMLDivElement>(null);
  //useLayoutEffect to get dimensions and set labelDimensions state
  useLayoutEffect(() => {
    if (labelRef.current) {
      const rect = labelRef.current.getBoundingClientRect();
      setLabelDimensions({
        width: rect.width,
        height: rect.height,
      });
    }
  }, [segment]);
  return ([labelDimensions, labelRef] as [
    {
      width: number;
      height: number;
    },
    React.RefObject<HTMLDivElement | null>
  ])
}