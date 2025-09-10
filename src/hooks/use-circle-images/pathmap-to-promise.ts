/*
Takes a Map<string,string> where the values
are assumed to be paths to image files (e.g. '/some/directory/image.png')

Does a few things...

(1) Creates a Map<string,HTMLImageElement> where the keys are the keys from the
passed-in map, and the values are un-loaded images not attached to any DOM.
(2) Creates an array of Promises, each Promise in the array corresponding 
to one of the HTMLImageElement instances in the Map created in (1).  The HTMLImageInstance
corresponding to any one of these promises is given an onload handler that 
resolves it's corresponding promise when invoked, and a onerror hander that
rejects the promise when invoked.
(3) Creates a promise that errors if/when any of the Promises created in (2) errors
and resolves to the map created in (1) when all the Promises created in (2) resolve.  
Thus, this promise resolves to the Map created in (1) when all the images in that map
have loaded.
(4)  Returns an array where the first eleement is the map created in (1)
and the second element is the promise created in (3)

The caller can then...
(a) Use the returned promise to set up a handlers that fire
when all the images load or when one of the images errors
(b) Use the returned map to set each image's source element to start the loading process
*/

export default function PathMapToPromise(
  partyStringToPathMap: Map<string, string>
) {
  //create an instance of HTMLImageElement for each entry in the passed map
  const imageMapWithPaths = new Map(
    partyStringToPathMap.entries().map(([partyString, path]) => ([
      partyString,
      [path, new Image()]
    ] as [string, [string, HTMLImageElement]]))
  )
  //for each instance in the map,
  //create a promise that 
  // (a) resolves when the image loads and
  // (b) rejects when the image errors
  const instancePromises = imageMapWithPaths.values().map(([_path, image]) =>
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
            imageMapWithPaths.entries().map(([keystring, [_path, image]]) => ([
              keystring,
              image
            ]))
          )
        )
      })
      .catch(() => { reject() })
  })
  return [imageMapWithPaths, imagePromise] as [
    Map<string, [string, HTMLImageElement]>,
    Promise<Map<string, HTMLImageElement>>
  ]
}