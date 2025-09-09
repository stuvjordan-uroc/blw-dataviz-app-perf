import { useEffect, useState } from "react";
import loadImage from "./load-image";
type ImageState =
  | {
      data: Map<string, HTMLImageElement>;
      isLoading: false;
      didError: false;
    }
  | {
      data: null;
      isLoading: true;
      didError: false;
    }
  | {
      data: null;
      isLoading: false;
      didError: true;
    };

export default function useCircleImages(
  partyStringToPathMap: Map<string, string>
) {
  const [circleImages, setCircleImages] = useState<ImageState>({
    data: null,
    isLoading: true,
    didError: false,
  });
  //add image elements to each entry in the passed map
  const partyStringToPathAndImageMap = new Map(
    partyStringToPathMap
      .entries()
      .map(
        ([partyString, path]) =>
          [partyString, [path, new Image()]] as [
            string,
            [string, HTMLImageElement],
          ]
      )
  );
  useEffect(() => {
    let ignore = false;
    Promise.all(
      partyStringToPathAndImageMap
        .values()
        .map(([path, image]) => loadImage([path, image]))
    )
      .then(() => {
        //images referenced in partStringToPathAndImageMap are all now loaded
        if (!ignore) {
          setCircleImages({
            data: new Map(
              partyStringToPathAndImageMap
                .entries()
                .map(
                  ([partyString, [_path, image]]) =>
                    [partyString, image] as [string, HTMLImageElement]
                )
            ),
            isLoading: false,
            didError: false,
          });
        }
      })
      .catch(() => {
        if (!ignore) {
          setCircleImages({
            data: null,
            isLoading: false,
            didError: true,
          });
        }
      });
    return () => {
      ignore = true;
    };
  });
  return circleImages;
}
