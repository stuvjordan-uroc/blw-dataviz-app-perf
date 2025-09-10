import { useEffect, useState } from "react";
import loadImages from "./load-images";
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
  useEffect(() => {
    let ignore = false;
    loadImages(partyStringToPathMap)
      .then((partyStringToImageMap) => {
        if (!ignore) {
          setCircleImages({
            data: partyStringToImageMap,
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
    return (() => { ignore = true })
  })
  return circleImages;
}
