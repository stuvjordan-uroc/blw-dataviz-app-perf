export default function loadImage([path, imageRef]: [
  string,
  HTMLImageElement,
]) {
  const loadingPromise = new Promise((resolve, reject) => {
    imageRef.addEventListener("load", () => {
      resolve([path, imageRef]);
    });
    imageRef.addEventListener("error", () => {
      reject(
        new Error(
          "Error thrown when browser tried to load image from path " + path
        )
      );
    });
    imageRef.src = path;
  });
  return loadingPromise as Promise<[string, HTMLImageElement]>;
}
