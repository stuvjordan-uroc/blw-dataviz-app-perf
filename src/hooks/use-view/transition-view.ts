import type { ViewData } from "./computeViewData";
import gsap from "gsap";

export function transitionViews();

export function transitionView(
  node: HTMLCanvasElement,
  prevNoPartyOpacity: number,
  newNorPartyOpacity: number,
  prevViewData: {
    rg: string[];
    wave: number;
    pg: string[];
    coordinates: { x: number; y: number }[];
  }[],
  newViewData: {
    rg: string[];
    wave: number;
    pg: string[];
    coordinates: { x: number; y: number }[];
  }[],
  imageMap: Map<string, HTMLImageElement>
) {
  const ctx = node.getContext("2d");
  if (ctx) {
    if (prevNoPartyOpacity === newNorPartyOpacity) {
      //this is the case where all we have to do is transition the point positions
      prevViewData.forEach((pointGroup, pointGroupIdx) => {
        const image =
          prevNoPartyOpacity >= 0
            ? imageMap.get("none")
            : imageMap.get(pointGroup.pg.join("-"));
        if (image) {
          pointGroup.coordinates.forEach(({ x, y }, coordinateIdx) => {
            const destination =
              newViewData[pointGroupIdx].coordinates[coordinateIdx];
            const pointToTransition = {
              x: x,
              y: y,
            };
            gsap.to(pointToTransition, {
              x: destination.x,
              y: destination.y,
              duration: 2,
              ease: "power4",
              onUpdate: (tweenedObj: { x: number; y: number }) => {
                ctx.clearRect(0, 0, node.width, node.height);
                ctx.drawImage(image, tweenedObj.x, tweenedObj.y);
              },
              onUpdateParams: [pointToTransition],
            });
          });
        }
      });
    } else {
      //here we need to first change the images used for the points, then
      //transition the point positions.
    }
  }
}
