//get a reference to the image used to depict the points
const pointImage = document.getElementById("offscreen-point-image") as HTMLImageElement
//get the canvas on which the points are drawn
const canvas = document.getElementById("id-of-canvas") as HTMLCanvasElement
//get the 2d drawing context
const ctx = canvas.getContext('2d')
//create the timeline
//don't define the update handler yet,
//because we'll need the points-to-be-tweened for that
const timeline = gsap.timeline({
  autoRemoveChildren: true, //kill all tweens in the timeline after the timeline completes
  paused: true, //pause immediately.  We don't want to play this timeline until all tweens are added!
  defaults: { duration: 10, ease: "power2" }
})
//points to be tweened
//(this is simplified...in my actual app, there are thousands)
const pointsToBeTweened = [
  { x: 1, y: 1 },
  { x: 2, y: 2 }
]
//destination coordinates for each point
const destinations = [
  { x: 5, y: 5 },
  { x: 10, y: 10 }
]
//create the tweens and add them as children
//to the timeline
pointsToBeTweened.forEach((point, idx) => {
  timeline.to(
    point,
    {
      x: destinations[idx].x,
      y: destinations[idx].y,
      duration: 5 + Math.random() * 5, //jitter the durations to add some noise
      ease: "power4"
    }
  )
})
//define the update callback
timeline.eventCallback("onUpdate", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height)
  pointsToBeTweened.forEach((point) => {
    ctx?.drawImage(pointImage, point.x, point.y)
  })
})
//play the timeline
timeline.play(0)