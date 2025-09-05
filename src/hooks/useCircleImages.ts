import { useState } from "react";
import type { BreakpointKey, BreakpointConfig } from "../config/layouts-types";
export default function useCircleImages(
  partyGroups: string[][],
  layout: ({ breakPointKey: BreakpointKey } & BreakpointConfig) | undefined
) {
  //array to map party groups to image path and id
  const images = partyGroups.map(
    (pg) =>
      [
        pg,
        {
          path: layout
            ? `/img/${layout.breakPointKey}-${pg.join("-")}.png`
            : null,
          id: pg.join("-"),
        },
      ] as [string[], { path: string | null; id: string }]
  );
  //state to track how many images are loaded
  const [numImagesReady, setNumImagesReady] = useState<number>(0);
  //handler to update the state when an image loads
  const imageOnLoadHandler = () => {
    setNumImagesReady((numImagesReady) => numImagesReady + 1);
  };
  return [images, numImagesReady, imageOnLoadHandler] as [
    [
      string[],
      {
        path: string | null;
        id: string;
      },
    ][],
    number,
    () => void,
  ];
}
