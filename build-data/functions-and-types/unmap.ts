import type {
  GroupedState,
  PAndC,
  PAndCUnMapped,
  PointsMap,
  PointsViews,
  Segment,
  SegmentMapR,
  SegmentMapRP,
  SegmentMapRW,
  SegmentMapRWP,
  SegmentViews,
  UnMap,
} from "./types.ts";



export function unMapPAndC(pAndC: PAndC): PAndCUnMapped {
  return Object.fromEntries(Object.entries(pAndC).map(([groupedState, gsVal]:
    [
      string,
      Map<string[], {
        p: number;
        c: number;
        waveSplit: Map<number, null | {
          p: number;
          c: number;
          partySplit: Map<string[], {
            p: number;
            c: number;
          }>;
        }>;
        partySplit: Map<string[], {
          p: number;
          c: number;
        }>;
      }>
    ]) => ([
      groupedState as GroupedState,
      [...gsVal.entries()].map(([rg, rgVal]:
        [
          string[],
          {
            p: number;
            c: number;
            waveSplit: Map<number, null | {
              p: number;
              c: number;
              partySplit: Map<string[], {
                p: number;
                c: number;
              }>;
            }>;
            partySplit: Map<string[], {
              p: number;
              c: number;
            }>;
          }
        ]
      ) => ([
        rg,
        {
          ...rgVal,
          waveSplit: [...rgVal.waveSplit.entries()].map(([wave, waveVal]: [
            number,
            null | {
              p: number;
              c: number;
              partySplit: Map<string[], {
                p: number;
                c: number;
              }>;
            }
          ]) => ([
            wave,
            waveVal === null ? null :
              {
                ...waveVal,
                partySplit: [...waveVal.partySplit.entries()]
              }
          ])) as [
            number,
            null | {
              p: number,
              c: number,
              partySplit: [
                string[],
                {
                  p: number,
                  c: number
                }
              ][]
            }
          ][],
          partySplit: [...rgVal.partySplit.entries()] as [string[], { p: number, c: number }][]
        }
      ]))
    ]))) as PAndCUnMapped
}
export function unMapMap<T, K>(map: Map<T, K>): UnMap<T, K> {
  return [...map.entries()]
}
export function unMapSegmentMapR(segmentMapR: SegmentMapR) {
  return unMapMap(segmentMapR)
}
export function unMapSegmentMapRP(segmentMapRP: SegmentMapRP) {
  return [...segmentMapRP.entries()]
    .map(([rg, rgVal]: [string[], Map<string[], Segment>]) =>
      [rg, unMapMap(rgVal)]
    ) as UnMap<string[], UnMap<string[], Segment>>;
}
export function unMapSegmentMapRW(segmenMapRW: SegmentMapRW) {
  return [...segmenMapRW.entries()]
    .map(([rg, rgVal]: [string[], Map<number, null | Segment>]) =>
      [rg, unMapMap(rgVal)]
    ) as UnMap<string[], UnMap<number, null | Segment>>;
}
export function unMapSegmentMapRWP(segmentMapRWP: SegmentMapRWP) {
  return [...segmentMapRWP.entries()]
    .map(([rg, rgVal]: [string[], Map<number, Map<string[], Segment> | null>]) => [
      rg,
      [...rgVal.entries()]
        .map(([wave, waveVal]: [number, Map<string[], Segment> | null]) => [
          wave,
          waveVal === null ? null : unMapMap(waveVal),
        ]),
    ]) as UnMap<
      string[],
      UnMap<
        number,
        null | UnMap<string[], Segment>
      >
    >;
}
export function unMapSegmentViews(segmentViews: SegmentViews) {
  return {
    unsplit: segmentViews.unsplit,
    collapsed: {
      byResponse: unMapSegmentMapR(segmentViews.collapsed.byResponse),
      byResponseAndParty: unMapSegmentMapRP(
        segmentViews.collapsed.byResponseAndParty
      ),
      byResponseAndWave: unMapSegmentMapRW(
        segmentViews.collapsed.byResponseAndWave
      ),
      byResponseAndWaveAndParty: unMapSegmentMapRWP(
        segmentViews.collapsed.byResponseAndWaveAndParty
      ),
    },
    expanded: {
      byResponse: unMapSegmentMapR(segmentViews.expanded.byResponse),
      byResponseAndParty: unMapSegmentMapRP(
        segmentViews.expanded.byResponseAndParty
      ),
      byResponseAndWave: unMapSegmentMapRW(
        segmentViews.expanded.byResponseAndWave
      ),
      byResponseAndWaveAndParty: unMapSegmentMapRWP(
        segmentViews.expanded.byResponseAndWaveAndParty
      ),
    },
  };
}
export function unMapPointsMap(pointsMap: PointsMap) {
  return [...pointsMap.entries()]
    .map(([rg, rgVal]: [string[], Map<number, Map<string[], PointsViews> | null>]) => [
      rg,
      [...rgVal.entries()]
        .map(([wave, waveVal]: [number, Map<string[], PointsViews> | null]) => [
          wave,
          waveVal === null ? null : unMapMap(waveVal),
        ]),
    ]) as UnMap<
      string[],
      UnMap<
        number,
        null | UnMap<string[], PointsViews>
      >
    >;
}
