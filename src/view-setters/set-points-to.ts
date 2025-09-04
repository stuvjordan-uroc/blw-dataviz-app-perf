import { canvas } from "motion/react-client";
import type { PointsMapUnMapped } from "../../build-data";
import type { Coordinates } from "../hooks/useCoordinates";

export type ImageByPartyGroup = Record<string, HTMLImageElement>

export function canvasToPoints(
  canvasMap: Map<string, HTMLCanvasElement>,
  coordinates: Coordinates
) {
  return canvasMap.entries().map(([impVarName, canvasNode]) => ([
    canvasNode,
    coordinates[impVarName].points
  ] as [HTMLCanvasElement, PointsMapUnMapped]))
}

export function unsplit(
  canvasNode: HTMLCanvasElement,
  points: PointsMapUnMapped,
  image: HTMLImageElement
) {
  const ctx = canvasNode.getContext('2d')
  if (ctx) {
    //clear all the existing points
    ctx.clearRect(0, 0, canvasNode.width, canvasNode.height)
    //draw the new ones
    for (const [_rg, unMapAtRg] of points) {
      for (const [_wave, unMapAtWave] of unMapAtRg) {
        if (unMapAtWave) {
          for (const [_pg, views] of unMapAtWave) {
            for (const point of views.unsplit) {
              ctx.drawImage(image, point.x, point.y)
            }
          }
        }
      }
    }
  }
}

export function setAllunsplit(
  canvasMap: Map<string, HTMLCanvasElement>,
  coordinates: Coordinates,
  imagePath: string
) {
  const image = new Image()
  image.addEventListener("load", () => {
    canvasToPoints(canvasMap, coordinates).forEach(([canvasNode, pointsMap]) => {
      unsplit(canvasNode, pointsMap, image)
    })
  })
  image.src = imagePath
}

export function byResponse(
  canvasNode: HTMLCanvasElement,
  points: PointsMapUnMapped,
  groupedState: "collapsed" | "expanded",
  image: HTMLImageElement
) {
  const ctx = canvasNode.getContext('2d');
  if (ctx) {
    //clear all the existing points
    ctx.clearRect(0, 0, canvasNode.width, canvasNode.height)
    //draw the new ones
    for (const [_rg, unMapAtRg] of points) {
      for (const [_wave, unMapAtWave] of unMapAtRg) {
        if (unMapAtWave) {
          for (const [_pg, views] of unMapAtWave) {
            for (const point of views[groupedState].byResponse) {
              ctx.drawImage(image, point.x, point.y)
            }
          }
        }
      }
    }
  }
}

export function setAllByResponse(
  canvasMap: Map<string, HTMLCanvasElement>,
  coordinates: Coordinates,
  imagePath: string
) {
  const image = new Image()
  image.addEventListener("load", () => {
    canvasToPoints(canvasMap, coordinates).forEach(([canvasNode, pointsMap]) => {
      byResponse(canvasNode, pointsMap, "expanded", image)
    })
  })
  image.src = imagePath
}

export function byResponseAndWave(
  canvasNode: HTMLCanvasElement,
  points: PointsMapUnMapped,
  groupedState: "collapsed" | "expanded",
  image: HTMLImageElement
) {
  const ctx = canvasNode.getContext('2d');
  if (ctx) {
    //clear all the existing points
    ctx.clearRect(0, 0, canvasNode.width, canvasNode.height)
    //draw the new ones
    for (const [_rg, unMapAtRg] of points) {
      for (const [_wave, unMapAtWave] of unMapAtRg) {
        if (unMapAtWave) {
          for (const [_pg, views] of unMapAtWave) {
            for (const point of views[groupedState].byResponseAndWave) {
              ctx.drawImage(image, point.x, point.y)
            }
          }
        }
      }
    }
  }
}

export function setAllByResponseAndWave(
  canvasMap: Map<string, HTMLCanvasElement>,
  coordinates: Coordinates,
  imagePath: string
) {
  const image = new Image()
  image.addEventListener("load", () => {
    canvasToPoints(canvasMap, coordinates).forEach(([canvasNode, pointsMap]) => {
      byResponseAndWave(canvasNode, pointsMap, "expanded", image)
    })
  })
  image.src = imagePath
}

export function byResponseAndParty(
  canvasNode: HTMLCanvasElement,
  points: PointsMapUnMapped,
  groupedState: "collapsed" | "expanded",
  partyGroupToImage: Map<string[], HTMLImageElement>
) {
  const ctx = canvasNode.getContext('2d');
  if (ctx) {
    //clear all the existing points
    ctx.clearRect(0, 0, canvasNode.width, canvasNode.height)
    //draw the new ones
    for (const [rg, unMapAtRg] of points) {
      for (const [wave, unMapAtWave] of unMapAtRg) {
        if (unMapAtWave) {
          for (const [pg, views] of unMapAtWave) {
            const image = partyGroupToImage
              .entries()
              .find(([possibleMatchingPG, _possibleMathingImage]) => {
                const allInPg = possibleMatchingPG.every(pmparty => pg.includes(pmparty))
                const allInPossibleMatchingPg = pg.every(pgparty => possibleMatchingPG.includes(pgparty))
                return allInPg && allInPossibleMatchingPg
              })
            for (const point of views[groupedState].byResponseAndParty) {
              if (image) {
                ctx.drawImage(image[1], point.x, point.y)
              } else {
                console.log('WARNING: Tried to draw byResponseAndParty at', rg, wave, pg, "but could not find matching party group in", partyGroupToImage)
              }
            }
          }
        }
      }
    }
  }
}

export function setAllByResponseAndParty(
  canvasMap: Map<string, HTMLCanvasElement>,
  coordinates: Coordinates,
  partyGroupToImagePath: Map<string[], string>,
) {
  const partyGroupToImage = new Map(
    partyGroupToImagePath
      .entries()
      .map(([partyGroup, imagePath]) => ([
        partyGroup,
        {
          image: new Image(),
          imagePath: imagePath
        }
      ] as [string[], { image: HTMLImageElement, imagePath: string }
        ]))
  )
  let imagesLoaded = 0
  partyGroupToImage.forEach((image) => {
    image.image.addEventListener("load", () => {
      imagesLoaded = imagesLoaded + 1
      if (imagesLoaded === partyGroupToImage.size) {
        //draw the image on each canvas here
        canvasToPoints(canvasMap, coordinates).forEach(([canvas, pointsMap]) => {
          byResponseAndParty(
            canvas,
            pointsMap,
            "expanded",
            new Map(partyGroupToImage.entries().map(([partyGroup, image]) => ([partyGroup, image.image])))
          )
        })
      }
    })
  })
  partyGroupToImage.forEach((image) => {
    image.image.src = image.imagePath
  })
}