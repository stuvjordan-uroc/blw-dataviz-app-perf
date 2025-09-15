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