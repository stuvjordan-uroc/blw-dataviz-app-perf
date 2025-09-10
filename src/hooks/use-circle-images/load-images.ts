import loadImage from "./load-image";




export default function loadImages(partyStringToPathMap: Map<string, string>) {
  //create image elements
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
  const loadAllPromise = new Promise<Map<string, HTMLImageElement>>((resolve, reject) => {
    Promise.all(
      partyStringToPathAndImageMap
        .values()
        .map(([path, image]) => loadImage([path, image]))
    )
      .then(() => {
        resolve(
          new Map(
            partyStringToPathAndImageMap
              .entries()
              .map(([partyString, [_path, image]]) => ([partyString, image]))
          )
        )
      })
      .catch(() => {
        reject(new Error("One or more images errored"))
      })
  })
  return loadAllPromise
}