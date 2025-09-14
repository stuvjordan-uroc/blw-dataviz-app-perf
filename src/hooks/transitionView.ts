import type { RequestedView, ViewProps } from "./useView";
import type { SegmentViewsUnMapped, PointsViews } from "../../build-data";


export function viewPropsAtRequestedView(
  requestedView: RequestedView,
  coordinateData: Map<string, {
    segments: SegmentViewsUnMapped;
    pointGroups: {
      rg: string[];
      wave: number;
      pg: string[];
      coordinates: PointsViews;
    }[];
  }>
): ViewProps {
  return {
    noPartyOpacity: (requestedView[2] === "party") ? 0 : 1,
    partyOpacity: (requestedView[2] === "party") ? 1 : 0,
    coordinates: new Map(
      coordinateData.entries().map(([impVarName, { pointGroups }]) => {
        const viewKeyString = "byResponse" + (requestedView[1] === "wave" ? "AndWave" : "") + (requestedView[2] === "party" ? "AndParty" : "") as "byResponse" | "byResponseAndWave" | "byResponseAndParty" | "byResponseAndWaveAndParty"
        return ([
          impVarName,
          pointGroups.map(({ rg, wave, pg, coordinates }) => ({
            rg: rg,
            wave: wave,
            pg: pg,
            coordinates: requestedView[0] === null ? coordinates.unsplit : coordinates[requestedView[0] as "expanded" | "collapsed"][viewKeyString]
          }))
        ])
      })
    )
  }
}


export function drawPoints(
  partyOpacity: number,
  noPartyOpacity: number,
  pointGroups: {
    rg: string[],
    wave: number,
    pg: string[],
    coordinates: { x: number, y: number }[]
  }[],
  imageMap: Map<string, HTMLImageElement>,
  canvas: HTMLCanvasElement
) {
  //get the context
  const ctx = canvas.getContext('2d')
  if (ctx) {
    //clear the context
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    //get the noParty image
    const noPartyImage = noPartyOpacity > 0 ? imageMap.get("none") : null;
    if (noPartyImage) {
      pointGroups.forEach(({ coordinates }) => {
        if (noPartyOpacity >= 1) {
          coordinates.forEach(({ x, y }) => {
            ctx.drawImage(noPartyImage, x, y)
          })
        } else {
          ctx.save();
          ctx.globalAlpha = noPartyOpacity;
          coordinates.forEach(({ x, y }) => {
            ctx.drawImage(noPartyImage, x, y)
          })
          ctx.restore()
        }
      })
    } else {
      pointGroups.forEach(({ pg, coordinates }) => {
        const partyImage = partyOpacity > 0 ? imageMap.get(pg.join("-")) : null;
        if (partyImage) {
          if (partyOpacity >= 1) {
            coordinates.forEach(({ x, y }) => {
              ctx.drawImage(partyImage, x, y)
            })
          } else {
            ctx.save();
            ctx.globalAlpha = noPartyOpacity;
            coordinates.forEach(({ x, y }) => {
              ctx.drawImage(partyImage, x, y)
            })
            ctx.restore()
          }
        }
      })
    }
  }
}

export function setOpacitiesAndCoordinates(
  drawingDataAtImpVar: DrawingDataAtImpVar,
  view: View
) {
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


export function transitionToView(
  oldView: View,
  newView: View,
  drawingData: DrawingData,
) {
  if (drawingData) {
    //read the opacities of the 
    //set the opacities and coordinates
    drawingData.forEach((drawingDataAtImpVar) => {
      setOpacitiesAndCoordinates(drawingDataAtImpVar, newView)
    })
    //configure the animation
    drawingData.forEach((drawingDataAtImpVar) => {

    })

    ///something here

    //trigger the animation

    ///MAYBE pass it a callback to be called when the animation completes

    ///Doing a setState to change the view state is probably something
    //that happens in the click handler, not in this function.
  }
}

