import * as createjs from 'createjs-module'
import type { VizData } from './makeViewData'

type GroupedView = "byResponse" | "byResponseAndWaveAndParty" | "byResponseAndWave" | "byResponseAndParty"
type View = ["unsplit", null] | ["collapsed", GroupedView] | ["expanded", GroupedView]

export function transitionViews(
  prevView: null | View,
  newView: View,
  vizData: VizData
) {
  if (prevView === null) {
    vizData.forEach((viz) => {
      //remove any children in the stage from any previous stuff
      viz.stage?.removeAllChildren()
      viz.points.forEach(([_rg, unMapAtRg]) => {
        unMapAtRg.forEach(([_wave, unMapAtWave]) => {
          if (unMapAtWave !== null) {
            unMapAtWave.forEach(([_pgString, pvi]) => {
              if (newView[0] === "unsplit") {
                //loop through the points
                pvi.pointsViews.unsplit.forEach((point) => {
                  if (pvi.images.noParty) {
                    viz.stage?.addChild(
                      (new createjs.Bitmap(pvi.images.noParty))
                        .set({ x: point.x, y: point.y })
                    )
                  }
                })
              } else {
                //loop through the points
                pvi.pointsViews[newView[0]][newView[1]].forEach((point) => {
                  if (newView[1].endsWith("Party")) {
                    if (pvi.images.party) {
                      viz.stage?.addChild(
                        (new createjs.Bitmap(pvi.images.party))
                          .set({ x: point.x, y: point.y })
                      )
                    }
                  } else {
                    if (pvi.images.noParty) {
                      viz.stage?.addChild(
                        (new createjs.Bitmap(pvi.images.noParty))
                          .set({ x: point.x, y: point.y })
                      )
                    }
                  }
                })
              }
            })
          }
        })
      })
      viz.stage?.update()
    })
  }
}