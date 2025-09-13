import type { DrawingData, ViewState } from "./useView";
import type { Point, PointsViews } from "../../build-data";
import createjs from "createjs-module";

export function transitionView(
  prevView: ViewState,
  newView: ViewState,
  drawingData: DrawingData,
  setView: React.Dispatch<React.SetStateAction<ViewState>>,
  duration: number
) {
  if (prevView && newView && drawingData && (prevView[0] !== newView[0] || prevView[1] !== newView[1])) {
    if ((!prevView[1] || !prevView[1].includes("Party")) && (!newView[1] || !newView[1].includes("Party"))) {
      //this is one of the easy cases where we don't have to switch bitmaps
      const tweens = [] as createjs.Tween[];
      drawingData.forEach(({ stage, pointGroups }) => {
        if (stage) {
          pointGroups.forEach(({ bitMapsNoParty, coordinates }: { bitMapsNoParty: createjs.Bitmap[], coordinates: PointsViews }) => {
            const newCoordinates = (newView[0] === "unsplit") ? coordinates.unsplit : coordinates[newView[0]][newView[1]]
            bitMapsNoParty.forEach((bm, bmIdx) => {
              tweens.push(
                createjs.Tween
                  .get(bm, { override: true })
                  .to({ x: newCoordinates[bmIdx].x, y: newCoordinates[bmIdx].y }, duration, createjs.Ease.quartOut)
              )
            })
          })
          const timeline = new createjs.Timeline(
            tweens,
            [],
            {
              onComplete: () => { setView(newView) }
            }
          )
        }
      })
    }
  }
  //do nothing if prevView, newView, or drawingData are null
}

function diffViews(prevView: ViewState, newView: ViewState) {
  if (!prevView || !newView) {
    return undefined
  }
  return ({
    response: {
      collapsed: +newView.response.collapsed - +prevView.response.collapsed,
      expanded: +newView.response.expanded - +prevView.response.expanded
    },
    party: +newView.party - +prevView.party,
    wave: +newView.wave - +prevView.wave
  })
}