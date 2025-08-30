import { useEffect, useState } from "react";
import type { BreakpointKey } from "../config/layouts-types";

export default function useCoordinateData(breakpointKey: BreakpointKey) {
  const [coordinates, setCoordinates] = useState(null);
  useEffect(() => {
    if (breakpointKey) {
      fetch('/coordinates/' + 'viz-' + breakpointKey + '.json').then(result => {

      })
    }
  }, [breakpointKey])
}