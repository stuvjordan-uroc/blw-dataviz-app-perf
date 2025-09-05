import { useEffect, useState } from "react";
export default function (imagePaths: [string[], string][]) {
  const [imagesReady, setImagesReady] = useState<boolean>(false);
  useEffect(() => {
    //load images and setImagesReady(true) when all are loaded
    let numImagesLoaded = 0;
    imagePaths.forEach(([_pg, path]) => {
      const img = new Image();
      img.addEventListener("load", () => {
        console.log("Image loaded for party group", _pg, "from path", path);
        numImagesLoaded = numImagesLoaded + 1;
        if (numImagesLoaded === imagePaths.length) {
          setImagesReady(true);
        }
      });
      img.src = path;
    });
  }, [imagePaths]);
  return imagesReady
}