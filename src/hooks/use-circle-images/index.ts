import { useEffect, useState } from "react";
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
    //create the imageelements in a map linking each partystring to a new 
    // HTMLImageElement in the browser's memory
    const imageElements = new Map(
      partyStringToPathMap.entries().map(([partyString, path]) => ([
        partyString,
        [path, new Image()]
      ] as [string, [string, HTMLImageElement]]))
    )
    //for each image in the map, create a promise that resolves when the image loads
    //and rejects when the image errors
    const imagePromises = imageElements.values().map(([_path, image]) =>
      new Promise<void>((resolve, reject) => {
        image.onload = () => { resolve() }
        image.onerror = () => { reject() }
      })
    )
    //create a promise that resolves when all the images have loaded and rejects when
    //any of the images errors
    const allImagesPromise = Promise.all(imagePromises)
    //set handlers on the allImagePromise that set the circleImages state
    let ignore = false;
    allImagesPromise
      .then(() => {
        if (!ignore) {
          setCircleImages({
            data: new Map(
              imageElements.entries().map(([partyString, [_path, image]]) => ([
                partyString,
                image
              ]))
            ),
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
    imageElements.values().forEach(([path, image]) => {
      image.src = path
    })
    return (() => { ignore = true })
  })
  return circleImages;
}
