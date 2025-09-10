export default function loadImage(path: string, image: HTMLImageElement) {
  //create a promise
  const loadingPromise = new Promise<[string, HTMLImageElement]>((resolve, reject) => {
    image.onload = () => {
      resolve([path, image]);
    };
    image.onerror = () => {
      reject(
        new Error(
          "Error thrown when browser tried to load image from path " + path
        )
      );
    };
  });
  return loadingPromise;
}
