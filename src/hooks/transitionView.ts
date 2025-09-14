import type { DrawingData, DrawingDataAtImpVar, View, ViewState } from "./useView";
import type { PointsViews } from "../../build-data";

export function drawPoints(
  {
    drawingContext,
    canvasWidth,
    canvasHeight,
    noPartyOpacity,
    partyOpacity,
    pointGroups
  }: DrawingDataAtImpVar,
  imageMap: Map<string, HTMLImageElement>
) {
  if (drawingContext && canvasWidth && canvasHeight) {
    //clear the context
    drawingContext.clearRect(0, 0, canvasWidth, canvasHeight);
    //get the no party image
    const noPartyImage = noPartyOpacity > 0 ? imageMap.get("none") : null;
    //draw
    pointGroups.forEach(({ imagesNoParty, imagesParty, pg }) => {
      //no party images
      if (noPartyImage) {
        if (noPartyOpacity >= 1) {
          imagesNoParty.forEach(({ x, y }) => {
            drawingContext.drawImage(noPartyImage, x, y)
          })
        } else {
          drawingContext.save();
          drawingContext.globalAlpha = noPartyOpacity;
          imagesNoParty.forEach(({ x, y }) => {
            drawingContext.drawImage(noPartyImage, x, y)
          })
          drawingContext.restore();
        }
      }
      //party image
      const partyImage = partyOpacity > 0 ? imageMap.get(pg.join("-")) : null
      if (partyImage) {
        if (partyOpacity >= 1) {
          imagesParty.forEach(({ x, y }) => {
            drawingContext.drawImage(partyImage, x, y)
          })
        } else {
          drawingContext.save();
          drawingContext.globalAlpha = partyOpacity;
          imagesParty.forEach(({ x, y }) => {
            drawingContext.drawImage(partyImage, x, y)
          })
          drawingContext.restore();
        }
      }
    })
  }
}

export function setOpacitiesAndCoordinates(drawingDataAtImpVar: DrawingDataAtImpVar, view: View) {
  if (view[2] === "party") {
    //set the opacities
    drawingDataAtImpVar.noPartyOpacity = 0;
    drawingDataAtImpVar.partyOpacity = 1;
    //set the coordinates
    const viewString = "byResponseAnd" + (view[1] === "wave" ? "WaveAnd" : "") + "Party" as "byResponseAndWaveAndParty" | "byResponseAndWave"
    drawingDataAtImpVar.pointGroups.forEach(({ imagesParty, coordinates }) => {
      imagesParty.forEach((image, idx) => {
        image.x = coordinates[view[0]][viewString][idx].x;
        image.y = coordinates[view[0]][viewString][idx].y;
      })
    })
  } else {
    drawingDataAtImpVar.noPartyOpacity = 1;
    drawingDataAtImpVar.partyOpacity = 0;
    //set the coordinates
    if (view[0] === null) {
      //unsplit view
      drawingDataAtImpVar.pointGroups.forEach(({ imagesNoParty, coordinates }) => {
        imagesNoParty.forEach((image, idx) => {
          image.x = coordinates.unsplit[idx].x;
          image.y = coordinates.unsplit[idx].y;
        })
      })
    } else {
      const viewString = "byResponse" + (view[1] === "wave" ? "AndWave" : "") as "byResponse" | "byResponseAndWave"
      drawingDataAtImpVar.pointGroups.forEach(({ imagesNoParty, coordinates }) => {
        imagesNoParty.forEach((image, idx) => {
          image.x = coordinates[view[0]][viewString][idx].x;
          image.y = coordinates[view[0]][viewString][idx].y;
        })
      })
    }
  }

}

//NEXT STEP...WRITE THE TRANSITION VIEW FUNCTION, using GSAP

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