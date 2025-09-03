import type { PointsMapUnMapped } from "../../build-data";

export type ImageByPartyGroup = Record<string, HTMLImageElement>

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

export function byResponseAndParty(
  canvasNode: HTMLCanvasElement,
  points: PointsMapUnMapped,
  groupedState: "collapsed" | "expanded",
  partyStringToImage: Map<string[], HTMLImageElement>
) {
  const ctx = canvasNode.getContext('2d');
  if (ctx) {
    //clear all the existing points
    ctx.clearRect(0, 0, canvasNode.width, canvasNode.height)
    //draw the new ones
    for (const [_rg, unMapAtRg] of points) {
      for (const [_wave, unMapAtWave] of unMapAtRg) {
        if (unMapAtWave) {
          for (const [pg, views] of unMapAtWave) {
            const image = partyStringToImage.get(pg)
            for (const point of views[groupedState].byResponseAndParty) {
              if (image) {
                ctx.drawImage(image, point.x, point.y)
              }
            }
          }
        }
      }
    }
  }
}