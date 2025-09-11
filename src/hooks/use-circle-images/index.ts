import { useEffect, useState } from "react";
import PathMapToPromise from "./pathmap-to-promise";
type ImageState =
  | {
    data: Map<string, { image: HTMLImageElement, cjsBitmap: createjs.Bitmap }>;
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
  useEffect(() => {
    const [imagesAndPathsMap, imagesPromise] = PathMapToPromise(partyStringToPathMap)
    let ignore = false;
    imagesPromise
      .then((imagesMap) => {
        if (!ignore) {
          setCircleImages({
            data: imagesMap,
            isLoading: false,
            didError: false
          })
        }
      })
      .catch(() => {
        if (!ignore) {
          setCircleImages({
            data: null,
            isLoading: false,
            didError: true
          })
        }
      })
    //set each image's src property, which will cause the browser to
    //try to load the image from supplied path
    imagesAndPathsMap.forEach(([path, image]) => {
      image.src = path
    })
    return (() => { ignore = true })
  })
  return circleImages;
}
