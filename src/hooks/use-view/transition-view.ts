import { max, min } from "lodash";
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
    onComplete: allAnimationsCompleteCallback, //invoke that passed allAnimationsCompleteCallback when the timeline completes
    paused: true, //pause immediately.  We don't want to play this timeline until all tweens are added!
    defaults: { duration: maxDuration, ease: "power2" }
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
            image: (destinationViewData.partyOpacity > 0) ? imageMap.get(pg.join("-")) : imageMap.get("none"),
            x: x,
            y: y,
            pointGroupIdx: pointGroupIdx,
            coordinateIdx: coordinateIdx
          }))
        )
      }).flat(1)
      const targetsPlusDestinations = targetsForCanvas.map((target) => {
        const destinationCoordinates = destinationCoordinatesAtImpVar![target.pointGroupIdx].coordinates[target.coordinateIdx];
        return ({
          target: target,
          destination: {
            x: destinationCoordinates ? destinationCoordinates.x : target.x,
            y: destinationCoordinates ? destinationCoordinates.y : target.y
          }
        })
      })
      // const targetsPlusTweens = targetsForCanvas.map((target) => {
      //   const destinationCoordinates = destinationCoordinatesAtImpVar![target.pointGroupIdx].coordinates[target.coordinateIdx];
      //   return ({
      //     target: target,
      //     tween: gsap.to(
      //       target,
      //       {
      //         x: destinationCoordinates ? destinationCoordinates.x : target.x,
      //         y: destinationCoordinates ? destinationCoordinates.y : target.y,
      //         duration: minDuration + Math.random() * (maxDuration - minDuration), //jitter the duration between 1.5 and 2 so we have some variety in the timing
      //         inherit: false,
      //         ease: "power4",
      //         paused: true, //pause, because we want to control the start using the timeline
      //         immediateRender: false
      //       }
      //     )
      //   })
      // })
      return targetsPlusDestinations
    }).flat(1)
  //add the tweens to the timeline
  allTargetsAndTweens.forEach(({ target, destination }) => {
    timeline.to(
      target,
      {
        x: destination.x,
        y: destination.y,
        duration: Math.ceil(minDuration + Math.random() * (maxDuration - minDuration)),
        ease: "power1.out",
        //paused: true
      },
      0
    )
  })
  //allTargetsAndTweens.forEach(({ tween }) => { timeline.add(tween) })
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
  console.log("here is the timeline's total duration", timeline.duration())
  timeline.play(0)
}

