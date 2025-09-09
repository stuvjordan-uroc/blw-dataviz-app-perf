import "./Imp.css";
import useCanvasRefs from "../../../hooks/useCanvasRefs";
import useCoordinates from "../../../hooks/useCoordinates";
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
import useCircleImages from "../../../hooks/use-circle-images";
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

  //TO DO  hook that takes coordinates and images and does a useMemo to calcuate
  //vizMaps, as in code below.
  //render when coordinates and images are populated
  if (coordinates.data && images.data) {
    const vizMaps = Object.entries(coordinates.data).map(
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
                                            noParty: images.data.get("none"),
                                            party: images.data.get(
                                              pg.join("-")
                                            ),
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
