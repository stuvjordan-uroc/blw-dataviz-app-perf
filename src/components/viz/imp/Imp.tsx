import "./Imp.css";
import useCanvasRefs from "../../../hooks/useCanvasRefs";
import type {
  BreakpointKey,
  BreakpointConfig,
} from "../../../config/layouts-types";
import { ImpVarDisplay } from "./ImpVarDisplay";
import questions from "../../../data/questions.json";
import circles from "../../../config/circles.json";
import { useEffect, useState } from "react";
import type {
  SegmentViewsUnMapped,
  PointsMapUnMapped,
  PointsViews,
} from "../../../../build-data";
type RawCoordinates = Record<
  string,
  {
    segments: SegmentViewsUnMapped;
    points: PointsMapUnMapped;
  }
>;

export default function Imp({
  breakPoint,
  layoutConfig,
}: {
  breakPoint: BreakpointKey;
  layoutConfig: BreakpointConfig;
}) {
  //canvas ref callbacks
  //and statebtracking whether the canvases are rendered and thus ready
  //to be drawn on
  const [canvasRefsCallBackFactory, cavasesReady] = useCanvasRefs();

  //state tracking the coordinates and the status of their fetching
  const [coordinates, setCoordinates] = useState<RawCoordinates | null>(null);
  const [coordinatesAreLoading, setCoordinatesAreLoading] = useState(false);
  const [coordinatesDidError, setCoordinatesDidError] = useState(false);
  //effect to fetch coordinates on initial mount and on re-mount whenever the breakpoint has changed
  useEffect(() => {
    //flag to ignore data returned from data that comes in from a fetch that is no longer current
    let ignore = false;
    setCoordinatesAreLoading(true);
    setCoordinatesDidError(false);
    fetch("/coordinates/viz-" + breakPoint + ".json")
      .then((response) => {
        response
          .json()
          .then((data: RawCoordinates) => {
            if (!ignore) {
              setCoordinates(data);
            }
          })
          .catch(() => {
            setCoordinatesDidError(true);
          });
      })
      .catch(() => {
        setCoordinatesDidError(true);
      })
      .finally(() => {
        setCoordinatesAreLoading(false);
      });
    //clean up by setting ignore to true so that stale fetches will be ignored
    return () => {
      ignore = true;
    };
  }, [breakPoint]);

  //state tracking the images and the status of their loading
  const [images, setImages] = useState<null | Map<
    string,
    { path: string; image: HTMLImageElement }
  >>(null);
  const [imagesAreLoading, setImagesAreLoading] = useState(false);
  const [imagesDidError, setImagesDidError] = useState(false);
  //effect to load the images on initial mount and on re-mount whever the breakpoint has changed
  useEffect(() => {
    //reset in case react decided to not reset the states on re-mount
    setImages(null);
    setImagesAreLoading(false);
    setImagesDidError(false);
    //flag to ignore images returned from load that is no longer current
    let ignore = false;
    const newImages = new Map(
      (circles.fillByPartyGroup as [string[], string][]).map(([pg, _fill]) => {
        const partyString = pg.join("-");
        return [
          partyString,
          {
            path: "/img/" + breakPoint + "-" + partyString + ".png",
            image: new Image(),
          },
        ];
      })
    );
    if (newImages.size === 0) {
      setImagesDidError(true);
      return () => {
        ignore = true;
      };
    }
    setImagesAreLoading(true);
    let imagesLoaded = 0;
    let imagesErrored = 0;
    newImages.forEach(
      ({ path, image }: { path: string; image: HTMLImageElement }) => {
        image.addEventListener("load", () => {
          if (!ignore) {
            imagesLoaded = imagesLoaded + 1;
            if (imagesErrored + imagesLoaded === newImages.size) {
              //allimages have either loaded or errored
              if (imagesErrored > 0) {
                //at least one image Errored
                setImagesDidError(true);
              } else {
                setImages(newImages);
              }
              setImagesAreLoading(false);
            }
          }
        });
        image.addEventListener("error", () => {
          if (!ignore) {
            imagesErrored = imagesErrored + 1;
            if (imagesErrored + imagesLoaded === newImages.size) {
              //all images have either loaded or errored, and at least one has errored
              setImagesDidError(true);
              setImagesAreLoading(false);
            }
          }
        });
        //set image source to start loading
        image.src = path;
      }
    );
  }, [breakPoint]);

  //render when coordinates and images are populated
  if (coordinates && images) {
    const vizMaps = Object.entries(coordinates).map(
      ([impVarName, psAtImpVar]) =>
        [
          impVarName,
          {
            question: questions.prompts.find(
              (q) => q.variable_name === impVarName
            )?.question_text,
            segments: psAtImpVar.segments,
            points: new Map(
              psAtImpVar.points.map(
                ([rg, unMapAtRg]) =>
                  [
                    rg,
                    new Map(
                      unMapAtRg.map(
                        ([wave, unMapAtWave]) =>
                          [
                            wave,
                            unMapAtWave === null
                              ? null
                              : new Map(
                                  unMapAtWave.map(
                                    ([pg, pointsViews]) =>
                                      [
                                        pg,
                                        {
                                          pointsViews: pointsViews,
                                          images: {
                                            noParty: images.get("none")?.image,
                                            party: images.get(pg.join("-"))
                                              ?.image,
                                          },
                                        },
                                      ] as [
                                        string[],
                                        {
                                          pointsViews: PointsViews;
                                          images: {
                                            noParty: HTMLImageElement;
                                            party: HTMLImageElement;
                                          };
                                        },
                                      ]
                                  )
                                ),
                          ] as [
                            number,
                            null | Map<
                              string[],
                              {
                                pointsViews: PointsViews;
                                images: {
                                  noParty: HTMLImageElement;
                                  party: HTMLImageElement;
                                };
                              }
                            >,
                          ]
                      )
                    ),
                  ] as [
                    string[],
                    Map<
                      number,
                      null | Map<
                        string[],
                        {
                          pointsViews: PointsViews;
                          images: {
                            noParty: HTMLImageElement;
                            party: HTMLImageElement;
                          };
                        }
                      >
                    >,
                  ]
              )
            ),
          },
        ] as [
          string,
          {
            question: string | undefined;
            segments: SegmentViewsUnMapped;
            points: Map<
              string[],
              Map<
                number,
                null | Map<
                  string[],
                  {
                    pointsViews: PointsViews;
                    images: {
                      noParty: HTMLImageElement;
                      party: HTMLImageElement;
                    };
                  }
                >
              >
            >;
          },
        ]
    );
    //render view when we have all the data required
    return (
      <div className="imp-viz-root">
        {cavasesReady && <div>Canvases ready! Render controls here!</div>}
        <div className="imp-viz-vizarray">
          {vizMaps.map(([impVarName, atImpVar]) => (
            <ImpVarDisplay
              key={impVarName}
              impVarQuestionText={atImpVar.question}
              layout={layoutConfig}
              vizRefCallBack={canvasRefsCallBackFactory(impVarName)}
            />
          ))}
        </div>
      </div>
    );
  }
  //error views
  //TO DO
  if (coordinatesDidError || imagesDidError) {
    return <div>frowny face here</div>;
  }
  //coordinates loading
  if (coordinatesAreLoading) {
    return <div>spinner here</div>;
  }
  //images loading
  if (imagesAreLoading && coordinates) {
    return <div>array of spinners here</div>;
  }
  //if we get here...
  //both coordinates and images are null/
  //but neither is in the error nor loading state
  //this should never happen, because the useeffect calls always
  //finish with either or both in the error state or the non-null state
  return <div>double frowny face here</div>;
}
