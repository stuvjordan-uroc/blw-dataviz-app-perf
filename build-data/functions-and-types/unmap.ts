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
  return Object.fromEntries(Object.entries(pAndC).map(([groupedState, gsVal]) => ([
    groupedState as GroupedState,
    gsVal.entries().toArray().map(([rg, rgVal]) => ([
      rg,
      {
        ...rgVal,
        waveSplit: rgVal.waveSplit.entries().toArray().map(([wave, waveVal]) => ([
          wave,
          waveVal === null ? null :
            {
              ...waveVal,
              partySplit: waveVal.partySplit.entries().toArray()
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
        partySplit: rgVal.partySplit.entries().toArray() as [string[], { p: number, c: number }][]
      }
    ]))
  ]))) as PAndCUnMapped
}
export function unMapMap<T, K>(map: Map<T, K>): UnMap<T, K> {
  return map.entries().toArray()
}
export function unMapSegmentMapR(segmentMapR: SegmentMapR) {
  return unMapMap(segmentMapR)
}
export function unMapSegmentMapRP(segmentMapRP: SegmentMapRP) {
  return segmentMapRP
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [rg, unMapMap(rgVal)]) as UnMap<string[], UnMap<string[], Segment>>;
}
export function unMapSegmentMapRW(segmenMapRW: SegmentMapRW) {
  return segmenMapRW
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [rg, unMapMap(rgVal)]) as UnMap<string[], UnMap<number, null | Segment>>;
}
export function unMapSegmentMapRWP(segmentMapRWP: SegmentMapRWP) {
  return segmentMapRWP
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [
      rg,
      rgVal
        .entries()
        .toArray()
        .map(([wave, waveVal]) => [
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
  return pointsMap
    .entries()
    .toArray()
    .map(([rg, rgVal]) => [
      rg,
      rgVal
        .entries()
        .toArray()
        .map(([wave, waveVal]) => [
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
