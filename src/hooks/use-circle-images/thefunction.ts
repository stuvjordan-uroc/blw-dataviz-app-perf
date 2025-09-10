/*
Takes a map that take each string key to a string that is treated
as a path to an image file (e.g. a png file)

Does a few things...

(1) Creates an un-attached and un-loaded instance of HTMLImageObject for
each keystring in the passed map
(2)  Creates a new map that takes each keystring in the passed map
to a tuple containing the path from the passed map at that keystring and one
of those newly creating instances of HTMLImageObject
(3) Creates a promise that errors if/when any of the images in the 
map created in (2) errors, and resolves to the map created in (2)
if/when ALL of the images in the map load.
(4)  Returns that promise

The caller can then take that promise, and...
(a) Use it's then method to run code that does something with the loaded images
(b) Use its catch method to run code in response to the failure of any of the
images to load.
*/


export default function ImagesMapPromise(
  partyStringToPathMap: Map<string, string>
) {
  //create an instance of HTMLImageElement for each entry in the passed map
  const imageInstances = new Map(
    partyStringToPathMap.entries().map(([partyString, path]) => ([
      partyString,
      [path, new Image()]
    ] as [string, [string, HTMLImageElement]]))
  )
  //for each instance in the map,
  //create a promise that 
  // (a) resolves when the image loads and
  // (b) rejects when the image errors
  const instancePromises = imageInstances.values().map(([_path, image]) =>
    new Promise<void>((resolve, reject) => {
      image.onload = () => { resolve() }
      image.onerror = () => { reject() }
    })
  )
  //create a promise that resolves when all the images have loaded and rejects when
  //any of the images errors
  const allImagesPromise = Promise.all(instancePromises)
  const imagePromise = new Promise<Map<string, HTMLImageElement>>((resolve, reject) => {
    allImagesPromise
      .then(() => {
        resolve(
          new Map(
            imageInstances.entries().map(([partyString, [_path, image]]) => ([
              partyString,
              image
            ]))
          )
        )
      })
      .catch(() => {
        reject()
      })
  })
  return imagePromise
}