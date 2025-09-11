//css
import "./Imp.css";
//types
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
//data
import circles from "../../../config/circles.json";
//hooks
import { useCoordinates } from "../../../hooks/useCoordinates";
import { useCircleImages } from "../../../hooks/use-circle-images";
import useCanvases from "../../../hooks/useCanvases";

export default function Imp({
  breakPoint,
  layoutConfig,
}: {
  breakPoint: BreakpointKey;
  layoutConfig: BreakpointConfig;
}) {
  //fetch coordinates along with states tracking fetch status (loading/error)
  const coordinates = useCoordinates(`/coordinates/viz-${breakPoint}.json`);

  //state tracking the images and the status of their loading
  const images = useCircleImages(
    new Map(
      (circles.fillByPartyGroup as [string[], string][]).map(
        ([partyGroup, _fill]) =>
          [
            partyGroup.join("-"),
            "/img/" + breakPoint + "-" + partyGroup.join("-") + ".png",
          ] as [string, string]
      )
    )
  );

  //set up the canvases
  /* 
  useCanvases uses useRef to create a map which takes each impVar name to an object
  The object cooresponding to each impVar is like this:
  {
    node: HTMLCanvasNode //the html node for the canvas
    stage: createjs.Stage //createjs Stage for drawing stuff on the canvas
    points: 
  }
  */
  //canvas ref callbacks,
  //state tracking whether the canvases are rendered and thus ready to be drawn on
  //map taking each impVar to its canvas node and a createjs Stage for drawing
  const [canvasRefsCallBackFactory, cavasesReady, canvasMap] = useCanvases();

  //useEffect that creates the createjs BitMaps for each group of points

  //TO DO  hook that takes coordinates and images and does a useMemo to calcuate
  //vizMaps, as in code below.
  //render when coordinates and images are populated
  if (coordinates.data) {
    if (images.data) {
      return <div>images and coordinates successfully loaded</div>;
    } else if (images.isLoading) {
      return (
        <div>coordinates succesfully loaded, but images are still loading</div>
      );
    } else {
      return <div>coordinates successfully loaded, but images errored</div>;
    }
  } else if (coordinates.isLoading) {
    return <div>coordinates are loading</div>;
  }
  return <div>coordinates errored</div>;
}
