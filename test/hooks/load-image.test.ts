import loadImage from "../../src/hooks/use-circle-images/load-image";
import { describe, it, expect, vi } from "vitest"

/*
What load image really does is take a path and an image and...

(1) create a promise htat 
(1) set listeners on the 'load' and 'error' events on the image
(2) set the src property of the image to the path

The listener set on the load event causes 

*/


describe('loadImage', async () => {
  it('should behave as expected when the load event fires on the passed image', async () => {
    //mock the global image constructor
    const mockImageInstance = {
      onload: null,
      onerror: null,
      src: '',
      //simulate method that dispatches load event
      _triggerLoad: function () {
        if (typeof this.onload === 'function') {
          (this.onload as () => void)()
        }
      },
      //simulate dispatching error event
      _triggerError: function (error) {
        if (typeof this.onerror === 'function') {
          (this.onerror as (error) => void)(error)
        }
      }
    }
    //intercept calls to new Image
    vi.stubGlobal('Image', vi.fn(() => mockImageInstance))
    const promise = loadImage('somepath.png', new Image())
    //simulate image loading
    mockImageInstance._triggerLoad();
    promise.then((resolved) => {
      expect(resolved[0]).toBe("somepath.png")
      expect(resolved[1].src).toBe("somepath.png")
    })
  })
})