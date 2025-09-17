import type { ViewData } from "./computeViewData";
import gsap from "gsap";

export function transitionViews(
  canvases: [string, HTMLCanvasElement][],
  startingViewData: ViewData,
  destinationViewData: ViewData,
  imageMap: Map<string, HTMLImageElement>,
  minDuration: number,
  maxDuration: number,
  allAnimationsCompleteCallback: () => void
) {
  //create a timeline through which we can control
  //the tweens we'll apply to each point in each canvas
  const timeline = gsap.timeline({
    autoRemoveChildren: true, //kill all tweens in the timeline after the timeline completes
    defaults: {
      ease: "power4" //apply the power4 ease to every tween in the timeline
    },
    onComplete: allAnimationsCompleteCallback, //invoke that passed allAnimationsCompleteCallback when the timeline completes
    paused: true //pause immediately.  We don't want to play this timeline until all tweens are added!
  })

  //Note that we'll need to set the timeline's update property.
  //but we can't do that until we have references to all the objects
  //that the timeline will tween.

  //create an array of all the tweens and targets-to-be-tweened that we're going to add to the timeline
  //(Note that we're punting on how to deal with the noParty vs Party image for now)
  const allTargetsAndTweens = canvases
    .map(([impVarName, canvas]) => ({ //get the starting and destination coordinates for each canvas
      startingCoordinatesAtImpVar: startingViewData.coordinates.get(impVarName),
      destinationCoordinatesAtImpVar: destinationViewData.coordinates.get(impVarName),
      canvasContext: canvas.getContext('2d')
    }))
    .filter(({ startingCoordinatesAtImpVar, destinationCoordinatesAtImpVar }) => ( //skip any canvases where we can't find the coordinates we need
      startingCoordinatesAtImpVar && destinationCoordinatesAtImpVar
    ))
    .map(({ startingCoordinatesAtImpVar, destinationCoordinatesAtImpVar, canvasContext }) => {
      //fucking typescript can't understand the .filter step above so use the !
      const targetsForCanvas = startingCoordinatesAtImpVar!.map(({ pg, coordinates }, pointGroupIdx) => {
        return (
          coordinates.map(({ x, y }, coordinateIdx) => ({
            canvasContext: canvasContext,
            image: (destinationViewData.partyOpacity >= 0) ? imageMap.get(pg.join("-")) : imageMap.get("none"),
            x: x,
            y: y,
            pointGroupIdx: pointGroupIdx,
            coordinateIdx: coordinateIdx
          }))
        )
      }).flat(1)
      const targetsPlusTweens = targetsForCanvas.map((target) => {
        const destinationCoordinates = destinationCoordinatesAtImpVar![target.pointGroupIdx].coordinates[target.coordinateIdx];
        return ({
          target: target,
          tween: gsap.to(
            target,
            {
              x: destinationCoordinates ? destinationCoordinates.x : target.x,
              y: destinationCoordinates ? destinationCoordinates.y : target.y,
              duration: minDuration + Math.random() * (maxDuration - minDuration), //jitter the duration between 1.5 and 2 so we have some variety in the timing
              inherit: true, //inherit properties from any timeline we add this tween to
              paused: true //pause, because we want to control the start using the timeline
            }
          )
        })
      })
      return targetsPlusTweens
    }).flat(1)
  //add the tweens to the timeline
  allTargetsAndTweens.forEach(({ tween }) => { timeline.add(tween) })
  //set the timeline's onUpdate propoerty
  timeline.eventCallback("onUpdate", () => {
    //clear all canvases
    canvases.forEach(([, canvas]) => {
      canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height)
    })
    //draw all the updated points
    allTargetsAndTweens.forEach(({ target }) => {
      if (target.image) {
        target.canvasContext?.drawImage(target.image, target.x, target.y)
      }
    })
  })
  //play the timeline
  timeline.play()
}

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
