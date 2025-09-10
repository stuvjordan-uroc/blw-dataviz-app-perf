import { it, describe, beforeEach, afterEach, vi, expect } from 'vitest'
import PathMapToPromise from '../../src/hooks/use-circle-images/pathmap-to-promise';

/*
When its invoked, pathMaptoPromise calls new Image() to create new
instances of HTMLImageElement.  It then sets the onload and onerror
methods of those instances to cause the promise it returns to resolve or reject
when/if those images fire load and error events.

It returns references to those images along with the promise that tracks
their load and error events.

If it works correctly, the caller should be able to set the images src properties
to trigger the loading process.  Further, the caller should be able to use
the promised return to run code when/if those loading processes succeed.

*/


beforeEach(() => {
  // Create a mock Image class
  const MockImage = class {
    //we need onload because PathMapToPromise sets it on each instance it creates
    onload: () => void;
    //we need onerror because PathMapToPromise sets it on each instance it creates
    onerror: () => void;
    constructor() {
      // Simulate properties and methods of a real Image object
      this.onload = () => { };
      this.onerror = () => { };
    }
  };
  // Stub the global Image constructor
  vi.stubGlobal('Image', MockImage);
})

afterEach(() => {
  // Restore the original Image constructor after each test
  vi.unstubAllGlobals();
});


describe('pathMapToPromise...', async () => {
  const inputMap = new Map([
    ['key1', 'path1'],
    ['key2', 'path2'],
    ['key3', 'path3']
  ])
  it("Returns a map of the expected length", () => {
    const [imageMap, imagePromise] = PathMapToPromise(inputMap)
    expect(imageMap.size).toBe(inputMap.size)
  })
  it("Returns a promise that rejects when any one of the returned image's error events fire -- even if the onloads of the other images have fired.", async () => {
    const [imageMap, imagePromise] = PathMapToPromise(inputMap)
    imageMap.values().forEach(([path, image], idx) => {
      if (idx === imageMap.size - 1) {
        image.onerror()
      } else {
        image.onload()
      }
    })
    await expect(imagePromise).rejects.toThrowError()
  })
  it("Returns a promise that resolves when all of the return image's onload events have fired", async () => {
    const [imageMap, imagePromise] = PathMapToPromise(inputMap)
    imageMap.values().forEach(([path, image], idx) => {
      image.onload()
    })
    await expect(imagePromise).resolves.toBeInstanceOf(Map)
  })

  it("Returns a promise that resolves to a map that matches the map returned with the promise", async () => {
    const [imageMap, imagePromise] = PathMapToPromise(inputMap)
    imageMap.values().forEach(([path, image], idx) => {
      image.onload()
    })
    //the promise is now in a resolved state.
    const resolvedToMap = await imagePromise
    imageMap.forEach(([_path, image], keystring) => {
      expect(image).toBe(resolvedToMap.get(keystring))
    })
  })
})