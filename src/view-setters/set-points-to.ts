import type { PointsMapUnMapped } from "../../build-data";

export type ImageByPartyGroup = Record<string, HTMLImageElement>

export function setPointsToByResponse(
  canvasNode: HTMLCanvasElement,
  points: PointsMapUnMapped,
  groupedState: "collapsed" | "expanded",
  image: HTMLImageElement
) {
  const ctx = canvasNode.getContext('2d', {
    alpha: true
  })
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