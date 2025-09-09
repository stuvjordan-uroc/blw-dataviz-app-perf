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